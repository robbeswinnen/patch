# Known issues before wider use

This file separates the launch hardening completed during recovery from longer-term engineering work.

## Release hardening completed

Report accept/reject buttons and modal submissions now fail closed unless the interaction occurs in the configured `SUPPORT_REPORT_CHANNEL_ID`. Discord channel permissions remain the staff access boundary; review actions in child threads are intentionally rejected.

Automatically accepted duplicate reports now record the submitted and accepted reputation increments in one read-modify-write instead of racing two writes to the same key.

The ban watcher no longer credits duplicate reporters twice when a ban is confirmed. Focused regression tests cover all three release fixes.

## Fix before growing traffic

Several reputation, cooldown, moderation, and lookup counters still use KV read-modify-write operations. Cloudflare KV is not a transactional counter store, so truly concurrent requests can overwrite one another. Move mutable counters to a transactional store such as a Durable Object or D1 before using them for high-stakes moderation or at larger scale.

`/track`, track refresh/remove controls, some `/dev` tasks, and a few stats/profile component paths perform API or KV work before sending Discord's initial acknowledgement. A tracking refresh may fetch up to 25 players sequentially. Convert these paths to the deferred-response pattern already used by `/profile`, `/stats`, and `/compare`, then edit the original response after the work finishes.

One hourly cron run can attempt as many as 200 tracker profile requests plus 20 ban checks. That can exceed Cloudflare plan subrequest/CPU budgets and may take too long when upstream calls are slow. Process a smaller durable batch, persist a cursor, use controlled concurrency, and retry later. The scheduled Resvg warm-up also consumes CPU without reliably warming the isolate that handles the next request.

The Critical Ops API wrapper has a timeout and a small memory cache, but no shared rate limiter, `429` handling, exponential backoff, or circuit breaker. Add these before increasing command or cron volume.

## Product and data decisions

If posting a report to the staff channel fails after its KV record is created, there is no durable outbox/retry path. Reports and evidence URLs also have no retention/deletion policy beyond short-lived drafts. Decide what evidence is allowed, validate it more narrowly than arbitrary HTTP(S), define retention, and add staff-visible failure recovery.

Most KV data is global rather than guild-scoped. That is suitable only if Patch is intentionally one global bot service. If each Discord server should have separate tracking or moderation state, include the guild/application context in keys and migrate existing records.

Public tracking controls do not encode the dashboard owner. A different user clicking a shared dashboard can operate against their own tracker rather than the displayed owner's state. Include the owner ID in signed/validated component state or make refresh/remove controls private.

`refreshStaffReviewAnalytics` is an empty recovered function even though command and cron paths invoke it. Either implement the intended analytics behavior or remove the calls.

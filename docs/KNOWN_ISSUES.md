# Known issues before wider use

This file separates recovery fidelity from future engineering work. The items below existed in the deployed behavior and were intentionally left visible rather than silently redesigned.

## Fix before trusting moderation actions

The report accept/reject component and modal handlers do not independently verify a reviewer role, allow-list, guild, or the configured review channel. Their authorization currently depends on who can see and operate the Discord message. Add an explicit server-side authorization check before calling `acceptReport` or `rejectReport`.

Several reputation, cooldown, moderation, and lookup counters use KV read-modify-write operations. Cloudflare KV is not a transactional counter store, so concurrent writes to one key can overwrite each other. One concrete case is an automatically accepted duplicate report: `recordReportSubmitted` and `recordReportAccepted` update the same reputation key concurrently inside `Promise.all`. Serialize that update or move mutable counters to a transactional store such as a Durable Object or D1.

The ban watcher can credit a duplicate reporter twice. `markPendingReportBanConfirmed` already increments the pending report's reporter, after which `runBanWatcher` calls `recordReportBanConfirmed` for that same duplicate reporter again. Remove the second increment and add an idempotency test before using reputation for moderation decisions.

## Fix before growing traffic

`/track`, track refresh/remove controls, some `/dev` tasks, and a few stats/profile component paths perform API or KV work before sending Discord's initial acknowledgement. A tracking refresh may fetch up to 25 players sequentially. Convert these paths to the deferred-response pattern already used by `/profile`, `/stats`, and `/compare`, then edit the original response after the work finishes.

One hourly cron run can attempt as many as 200 tracker profile requests plus 20 ban checks. That can exceed Cloudflare plan subrequest/CPU budgets and may take too long when upstream calls are slow. Process a smaller durable batch, persist a cursor, use controlled concurrency, and retry later. The scheduled Resvg warm-up also consumes CPU without reliably warming the isolate that handles the next request.

The Critical Ops API wrapper has a timeout and a small memory cache, but no shared rate limiter, `429` handling, exponential backoff, or circuit breaker. Add these before increasing command or cron volume.

## Product and data decisions

If posting a report to the staff channel fails after its KV record is created, there is no durable outbox/retry path. Reports and evidence URLs also have no retention/deletion policy beyond short-lived drafts. Decide what evidence is allowed, validate it more narrowly than arbitrary HTTP(S), define retention, and add staff-visible failure recovery.

Most KV data is global rather than guild-scoped. That is suitable only if Patch is intentionally one global bot service. If each Discord server should have separate tracking or moderation state, include the guild/application context in keys and migrate existing records.

Public tracking controls do not encode the dashboard owner. A different user clicking a shared dashboard can operate against their own tracker rather than the displayed owner's state. Include the owner ID in signed/validated component state or make refresh/remove controls private.

`refreshStaffReviewAnalytics` is an empty recovered function even though command and cron paths invoke it. Either implement the intended analytics behavior or remove the calls.

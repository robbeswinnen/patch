# Patch — recovered Critical Ops Discord bot

This is an organized, runnable recovery of the Patch Discord bot. Patch looks up Critical Ops players, renders profile cards, compares statistics, tracks ranked changes, accepts community reports, and serves a small homepage from one Cloudflare Worker.

The deployed runtime logic and all custom image assets were recovered from Cloudflare Worker version 115. The earlier clean source in the public `robbeswinnen/patch` repository was used as a cross-check and to recover trustworthy TypeScript interfaces. The original source map was not present in the downloadable Worker archive, so comments, formatting, local variable names changed by bundling, and most TypeScript annotations could not be restored exactly. Recovered runtime modules are therefore marked `@ts-nocheck`; new typed files still use strict TypeScript. See [docs/RECOVERY_NOTES.md](docs/RECOVERY_NOTES.md) for the exact recovery boundary.

## Start here

Use Node.js 20 or newer and pnpm. From this folder:

```sh
corepack enable
pnpm install
cp .dev.vars.example .dev.vars
pnpm cf-typegen
pnpm check
pnpm dev
```

Fill `.dev.vars` with development credentials before testing signed Discord requests. A normal browser can open the local Wrangler URL without Discord credentials and will see the homepage. The test suite uses a local KV namespace and never connects to the production namespace.

To register the slash commands, copy `.env.example` to `.env`, fill `DISCORD_APPLICATION_ID` and either `DISCORD_BOT_TOKEN` or the legacy `DISCORD_TOKEN`, then run:

```sh
pnpm register
```

Registration replaces the application's global command definitions with the recovered set: `/profile`, `/report`, `/stats`, `/track`, `/help`, `/compare`, and `/dev`.

## How the bot fits together

`src/index.ts` is the front door. Browser `GET`/`HEAD` requests render the homepage, signed Discord `POST` requests enter the interaction router, and the hourly cron invokes tracker, ban-watcher, and monthly-recap jobs.

The slash commands live in `src/commands/`. `/profile` renders a PNG card; `/stats` builds interactive stat views; `/compare` compares two current-season profiles; `/track` stores per-user snapshots; `/report` runs the evidence and staff-review flow; `/help` explains the controls; and `/dev` contains allow-listed maintenance tools.

Reusable behavior lives in `src/lib/`. The most important files are `cops.ts` for Critical Ops API parsing, `discord.ts` for Discord protocol calls, `storage.ts` for every KV record, `components-v2.ts` plus `app-ui.ts` for the interface, and `card-image.ts` for SVG-to-PNG profile cards. The complete request flows, module-by-module guide, KV schema, and recommended reading order are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

The marketing homepage lives in `src/site/`. Its visual system adapts the glass navigation, light/dark cyan-to-navy themes, ribbon-gradient hero, alternating feature layout, and compact cards from the Pijon site, while all content and previews describe Patch's real bot features. `src/lib/homepage.ts` is the small Worker response/router around that site.

```text
src/
  index.ts             Worker entry point and router
  commands/            Slash commands and their component/modal handlers
  lib/                 API, Discord, UI, storage, cards, tracking, reports
  site/                Patch homepage template, theme, browser script, and assets
  assets/              Exact deployed rank and homepage artwork
test/                   Local Worker integration tests
docs/                   Architecture, recovery notes, and known issues
  recovery/               Exact deployed bundle and reconstruction manifests
  archive/                Earlier public-only code and superseded documentation
register.js             Global Discord command registration script
wrangler.jsonc          Cloudflare Worker, KV, cron, and asset configuration
```

## Before deploying

Read [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md). In particular, report-review authorization, KV counter races, slow tracking interactions, and the amount of hourly cron work should be addressed before expanding usage.

For the exact keep/change/add decision for every Cloudflare binding, read [docs/CLOUDFLARE_VARIABLES.md](docs/CLOUDFLARE_VARIABLES.md). Existing encrypted Discord values do not need to change for a website update.

The old hard-coded Discord invite now points to an unrelated server. The new website safely falls back to the project documentation, while the bot retains its deployed fallback for strict behavior parity. Set a current dashboard `SUPPORT_SERVER_URL` before deployment. Also verify the dashboard developer IDs and report-channel ID, plus the KV namespace in `wrangler.jsonc`, belong to the intended bot.

For the existing Worker, authenticate Wrangler and deploy without touching its encrypted rows:

```sh
pnpm wrangler login
pnpm deploy
```

Only a new Worker/environment or an intentional credential rotation needs `wrangler secret put`. The existing deployment uses the legacy secret name `DISCORD_TOKEN`; the code accepts both names, and adding a different `DISCORD_BOT_TOKEN` would override it. `keep_vars: true` preserves dashboard-managed Text variables, while normal deployments preserve encrypted secrets. No secret values are included in this recovery.

## Adding a feature

For a new slash command, copy the small `{ definition, handle }` pattern from `src/commands/help.ts`, export the module, add it to `src/commands/index.ts`, run `pnpm register`, and add a test. Reuse `cops.ts` for player data rather than parsing the upstream response again. Put new KV keys and normalizers in `storage.ts`. For interactive controls, build IDs with `components-v2.ts` and route their scope/action from `src/index.ts` or the owning command handler.

Run `pnpm check` after code changes and `pnpm wrangler deploy --dry-run` before a real deployment.

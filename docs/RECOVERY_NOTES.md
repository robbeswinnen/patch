# Recovery notes

## What was recovered

The primary source was the exact module archive downloaded read-only from the active Cloudflare Worker deployment on 2026-08-15. It identifies Worker version 115 (`7a2bcac9-7917-42cf-b269-af683dca6e37`), uploaded on 2026-06-12, with compatibility date `2026-05-13` and `nodejs_compat` enabled.

The archive contained one generated `index.js` module plus 17 binary modules: Resvg's WASM binary, two JetBrains Mono fonts, nine Critical Ops rank images, and five homepage/game images. The application bundle retained `// src/...` module markers, allowing its 26 logical TypeScript modules to be separated and their imports/exports reconstructed. `recovery/deployed-index.js` is the untouched deployed JavaScript; `recovery/reconstruction-report.json` records the recovered module boundaries.

The public repository at `https://github.com/robbeswinnen/patch` and commit `e75ced277e48c4309a55f4edbd4b8ff0eab39c48` were used as a clean baseline and identity check. The Cloudflare deployment was newer and divergent, so the deployed behavior wins wherever they differ.

## Exact and reconstructed parts

The Critical Ops/Discord behavior, strings, constants, and custom image bytes come from the deployed archive. Package imports replace the bundled copies of `discord-interactions`, `@resvg/resvg-wasm`, and JetBrains Mono. Configuration was rebuilt from the active deployment metadata, the public baseline, and current Wrangler output.

The archive did not include the original `index.js.map`. Cloudflare stores uploaded source maps separately from the Worker bundle, and the dashboard download exposed neither the map nor its `sourcesContent`. That means original comments, formatting, TypeScript-only declarations, and annotations erased by the compiler are not recoverable from this artifact. Most recovered modules consequently start with `@ts-nocheck` instead of pretending that guessed types are exact. `src/types.ts`, asset declarations, strict project settings, and generated Worker bindings provide a safe base for restoring types incrementally. The source map created by a new local build describes this recovered tree; it is not the missing original map.

## Deliberate changes from version 115

The website is the primary intentional runtime redesign. It validates configured links and falls back to the public project repository. The release also adds narrow safety fixes for staff-channel report reviews, duplicate reputation accounting, bounded interaction bodies, and support-link propagation into profile cards. The intended permanent support invite is configured as `SUPPORT_SERVER_URL` in `wrangler.jsonc`.

The project also adds current tests, examples, generated bindings, documentation, formatting, and package scripts. After the initial recovery, the homepage was deliberately redesigned using the user's Pijon site as its visual reference. Its runtime adapter is now split from typed `src/site/` source; binary art is served through cacheable Worker routes, configured URLs reject unsafe schemes, and the page sends a restrictive Content Security Policy. The Discord interaction behavior remains the recovered implementation. Known behavioral and scaling problems are recorded separately in [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

## Preserved history

The earlier public main branch contained `/clan`, `/tags`, and promotion helpers that were absent from the deployed bundle. Those files are preserved under `archive/public-main-only/` but are not imported or registered. The old public documentation is under `archive/public-main-docs/`; it described that earlier feature set and would be misleading as the primary documentation for this recovery.

## Secrets and live state

No Discord token, public-key value, or application-ID value was recovered or written into this project. The deployment metadata only reveals that those secret bindings exist. The production KV contents were not downloaded or changed. `wrangler.jsonc` retains the existing KV namespace ID so a future authorized deployment can continue using that state; local tests explicitly substitute an isolated local KV namespace.

# Cloudflare variables and secrets

For the existing `discord-bot` Worker and the same Discord application, do not rotate or re-enter the encrypted values just because the source or website changed. The screenshot shows binding names, not their values, and a normal Wrangler deployment does not delete existing secrets.

## Keep these values

| Binding                      | Type         | What to do                                | Why                                                                                                                                                              |
| ---------------------------- | ------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DISCORD_APPLICATION_ID`     | Secret today | Keep unchanged                            | Identifies the Discord application, edits deferred replies, and builds the default install URL. It is a public identifier, but leaving it encrypted is harmless. |
| `DISCORD_PUBLIC_KEY`         | Secret today | Keep unchanged                            | Verifies every Discord interaction. It is also public by design, but Secret storage is harmless.                                                                 |
| `DISCORD_TOKEN`              | Secret       | Keep unchanged and private                | Authenticates bot REST calls, DMs, report posts, and command registration. The recovered code accepts this legacy name.                                          |
| `DEVELOPER_DISCORD_USER_IDS` | Text         | Verify every listed user                  | This comma-separated allow-list is the authorization gate for the global `/dev` command. Remove anyone who should no longer have that access.                    |
| `SUPPORT_REPORT_CHANNEL_ID`  | Text         | Keep only if the channel is still correct | Report review messages and community recaps are sent to this channel. The bot needs permission to post there.                                                    |
| `USER_PREFERENCES`           | KV binding   | Keep the existing namespace               | Trackers, reports, tags, lookup counts, onboarding, and card-cache records live there. Rebinding it would make the existing data appear missing.                 |

Do not add a different `DISCORD_BOT_TOKEN` while the working `DISCORD_TOKEN` exists: the code prefers `DISCORD_BOT_TOKEN`, so a wrong new value would override the working legacy secret. Rename only if you know the token value: create `DISCORD_BOT_TOKEN` with that same value, test it, then delete `DISCORD_TOKEN`.

If the token is no longer saved anywhere outside Cloudflare, website changes still do not require a reset. A reset is needed only when the token was exposed/revoked or when you need it locally for `pnpm register`; Cloudflare will not reveal an encrypted value after creation.

## Website Text variables

Add these as **Text**, not Secret:

| Binding               | Recommendation                                                                                          | Fallback                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `SUPPORT_SERVER_URL`  | Configured in `wrangler.jsonc` with the permanent support invite; update it there if the invite changes | The public Patch repository.                                                                |
| `WEBSITE_URL`         | Configured in `wrangler.jsonc` with the production Worker URL; update it if a custom domain is adopted  | The current request origin.                                                                 |
| `PATCH_INVITE_URL`    | Optional; use the Discord-provided installation URL from the Developer Portal                           | Generated from `DISCORD_APPLICATION_ID` and the app's default user/server install settings. |
| `PROMO_KIT_URL`       | Optional and currently unused by the redesigned homepage                                                | No public promo-kit link.                                                                   |
| `REPORT_DM_IMAGE_URL` | Optional; unrelated to the website                                                                      | Report DMs render without the external banner.                                              |

`SUPPORT_SERVER_ID` is not referenced by the current source. It can be removed without changing behavior, or kept for a future server/staff authorization check. It does not replace `SUPPORT_SERVER_URL` because a Discord server ID is not a clickable invite.

## Dashboard-managed values

The support and website URLs are version-controlled non-secret values. You do not need to open or replace the three encrypted rows. `PATCH_INVITE_URL` can remain unset because the existing application ID generates the install link.

The project keeps `keep_vars: true` so Wrangler preserves dashboard-managed Text variables. Cloudflare also preserves encrypted secrets across ordinary code deployments. Bindings are target-specific, however: deploying under a new Worker name, account, or Wrangler environment requires configuring them again for that target.

For local development, copy `.dev.vars.example` to `.dev.vars` and use test credentials. Never commit `.dev.vars` or `.env`.

Current Cloudflare references: [Secrets](https://developers.cloudflare.com/workers/configuration/secrets/), [environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/), and [Wrangler deployment behavior](https://developers.cloudflare.com/workers/wrangler/commands/workers/).

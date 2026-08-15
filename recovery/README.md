# Recovery evidence

This directory keeps enough evidence to audit the reconstruction without including Cloudflare credentials or live KV data.

- `deployed-index.js` is the untouched JavaScript module from active Worker version 115.
- `cloudflare-content-manifest.json` lists every module in the downloaded archive and its byte size.
- `reconstruction-report.json` lists the 26 logical application modules identified by the bundle's retained `src/...` markers.
- `deployment-metadata.json` is a sanitized summary of the active version and binding names. Secret values were never exposed.
- `public-baseline-package-lock.json` preserves dependency-resolution context from the earlier public baseline.

The raw multipart download, generated dependencies, and a newly built `dist/` are intentionally excluded. They are reproducible from the files above and would add several megabytes without recovering the missing original TypeScript source map.

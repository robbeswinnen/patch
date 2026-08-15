---
label: Hosting
icon: globe
order: 10
description: Publish the Retype docs for free with GitHub Pages and no domain.
image: static/patch-card-preview.svg
---

# Host the docs for free

These docs live in a separate Retype project folder: `docs/`.

You do not need a separate GitHub repository. The workflow in `.github/workflows/retype-docs.yml` builds `docs/retype.yml` and publishes the finished website to a `retype` branch. GitHub Pages can host that branch for free at a `github.io` address.

!!!info No domain needed
Your free URL will look like:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/
```

!!!

## One-time setup

> > > Put the repo on GitHub
> > > Create a GitHub repository and push this project to it.

If you want the simplest free setup, make the repository public.

> > > Update the Retype URL
> > > Open `docs/retype.yml`.

Find this line:

```yaml
url: example.github.io/patch-docs/
```

Replace the example with your real GitHub Pages URL:

```yaml
url: YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/
```

> > > Push to `main`
> > > Commit and push the docs files and workflow.

GitHub Actions will run `Publish Patch docs`.

> > > Wait for the `retype` branch
> > > The workflow creates or updates a branch named `retype`. That branch contains only the built static website.

> > > Turn on GitHub Pages
> > > Go to:

```text
https://github.com/YOUR-GITHUB-USERNAME/YOUR-REPOSITORY/settings/pages
```

Choose:

| Setting | Pick this            |
| ------- | -------------------- |
| Source  | Deploy from a branch |
| Branch  | `retype`             |
| Folder  | `/root`              |

Save it, then enable HTTPS if GitHub offers the checkbox.

> > > Open the site
> > > Visit:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/
```

The first publish can take a few minutes. GitHub is fast, but not instant soup.

> > >

## Updating the docs later

Edit Markdown files in `docs/`, push to `main`, and the workflow republishes the site.

## Preview locally

+++ npm

```bash
cd docs
npm install
npm run start
```

+++ npx without installing

```bash
cd docs
npx retypeapp start
```

+++ build only

```bash
cd docs
npm run build
```

+++

The generated local output goes into `docs/.retype/`, which is ignored by Git.

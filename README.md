# demos.timeplus.com

The site published at [demos.timeplus.com](https://demos.timeplus.com) is the **Timeplus Apps catalog** — a
single static page that lists the installable `.tpapp` streaming pipelines you can run inside the Timeplus app.

There is no build step and no framework. `docs/index.html` is plain HTML/CSS/JS that fetches the app registry
at runtime, so the catalog always reflects the latest apps release.

## How it stays in sync

The catalog reads the registry directly from the
[`timeplus-io/apps`](https://github.com/timeplus-io/apps) repository:

```
https://raw.githubusercontent.com/timeplus-io/apps/main/registry/index.json
```

When a new app is released in that repo, its release workflow regenerates `registry/index.json` and commits it
back to `main`. Because this page fetches that file on every load (with `cache: "no-store"`), **new apps appear
automatically — this repo needs no rebuild or redeploy.**

## Editing the page

Edit `docs/index.html` directly and open it in a browser to preview. Keep it close to the upstream copy in
`timeplus-io/apps/docs/index.html`; the only intentional difference here is the `cache: "no-store"` fetch
option that guarantees visitors never see a stale catalog from their browser cache.

## Deployment

The site is hosted on **Netlify**, configured by `netlify.toml`:

- Publish directory: `docs/`
- Build command: none (the folder is served as-is)

Any change merged into `main` is deployed automatically; the DNS for `demos.timeplus.com` is unchanged.

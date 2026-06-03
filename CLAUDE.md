# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`demos.timeplus.com` is a **single static page** — the Timeplus Apps catalog. The entire site is
`docs/index.html` (plain HTML/CSS/JS, no framework, no build step). It was previously a React/Vite SPA; that
was removed when the live demo k8s cluster was retired in favor of installable Timeplus apps.

## Architecture

- `docs/index.html` — the whole site. Inline `<style>` and `<script>`; no dependencies, no bundler.
- At runtime it fetches the app registry from
  `https://raw.githubusercontent.com/timeplus-io/apps/main/registry/index.json` and renders one card per app
  (search, category/support-type filters, pagination, `.tpapp` download links).
- `netlify.toml` — publishes `docs/` with no build command.

## How the catalog stays current

Do **not** hardcode or vendor the app list here. The catalog is data-driven:

- The [`timeplus-io/apps`](https://github.com/timeplus-io/apps) release workflow regenerates
  `registry/index.json` and commits it to `main` on every release.
- This page fetches that file on each load with `cache: "no-store"`, so new apps appear automatically — this
  repo needs no rebuild or redeploy.

## Editing

- Edit `docs/index.html` and open it in a browser to verify (no dev server / install step).
- Keep it byte-close to the upstream `timeplus-io/apps/docs/index.html`. The only intentional divergence is the
  `cache: "no-store"` option on the registry `fetch` (see `load()`).
- The browser tab title is "Timeplus Apps Catalog"; brand it is "Timeplus Apps" — keep this branding.

## Deployment

Netlify auto-deploys `main`. Publish dir `docs/`, no build command (`netlify.toml`). DNS for the domain is
managed in Netlify and is unchanged by code edits.

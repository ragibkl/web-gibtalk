# web-gibtalk

The website for [GibTalk](https://github.com/ragibkl/GibTalk), a free AAC app, at
[gibtalk.com](https://gibtalk.com).

Built with [Astro](https://astro.build) as a static site, served by nginx.

- `/` - what GibTalk is, and where to get it
- `/builder/` - the template builder. "Start from a template…" lists the
  ready-made word sets live from api.gibtalk.com (`/api/templates`), so a new
  template shows up without rebuilding the site (the list baked in at build
  time is only a fallback). `/templates/` redirects here
- `/symbols/` - symbol search, API docs, and the symbol libraries' licences
- `/privacy/` - the app's privacy policy

## Develop

```sh
npm install
npm run dev
```

`npm run build` type-checks and builds to `dist/`. `npm run fmt` runs
Prettier.

## Deploy

Pushing to `master` builds `ghcr.io/ragibkl/web-gibtalk:sha-<short>`. The
cluster runs it through [flux-deploy](https://github.com/ragibkl/flux-deploy).

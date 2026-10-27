# web-gibtalk

The website for [GibTalk](https://github.com/ragibkl/GibTalk), a free AAC app, at
[gibtalk.com](https://gibtalk.com).

Built with [Astro](https://astro.build) as a static site, served by nginx.

- `/` - what GibTalk is, and where to get it
- `/templates/` - the ready-made word sets, read at build time from
  api.gibtalk.com (`/api/templates`). The builder's "Start from a template"
  is baked in at build time too, pictures included, so after a template or
  its pictures change on the API, deploy a new image of this site (a new
  commit; the manual workflow run rebuilds the same image tag)
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

# web-gibtalk

The website for [GibTalk](https://github.com/ragibkl/GibTalk), a free AAC app, at
[gibtalk.com](https://gibtalk.com).

Built with [Astro](https://astro.build) as a static site, served by nginx.

- `/` - what GibTalk is, and where to get it
- `/templates/` - the ready-made word sets, read at build time from
  api.gibtalk.com (`/api/templates`): redeploy the site to list a new
  template (a new commit; a manual workflow run rebuilds the same image tag,
  which doesn't roll out). The builder opens a template's words and pictures
  from the API in the browser, so changes to an existing template show up
  there without a rebuild
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

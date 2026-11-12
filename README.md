# web-gibtalk

The website for [GibTalk](https://github.com/ragibkl/GibTalk), a free AAC app, at
[gibtalk.com](https://gibtalk.com).

Built with [Astro](https://astro.build) as a static site, served by nginx.

- `/` - what GibTalk is, and where to get it
- `/manual/` - how to use the app, and the web app
- `/support/` - questions and answers
- `/symbols/` - symbol search, API docs, and the symbol libraries' licences
- `/privacy/` - the app's privacy policy

The template builder and the AI guide were retired in November 2026: the web
app at [app.gibtalk.com](https://app.gibtalk.com)
([ragibkl/app-gibtalk](https://github.com/ragibkl/app-gibtalk)) replaces the
builder. nginx redirects `/builder/` and `/templates/` there, and `/ai/` to
the home page.

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

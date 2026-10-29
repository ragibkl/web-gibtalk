// @ts-check
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://gibtalk.com",
  integrations: [preact(), sitemap()],
  // The templates page was folded into the builder (2026-10-29).
  redirects: { "/templates": "/builder/" },
  // Compression drops the space between a line of text and a link that starts
  // the next line. The pages are small, and nginx gzips them anyway.
  compressHTML: false,
  // Dev and preview run behind the Coder workspace proxy, whose hostnames vary.
  // Production is served by nginx, so this has no effect there.
  server: { allowedHosts: true },
});

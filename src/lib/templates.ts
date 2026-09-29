// Ready-made word sets, read at build time from the same place the app reads
// them: templates/ in the GibTalk repo. Rebuild the site to pick up new ones.
import YAML from "yaml";

import { SITE } from "./site";

export type Word = {
  label: string;
  language?: string;
  uri?: string;
  children?: Word[];
};

export type Template = {
  name: string;
  description: string;
  author: string;
  file: string;
  words: Word[];
};

type IndexItem = {
  name: string;
  description: string;
  author: string;
  uri: string;
};

async function get(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.text();
}

let cache: Promise<Template[]> | undefined;

export function getTemplates(): Promise<Template[]> {
  cache ??= (async () => {
    const index = YAML.parse(
      await get(`${SITE.templatesBase}/index.yaml`),
    ) as IndexItem[];
    return Promise.all(
      index.map(async (item) => {
        const url = item.uri.startsWith("./")
          ? `${SITE.templatesBase}/${item.uri.slice(2)}`
          : item.uri;
        const words = YAML.parse(await get(url)) as Word[];
        return {
          name: item.name,
          description: item.description,
          author: item.author,
          file: url,
          words,
        };
      }),
    );
  })();
  return cache;
}

/** Every word in a set, including those inside folders. */
export function countWords(words: Word[]): number {
  return words.reduce((n, w) => n + 1 + countWords(w.children ?? []), 0);
}

export const LANGUAGES: Record<string, string> = {
  en: "English",
  ms: "Malay",
};

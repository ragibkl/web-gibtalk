// Ready-made word sets, read at build time from the GibTalk symbols API (the
// same templates the app offers). Rebuild the site to pick up new ones.
import { SITE } from "./site";

export type Word = {
  label: string;
  language?: string;
  uri?: string;
  children?: Word[];
};

type TemplateSummary = {
  id: string;
  name: string;
  description: string;
  author: string;
  language: string;
  words: number;
  url: string;
};

export type Template = Omit<TemplateSummary, "words"> & {
  wordCount: number;
  words: Word[];
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return (await res.json()) as T;
}

let cache: Promise<Template[]> | undefined;

export function getTemplates(): Promise<Template[]> {
  cache ??= (async () => {
    const list = await getJson<TemplateSummary[]>(`${SITE.api}/api/templates`);
    return Promise.all(
      list.map(async (summary) => {
        const { words } = await getJson<{ words: Word[] }>(summary.url);
        return { ...summary, wordCount: summary.words, words };
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

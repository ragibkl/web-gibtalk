// The template list from the GibTalk symbols API (the same templates the app
// offers). The builder fetches it live in the browser; this build-time copy is
// only its fallback if the API can't be reached.
import { SITE } from "./site";

export type TemplateOption = { name: string; description: string; url: string };

export const TEMPLATES_URL = `${SITE.api}/api/templates`;

export async function getTemplates(): Promise<TemplateOption[]> {
  const res = await fetch(TEMPLATES_URL);
  if (!res.ok) throw new Error(`${res.status} fetching ${TEMPLATES_URL}`);
  const list = (await res.json()) as TemplateOption[];
  return list.map(({ name, description, url }) => ({ name, description, url }));
}

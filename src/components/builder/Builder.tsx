// The template builder: make a set of GibTalk words in the browser, and
// download it as a file the app can restore. Nothing is uploaded; only symbol
// searches leave the browser.
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import {
  APP_LANGUAGES,
  type BuilderWord,
  type Language,
  countWords,
  incomplete,
  newId,
  parseWords,
  stringifyWords,
} from "../../lib/wordfile";
import SymbolSearch from "./SymbolSearch";
import { photoToDataUri } from "./photo";

export type TemplateOption = { name: string; description: string; url: string };

type Props = { templates: TemplateOption[] };

type Draft = { name: string; words: BuilderWord[] };

const DRAFT_KEY = "gibtalk-builder-draft";

// Browser voices use standard codes; the app's "tu" is Telugu ("te").
const SPEECH_LANG: Record<Language, string> = {
  en: "en",
  ms: "ms",
  id: "id",
  zh: "zh",
  ta: "ta",
  tu: "te",
};

/** The words inside the folder at `path` (a list of folder ids). */
function listAt(words: BuilderWord[], path: string[]): BuilderWord[] {
  let list = words;
  for (const id of path) {
    list = list.find((w) => w.id === id)?.children ?? [];
  }
  return list;
}

/** A copy of `words` with the list at `path` replaced by `fn(list)`. */
function updateAt(
  words: BuilderWord[],
  path: string[],
  fn: (list: BuilderWord[]) => BuilderWord[],
): BuilderWord[] {
  if (!path.length) return fn(words);
  const [head, ...rest] = path;
  return words.map((w) =>
    w.id === head
      ? { ...w, children: updateAt(w.children ?? [], rest, fn) }
      : w,
  );
}

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "gibtalk-words"
  );
}

function plural(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Draft;
    return Array.isArray(draft.words) ? draft : null;
  } catch {
    return null;
  }
}

export default function Builder({ templates }: Props) {
  const [name, setName] = useState("");
  const [words, setWords] = useState<BuilderWord[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastLanguage, setLastLanguage] = useState<Language>("en");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Restore the draft this browser was working on.
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setName(draft.name ?? "");
      setWords(draft.words);
    }
    setLoaded(true);
  }, []);

  // Keep a draft, so closing the tab doesn't lose the work. Large sets with
  // many photos can outgrow browser storage; the work is still on the page.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, words }));
    } catch {
      // Ignore: storage full or blocked.
    }
  }, [name, words, loaded]);

  const list = listAt(words, path);
  const editing = list.find((w) => w.id === editingId) ?? null;
  const folders = useMemo(() => {
    const trail: BuilderWord[] = [];
    let current = words;
    for (const id of path) {
      const folder = current.find((w) => w.id === id);
      if (!folder) break;
      trail.push(folder);
      current = folder.children ?? [];
    }
    return trail;
  }, [words, path]);

  useEffect(() => {
    if (editingId) editorRef.current?.scrollIntoView({ block: "nearest" });
  }, [editingId]);

  const updateList = (fn: (l: BuilderWord[]) => BuilderWord[]) =>
    setWords((ws) => updateAt(ws, path, fn));

  const updateWord = (id: string, change: Partial<BuilderWord>) =>
    updateList((l) => l.map((w) => (w.id === id ? { ...w, ...change } : w)));

  const add = (folder: boolean) => {
    const word: BuilderWord = {
      id: newId(),
      label: "",
      uri: "",
      language: lastLanguage,
      ...(folder ? { children: [] } : {}),
    };
    updateList((l) => [...l, word]);
    setEditingId(word.id);
    setMessage("");
  };

  const move = (id: string, by: -1 | 1) =>
    updateList((l) => {
      const i = l.findIndex((w) => w.id === id);
      const j = i + by;
      if (i < 0 || j < 0 || j >= l.length) return l;
      const copy = [...l];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const remove = (word: BuilderWord) => {
    const inside = countWords(word.children ?? []);
    const question = inside
      ? `Delete the folder "${word.label || "Untitled"}" and the ${plural(inside, "word")} inside it?`
      : `Delete "${word.label || "Untitled"}"?`;
    if (!confirm(question)) return;
    updateList((l) => l.filter((w) => w.id !== word.id));
    setEditingId(null);
  };

  const openFolder = (id: string) => {
    setPath((p) => [...p, id]);
    setEditingId(null);
  };

  const replaceAll = (next: BuilderWord[], nextName: string, note: string) => {
    if (
      countWords(words) &&
      !confirm("Replace the words you have here? This can't be undone.")
    ) {
      return;
    }
    setWords(next);
    setName(nextName);
    setPath([]);
    setEditingId(null);
    setMessage(note);
  };

  const openFile = async (file: File) => {
    try {
      const opened = parseWords(await file.text());
      replaceAll(
        opened,
        file.name.replace(/\.ya?ml$/i, ""),
        `Opened ${file.name}: ${plural(countWords(opened), "word")}.`,
      );
    } catch {
      setMessage(
        `${file.name} isn't a GibTalk file. Choose a backup or template (.yaml).`,
      );
    }
  };

  const startFrom = async (template: TemplateOption) => {
    setMessage(`Loading ${template.name}…`);
    try {
      const res = await fetch(template.url);
      if (!res.ok) throw new Error(String(res.status));
      const opened = parseWords(await res.text());
      replaceAll(
        opened,
        template.name,
        `Started from ${template.name}. Change anything you like.`,
      );
    } catch {
      setMessage(`Couldn't load ${template.name}. Please try again.`);
    }
  };

  const startOver = () => replaceAll([], "", "Started a new set.");

  const download = () => {
    if (!words.length) {
      setMessage("Add some words first.");
      return;
    }
    const missing = incomplete(words);
    if (missing.length) {
      const names = missing
        .slice(0, 5)
        .map((w) =>
          w.label.trim() ? `"${w.label.trim()}"` : "an untitled word",
        )
        .join(", ");
      setMessage(
        `Every word needs a name and a picture. Still to finish: ${names}${missing.length > 5 ? ` and ${missing.length - 5} more` : ""}.`,
      );
      return;
    }
    const blob = new Blob([stringifyWords(words)], {
      type: "application/yaml",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug(name)}.yaml`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setMessage(`Downloaded ${a.download}.`);
  };

  const speak = (word: BuilderWord) => {
    if (!("speechSynthesis" in window) || !word.label.trim()) return;
    const u = new SpeechSynthesisUtterance(word.label);
    u.lang = SPEECH_LANG[word.language];
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };

  if (!loaded) return <p class="muted">Loading the builder…</p>;

  return (
    <div class="builder">
      <div class="card b-bar">
        <label class="b-name">
          <span>Name of this set</span>
          <input
            type="text"
            value={name}
            placeholder="For example: Swimming"
            onInput={(e) => setName(e.currentTarget.value)}
          />
        </label>
        <div class="b-actions">
          <button class="button green" type="button" onClick={download}>
            Download file
          </button>
          <label class="button plain">
            Open a file
            <input
              type="file"
              accept=".yaml,.yml,text/yaml,application/yaml"
              hidden
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                e.currentTarget.value = "";
                if (file) openFile(file);
              }}
            />
          </label>
          <select
            class="b-template"
            aria-label="Start from a template"
            value=""
            onChange={(e) => {
              const t = templates[Number(e.currentTarget.value)];
              if (t) startFrom(t);
            }}
          >
            <option value="">Start from a template…</option>
            {templates.map((t, i) => (
              <option value={String(i)}>{t.name}</option>
            ))}
          </select>
          <button class="button plain" type="button" onClick={startOver}>
            Start over
          </button>
        </div>
        <p class="muted b-message" aria-live="polite">
          {message ||
            `${plural(countWords(words), "word")}. Your work is kept in this browser until you start over.`}
        </p>
      </div>

      <nav class="b-crumbs" aria-label="Folders">
        <button
          type="button"
          class="link"
          aria-current={path.length ? undefined : "page"}
          onClick={() => {
            setPath([]);
            setEditingId(null);
          }}
        >
          Home
        </button>
        {folders.map((f, i) => (
          <>
            <span aria-hidden="true">›</span>
            <button
              type="button"
              class="link"
              aria-current={i === folders.length - 1 ? "page" : undefined}
              onClick={() => {
                setPath(path.slice(0, i + 1));
                setEditingId(null);
              }}
            >
              {f.label || "Untitled folder"}
            </button>
          </>
        ))}
      </nav>

      <div class="b-grid">
        {list.map((w) => (
          <div class="b-cell">
            <button
              type="button"
              class={`b-tile ${w.children ? "folder" : "word"}${w.id === editingId ? " selected" : ""}`}
              onClick={() => setEditingId(w.id === editingId ? null : w.id)}
              aria-pressed={w.id === editingId}
            >
              {w.uri ? (
                <img src={w.uri} alt="" width={96} height={96} />
              ) : (
                <span class="b-empty">No picture</span>
              )}
              <span class="b-label">{w.label || "Untitled"}</span>
            </button>
            {w.children && (
              <button
                type="button"
                class="link b-open"
                onClick={() => openFolder(w.id)}
              >
                Open ({countWords(w.children)})
              </button>
            )}
          </div>
        ))}
        <div class="b-adds">
          <button type="button" class="b-add word" onClick={() => add(false)}>
            + Word
          </button>
          <button type="button" class="b-add folder" onClick={() => add(true)}>
            + Folder
          </button>
        </div>
      </div>

      {editing && (
        <div class="card b-editor" ref={editorRef}>
          <h3>
            {editing.children ? "Folder" : "Word"}:{" "}
            {editing.label || "Untitled"}
          </h3>
          <div class="b-fields">
            <label>
              <span>{editing.children ? "Folder name" : "Word"}</span>
              <input
                type="text"
                value={editing.label}
                placeholder="What it says"
                onInput={(e) =>
                  updateWord(editing.id, { label: e.currentTarget.value })
                }
              />
            </label>
            <label>
              <span>Language</span>
              <select
                value={editing.language}
                onChange={(e) => {
                  const language = e.currentTarget.value as Language;
                  updateWord(editing.id, { language });
                  setLastLanguage(language);
                }}
              >
                {APP_LANGUAGES.map((l) => (
                  <option value={l.code}>{l.label}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              class="button plain b-hear"
              onClick={() => speak(editing)}
            >
              Hear it
            </button>
          </div>

          <h4>Picture</h4>
          <div class="b-picture">
            {editing.uri ? (
              <img src={editing.uri} alt="" width={96} height={96} />
            ) : (
              <span class="b-empty">No picture yet</span>
            )}
            <label class="button plain">
              Use a photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.currentTarget.files?.[0];
                  e.currentTarget.value = "";
                  if (!file) return;
                  try {
                    updateWord(editing.id, { uri: await photoToDataUri(file) });
                  } catch {
                    setMessage("That photo couldn't be read. Try another.");
                  }
                }}
              />
            </label>
          </div>
          <SymbolSearch
            key={editing.id}
            initial={editing.label}
            onPick={(uri) => updateWord(editing.id, { uri })}
          />

          <div class="b-editor-actions">
            <button
              type="button"
              class="button plain"
              onClick={() => move(editing.id, -1)}
              disabled={list[0]?.id === editing.id}
            >
              ‹ Move earlier
            </button>
            <button
              type="button"
              class="button plain"
              onClick={() => move(editing.id, 1)}
              disabled={list[list.length - 1]?.id === editing.id}
            >
              Move later ›
            </button>
            {editing.children && (
              <button
                type="button"
                class="button plain"
                onClick={() => openFolder(editing.id)}
              >
                Open folder
              </button>
            )}
            <button
              type="button"
              class="button danger"
              onClick={() => remove(editing)}
            >
              Delete
            </button>
            <button
              type="button"
              class="button"
              onClick={() => setEditingId(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

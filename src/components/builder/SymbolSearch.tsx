import { useEffect, useState } from "preact/hooks";

const API = "https://api.gibtalk.ragib.my";

type Props = { initial: string; onPick(uri: string): void };

export default function SymbolSearch({ initial, onPick }: Props) {
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  const search = async (query: string) => {
    const words = query.trim();
    if (!words) return;
    setStatus("Searching…");
    try {
      const res = await fetch(
        `${API}/api/symbols/search/?q=${encodeURIComponent(words)}`,
      );
      if (!res.ok) throw new Error(String(res.status));
      const found = ((await res.json()) as { url: string }[]).map((s) => s.url);
      setResults(found);
      setStatus(
        found.length
          ? `Tap a symbol to use it.`
          : `No symbols for "${words}". Try a simpler word.`,
      );
    } catch {
      setStatus("The search didn't work. Please try again.");
    }
  };

  // Search straight away for a word that already has a name.
  useEffect(() => {
    if (initial.trim()) search(initial);
  }, []);

  return (
    <div class="b-search">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          search(q);
        }}
      >
        <input
          type="search"
          value={q}
          placeholder="Search symbols"
          aria-label="Search symbols"
          onInput={(e) => setQ(e.currentTarget.value)}
        />
        <button class="button" type="submit">
          Search
        </button>
      </form>
      <p class="muted" aria-live="polite">
        {status}
      </p>
      {results.length > 0 && (
        <ul class="b-results">
          {results.map((url) => (
            <li>
              <button type="button" onClick={() => onPick(url)}>
                <img src={url} alt="" loading="lazy" width={80} height={80} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

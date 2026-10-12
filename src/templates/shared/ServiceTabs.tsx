"use client";
import { useId, useRef, useState, type KeyboardEvent } from "react";

export type TabService = { id: string; name: string; price?: string };
export type TabGroup = { id: string; label: string; services: TabService[] };

/** WAI-ARIA tabs: arrow keys move between categories, Home/End jump, panels stay readable without motion. */
export function ServiceTabs({ groups, bookUrl, bookLabel, embed = false }: { groups: TabGroup[]; bookUrl?: string; bookLabel?: string; embed?: boolean }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    const last = groups.length - 1;
    const next = e.key === "ArrowRight" ? (active === last ? 0 : active + 1) : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Service categories" onKeyDown={onKey} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {groups.map((g, i) => (
          <button
            key={g.id}
            ref={(el) => void (tabs.current[i] = el)}
            role="tab"
            type="button"
            id={`${base}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === i ? "border-ink bg-ink text-porcelain" : "border-line text-ink hover:border-ink"
            }`}
          >
            {g.label} <span className="opacity-60">{g.services.length}</span>
          </button>
        ))}
      </div>
      {groups.map((g, i) => (
        <div key={g.id} role="tabpanel" id={`${base}-panel-${i}`} aria-labelledby={`${base}-tab-${i}`} hidden={active !== i} tabIndex={0} className="mt-6 focus-visible:outline-offset-4">
          <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
            {g.services.map((s) => (
              <li key={s.id} className="flex items-baseline justify-between gap-4 rounded-2xl border border-line bg-card px-5 py-4">
                <span className="font-medium">{s.name}</span>
                {s.price && <span className="whitespace-nowrap text-sm text-muted">{s.price}</span>}
              </li>
            ))}
          </ul>
          {bookUrl && (
            <p className="mt-5 text-sm">
              <a href={bookUrl} target="_blank" rel="noopener noreferrer" data-book-embed={embed ? "" : undefined} className="font-semibold text-terra underline underline-offset-4">
                {bookLabel} — choose {g.label.toLowerCase()}
              </a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

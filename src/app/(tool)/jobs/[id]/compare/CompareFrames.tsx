"use client";
import { useState } from "react";

const ROUTES = ["", "services/", "team/", "gallery/", "visit/"];
const WIDTHS = { desktop: 1440, tablet: 768, mobile: 390 } as const;

export function CompareFrames({ jobId, templates }: { jobId: string; templates: { id: string; name: string }[] }) {
  const [device, setDevice] = useState<keyof typeof WIDTHS>("desktop");
  const [route, setRoute] = useState("");
  const width = WIDTHS[device];
  // Scale desktop frames down so two fit side by side.
  const scale = device === "desktop" ? 0.42 : device === "tablet" ? 0.62 : 0.9;

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-4">
        <div role="group" aria-label="Viewport" className="flex rounded-lg border border-tool-line bg-white p-1">
          {(Object.keys(WIDTHS) as (keyof typeof WIDTHS)[]).map((d) => (
            <button key={d} type="button" aria-pressed={device === d} onClick={() => setDevice(d)} className="rounded-md px-3 py-1.5 text-sm font-semibold aria-pressed:bg-tool-ink aria-pressed:text-white">
              {d} · {WIDTHS[d]}px
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          Page
          <select value={route} onChange={(e) => setRoute(e.target.value)} className="rounded-lg border border-tool-line bg-white px-2 py-1.5">
            {ROUTES.map((r) => <option key={r} value={r}>{r ? `/${r}` : "/ (home)"}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        {templates.map((t) => {
          const src = `/p/${jobId}/${t.id}/${route}`;
          return (
            <figure key={t.id} className="m-0">
              <figcaption className="mb-2 flex items-center justify-between text-sm">
                <b>{t.name}</b>
                <a href={src} target="_blank" rel="noopener" className="text-tool-accent hover:underline">Open full page ↗</a>
              </figcaption>
              <div className="overflow-hidden rounded-xl border border-tool-line bg-white" style={{ height: 900 * scale }}>
                <iframe
                  key={src + device}
                  src={src}
                  title={`${t.name} preview`}
                  style={{ width, height: 900, transform: `scale(${scale})`, transformOrigin: "0 0" }}
                  className="border-0"
                />
              </div>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

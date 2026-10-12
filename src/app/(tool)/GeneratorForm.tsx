"use client";
import { useActionState } from "react";
import { generate, type FormState } from "./actions";

const field = "mt-1 block w-full rounded-lg border border-tool-line bg-white px-3 py-2.5 outline-none focus:border-tool-accent focus:ring-2 focus:ring-tool-accent/20";

export function GeneratorForm({ placesReady, maxTemplates }: { placesReady: boolean; maxTemplates: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(generate, undefined);
  const err = (k: string) => state?.fieldErrors?.[k];

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-tool-line bg-white p-6 shadow-sm" noValidate>
      <div>
        <label htmlFor="mapsUrl" className="font-semibold">Google Maps link</label>
        <input id="mapsUrl" name="mapsUrl" type="url" inputMode="url" placeholder="https://maps.app.goo.gl/…" className={field} aria-describedby="mapsUrl-hint" aria-invalid={!!err("mapsUrl")} />
        <p id="mapsUrl-hint" className="mt-1 text-sm text-tool-muted">
          {placesReady ? "Open the business in Google Maps → Share → Copy link." : "Google Places API key not configured; Maps links will be skipped."}
        </p>
        {err("mapsUrl") && <p className="mt-1 text-sm text-red-700">{err("mapsUrl")}</p>}
      </div>
      <div>
        <label htmlFor="bookingUrl" className="font-semibold">Booking link</label>
        <input id="bookingUrl" name="bookingUrl" type="url" inputMode="url" placeholder="https://booksy.com/en-us/…" className={field} aria-describedby="bookingUrl-hint" aria-invalid={!!err("bookingUrl")} />
        <p id="bookingUrl-hint" className="mt-1 text-sm text-tool-muted">Booksy, Vagaro, Fresha, StyleSeat, Square… Supplies services, prices, team and the Book button.</p>
        {err("bookingUrl") && <p className="mt-1 text-sm text-red-700">{err("bookingUrl")}</p>}
      </div>
      <details className="rounded-lg border border-tool-line px-4 py-3">
        <summary className="cursor-pointer font-semibold">More sources (optional)</summary>
        <div className="mt-3">
          <label htmlFor="websiteUrl" className="font-semibold">Current website</label>
          <input id="websiteUrl" name="websiteUrl" type="url" inputMode="url" placeholder="https://…" className={field} />
          {err("websiteUrl") && <p className="mt-1 text-sm text-red-700">{err("websiteUrl")}</p>}
        </div>
      </details>
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <label htmlFor="templateCount" className="font-semibold">Templates</label>
          <input id="templateCount" name="templateCount" type="number" min={1} max={maxTemplates} defaultValue={2} className={`${field} w-28`} />
        </div>
        <label className="flex items-center gap-2 pb-3 text-sm text-tool-muted">
          <input type="checkbox" name="force" className="h-4 w-4" /> Re-run research even if this business was just generated
        </label>
      </div>
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
      <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center rounded-lg bg-tool-accent px-5 font-semibold text-white disabled:opacity-60">
        {pending ? "Researching the business…" : "Generate websites"}
      </button>
      <p aria-live="polite" className="text-sm text-tool-muted">{pending ? "Reading sources, matching identity, building templates. This usually takes 5–20 seconds." : ""}</p>
    </form>
  );
}

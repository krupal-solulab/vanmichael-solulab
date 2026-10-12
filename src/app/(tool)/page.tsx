import Link from "next/link";
import { connection } from "next/server";
import { listJobs } from "@/lib/store";
import { FAMILIES } from "@/lib/checks";
import { placesEnabled } from "@/lib/sources/places";
import { stockEnabled } from "@/lib/sources/stock";
import { GeneratorForm } from "./GeneratorForm";
import { StatusBadge } from "./ui";

export default async function GeneratorHome() {
  await connection();
  const jobs = await listJobs();
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Generate salon websites</h1>
        <p className="mt-2 max-w-[60ch] text-tool-muted">
          Paste a Google Maps listing and/or booking link. The generator reads the business&apos;s public listing, booking page and website,
          builds one verified record, and renders it as complete, distinct website designs.
        </p>
        <div className="mt-6"><GeneratorForm placesReady={placesEnabled()} maxTemplates={FAMILIES.length} /></div>
        <ul className="mt-6 space-y-1 text-sm text-tool-muted">
          <li>Google Places API: {placesEnabled() ? "configured" : <b className="text-amber-700">not configured (set GOOGLE_PLACES_API_KEY)</b>}</li>
          <li>Stock hero video (Pexels): {stockEnabled() ? "configured" : "not configured; heroes use still photos"}</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-bold">Designs available</h2>
        <ul className="mt-3 space-y-3">
          {FAMILIES.map((f) => (
            <li key={f.id} className="rounded-xl border border-tool-line bg-white p-4">
              <p className="font-semibold">{f.name}</p>
              <p className="text-sm text-tool-muted">{f.summary}</p>
            </li>
          ))}
        </ul>
        <h2 className="mt-10 text-lg font-bold">Recent jobs</h2>
        {jobs.length === 0 ? (
          <p className="mt-2 text-sm text-tool-muted">No jobs yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-tool-line rounded-xl border border-tool-line bg-white">
            {jobs.slice(0, 20).map((j) => (
              <li key={j.id}>
                <Link href={`/jobs/${j.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-tool-bg">
                  <span>
                    <span className="block font-semibold">{j.record?.name.value ?? "Failed job"}</span>
                    <span className="text-xs text-tool-muted">{new Date(j.createdAt).toLocaleString("en-US")} · v{j.contentVersion}</span>
                  </span>
                  <StatusBadge status={j.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

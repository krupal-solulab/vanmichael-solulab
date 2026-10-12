import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/store";
import { checkRecord, FAMILIES } from "@/lib/checks";
import { addressLine, groupHours } from "@/lib/normalize";
import { approve } from "../../actions";
import { Card, StatusBadge } from "../../ui";

const LEVEL = {
  blocker: { label: "Blocker", cls: "bg-red-50 text-red-800" },
  approval: { label: "Owner approval", cls: "bg-amber-50 text-amber-800" },
  info: { label: "Handled", cls: "bg-slate-100 text-slate-700" },
};

const APPROVE_FOR: Record<string, "prices" | "roster" | "assets" | "policies" | "about"> = {
  prices: "prices",
  roster: "roster",
  "assets-permission": "assets",
  policies: "policies",
  about: "about",
};

export default async function JobPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();
  const r = job.record;
  const checks = r ? checkRecord(r, job.input) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-tool-muted hover:underline">← All jobs</Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{r?.name.value ?? "Generation failed"}</h1>
          <p className="text-sm text-tool-muted">Job {job.id} · content v{job.contentVersion} · updated {new Date(job.updatedAt).toLocaleString("en-US")}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {job.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{job.error}</p>}
      {job.notices.length > 0 && (
        <ul className="space-y-2">
          {job.notices.map((n) => <li key={n} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{n}</li>)}
        </ul>
      )}

      {r && (
        <>
          <Card
            title="Templates"
            actions={
              <div className="flex gap-2 text-sm">
                <Link href={`/jobs/${job.id}/compare`} className="rounded-lg border border-tool-line px-3 py-1.5 font-semibold hover:bg-tool-bg">Compare side by side</Link>
                <Link href={`/jobs/${job.id}/edit`} className="rounded-lg border border-tool-line px-3 py-1.5 font-semibold hover:bg-tool-bg">Edit facts</Link>
              </div>
            }
          >
            <ul className="grid gap-4 md:grid-cols-2">
              {job.templates.map((t) => {
                const fam = FAMILIES.find((f) => f.id === t)!;
                return (
                  <li key={t} className="rounded-xl border border-tool-line p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{fam.name}</p>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="mt-1 text-sm text-tool-muted">{fam.summary}</p>
                    <a href={`/p/${job.id}/${t}/`} target="_blank" rel="noopener" className="mt-3 inline-block font-semibold text-tool-accent hover:underline">Open preview ↗</a>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-sm text-tool-muted">
              Both designs read the same record, so a fact edit updates every variant. Status reflects outstanding checks below; technical readiness and owner approval are tracked separately.
            </p>
          </Card>

          <Card title="Release checks">
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.id} className="flex flex-wrap items-start gap-3 rounded-lg border border-tool-line px-4 py-3">
                  <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${LEVEL[c.level].cls}`}>{LEVEL[c.level].label}</span>
                  <span className="min-w-0 flex-1 text-sm">{c.message}</span>
                  {APPROVE_FOR[c.id] && (
                    <form action={approve.bind(null, job.id, APPROVE_FOR[c.id])}>
                      <button className="rounded-md border border-tool-line px-2.5 py-1 text-xs font-semibold hover:bg-tool-bg">Mark owner-confirmed</button>
                    </form>
                  )}
                </li>
              ))}
              {checks.length === 0 && <li className="text-sm text-tool-muted">No outstanding checks.</li>}
            </ul>
            <p className="mt-3 text-xs text-tool-muted">Only mark items confirmed after the business owner has actually confirmed them. Approvals are recorded on the record.</p>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Business identity">
              <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-tool-muted">Name</dt><dd><Fact v={r.name.value} status={r.name.status} sources={r.name.evidence.map((e) => e.source)} /></dd>
                <dt className="text-tool-muted">Address</dt><dd><Fact v={addressLine(r.address.value)} status={r.address.status} sources={r.address.evidence.map((e) => e.source)} /></dd>
                <dt className="text-tool-muted">Phone</dt><dd>{r.phone ? <Fact v={r.phone.value} status={r.phone.status} sources={r.phone.evidence.map((e) => e.source)} /> : <em className="text-red-700">missing</em>}</dd>
                <dt className="text-tool-muted">Category</dt><dd>{r.category === "barber_shop" ? "Barbershop" : "Hair salon"}</dd>
                <dt className="text-tool-muted">Booking</dt><dd>{r.booking ? <a className="text-tool-accent hover:underline" href={r.booking.url} target="_blank" rel="noopener noreferrer">{r.booking.platform}</a> : <em className="text-red-700">missing</em>}</dd>
                <dt className="text-tool-muted">Ratings</dt><dd>{r.ratings.map((x) => `${x.value.toFixed(1)} (${x.count}) on ${x.label}`).join(" · ") || "—"}</dd>
                <dt className="text-tool-muted">Social</dt><dd>{Object.entries(r.social).filter(([, v]) => v).map(([k, v]) => <a key={k} href={v} className="mr-3 text-tool-accent hover:underline" target="_blank" rel="noopener noreferrer">{k}</a>)}{!Object.values(r.social).some(Boolean) && "none verified"}</dd>
                <dt className="text-tool-muted">Hours</dt>
                <dd>
                  {r.hours ? (
                    <>
                      <Fact v={groupHours(r.hours.value).map((h) => `${h.days}: ${h.time}`).join("; ")} status={r.hours.status} sources={r.hours.evidence.map((e) => e.source)} />
                      {r.hours.conflicts.length > 0 && <p className="mt-1 text-xs text-red-700">Conflicting hours from {r.hours.conflicts.map((c) => c.source).join(", ")}</p>}
                    </>
                  ) : "not found"}
                </dd>
              </dl>
            </Card>

            <Card title="Sources">
              <ul className="space-y-2 text-sm">
                {job.sources.map((s, i) => (
                  <li key={i} className="rounded-lg border border-tool-line px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{s.kind}</span>
                      <span className={s.status === "ok" ? "text-emerald-700" : s.status === "failed" ? "text-red-700" : "text-tool-muted"}>{s.status}</span>
                    </div>
                    <p className="truncate text-xs text-tool-muted">{s.url}</p>
                    {s.note && <p className="text-xs">{s.note}</p>}
                    <p className="text-xs text-tool-muted">{new Date(s.retrievedAt).toLocaleString("en-US")}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-3 text-sm">
                <a href={`/api/jobs/${job.id}/`} className="font-semibold text-tool-accent hover:underline">Download evidence record (JSON)</a>
                <a href={`/api/jobs/${job.id}/?view=manifest`} className="font-semibold text-tool-accent hover:underline">Media manifest</a>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title={`Services (${r.services.length})`}>
              <ul className="max-h-80 space-y-1 overflow-auto text-sm">
                {r.services.map((s) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span>{s.name}{s.name !== s.sourceName && <span className="text-xs text-tool-muted"> (source: {s.sourceName})</span>} <span className="text-xs text-tool-muted">· {s.category}</span></span>
                    <span className="whitespace-nowrap">{s.price ? `${s.price.qualifier === "from" ? "from " : ""}$${s.price.amount}` : "—"}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title={`Team (${r.providers.length}) & media (${r.assets.length})`}>
              <p className="text-sm">{r.providers.map((p) => p.name).join(", ") || "No roster found."}</p>
              <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {r.assets.filter((a) => a.kind === "photo").slice(0, 18).map((a) => (
                  <li key={a.id} title={`${a.permission} · ${a.alt}`} className="relative aspect-square overflow-hidden rounded-lg bg-tool-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.permission === "places-attribution" ? `/api/media/places/?name=${encodeURIComponent(a.src)}&w=300` : a.src} alt={a.alt} className="h-full w-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                    <span className={`absolute inset-x-0 bottom-0 px-1 text-[10px] font-semibold ${a.permission === "pending-owner" ? "bg-amber-400/90" : "bg-emerald-400/90"}`}>{a.permission}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Fact({ v, status, sources }: { v: string; status: string; sources: string[] }) {
  return (
    <span>
      {v}{" "}
      <span className={`ml-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ${status === "verified" || status === "owner-confirmed" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{status}</span>
      <span className="ml-1 text-[11px] text-tool-muted">{sources.join(" + ")}</span>
    </span>
  );
}

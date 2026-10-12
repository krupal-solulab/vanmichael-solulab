import { NextResponse } from "next/server";
import { getJob } from "@/lib/store";
import { checkRecord } from "@/lib/checks";

/** Evidence record and media manifest downloads (brief §14 handback). */
export async function GET(req: Request, ctx: RouteContext<"/api/jobs/[id]">) {
  const { id } = await ctx.params;
  const job = await getJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const view = new URL(req.url).searchParams.get("view");
  const headers = { "Content-Disposition": `attachment; filename="${job.id}-${view ?? "record"}-v${job.contentVersion}.json"` };

  if (view === "manifest") {
    const assets = (job.record?.assets ?? []).map((a) => ({
      id: a.id,
      kind: a.kind,
      classification: a.origin === "stock" ? "stock" : "actual-business",
      role: a.role,
      source: a.evidence.url,
      src: a.permission === "places-attribution" ? `google-places:${a.src}` : a.src,
      permission: a.permission,
      storage: a.permission === "places-attribution" ? "display-only via API; do not store" : a.permission === "pending-owner" ? "do not publish until owner approves" : "may be stored with credit",
      credit: a.credit?.text ?? null,
      alt: a.alt,
      retrievedAt: a.evidence.retrievedAt,
    }));
    return NextResponse.json({ job: job.id, contentVersion: job.contentVersion, assets }, { headers });
  }

  const checks = job.record ? checkRecord(job.record, job.input) : [];
  return NextResponse.json({ ...job, checks }, { headers });
}

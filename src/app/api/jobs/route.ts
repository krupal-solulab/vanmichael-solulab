import { NextResponse } from "next/server";
import { createJob } from "@/lib/jobs";
import { JobInput } from "@/lib/types";

/** JSON entry point for automation; same validation as the form. Protected by the proxy's basic auth. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = JobInput.safeParse(body ?? {});
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(" ") }, { status: 400 });
  try {
    const job = await createJob(parsed.data, { force: Boolean(body?.force) });
    return NextResponse.json({ id: job.id, status: job.status, templates: job.templates, previews: job.templates.map((t) => `/p/${job.id}/${t}/`), notices: job.notices, error: job.error }, { status: job.record ? 201 : 422 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Generation failed." }, { status: 500 });
  }
}

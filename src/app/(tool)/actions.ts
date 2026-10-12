"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createJob, updateRecord } from "@/lib/jobs";
import { getJob } from "@/lib/store";
import { BusinessRecord, JobInput } from "@/lib/types";

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

// Best-effort limit per server instance; the app is also behind basic auth (brief T10).
const recent = new Map<string, number[]>();
function rateLimited(key: string, limit = 6, windowMs = 60_000) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > limit;
}

export async function generate(_prev: FormState, form: FormData): Promise<FormState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) return { error: "Too many requests. Wait a minute and try again." };

  const parsed = JobInput.safeParse({
    mapsUrl: form.get("mapsUrl") ?? "",
    bookingUrl: form.get("bookingUrl") ?? "",
    websiteUrl: form.get("websiteUrl") ?? "",
    templateCount: form.get("templateCount") ?? 2,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] = issue.message;
    return { error: fieldErrors.form ?? "Check the highlighted fields.", fieldErrors };
  }

  let id: string;
  try {
    const job = await createJob(parsed.data, { force: form.get("force") === "on" });
    id = job.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Generation failed." };
  }
  revalidatePath("/");
  redirect(`/jobs/${id}`);
}

export async function saveFacts(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const job = await getJob(id);
  if (!job?.record) return { error: "Job not found." };

  let record: unknown;
  try {
    record = JSON.parse(String(form.get("record") ?? ""));
  } catch {
    return { error: "That is not valid JSON." };
  }
  const parsed = BusinessRecord.safeParse(record);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: `Invalid record at ${first.path.join(".") || "root"}: ${first.message}` };
  }
  await updateRecord(id, parsed.data);
  revalidatePath(`/jobs/${id}`);
  redirect(`/jobs/${id}`);
}

type Approval = "prices" | "roster" | "assets" | "policies" | "about" | "all-facts";

/** One-click owner confirmations, recorded as owner-confirmed rather than deleting the evidence. */
export async function approve(id: string, what: Approval): Promise<void> {
  const job = await getJob(id);
  if (!job?.record) return;
  const r = structuredClone(job.record);
  if (what === "prices" || what === "all-facts") r.services = r.services.map((s) => ({ ...s, status: "owner-confirmed" }));
  if (what === "roster" || what === "all-facts") r.providers = r.providers.map((p) => ({ ...p, status: "owner-confirmed" }));
  if (what === "assets") r.assets = r.assets.map((a) => (a.permission === "pending-owner" ? { ...a, permission: "owner-approved" } : a));
  if ((what === "policies" || what === "all-facts") && r.policies) r.policies.status = "owner-confirmed";
  if ((what === "about" || what === "all-facts") && r.about) r.about.status = "owner-confirmed";
  await updateRecord(id, r);
  revalidatePath(`/jobs/${id}`);
}

import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { research } from "./research";
import { checkRecord, FAMILIES, jobStatus } from "./checks";
import { findJobByKey, getJob, saveJob, setJobKey } from "./store";
import { slugify } from "./normalize";
import type { BusinessRecord, Job, JobInput, TemplateFamily } from "./types";

const DEDUPE_HOURS = 6;

export function inputKey(input: JobInput) {
  const norm = (u?: string) => (u ? u.trim().toLowerCase().replace(/\/$/, "").replace(/[?#].*$/, "") : "");
  return createHash("sha256").update([norm(input.mapsUrl), norm(input.bookingUrl), norm(input.websiteUrl), input.templateCount].join("|")).digest("hex").slice(0, 24);
}

export async function createJob(input: JobInput, opts: { force?: boolean } = {}): Promise<Job> {
  const key = inputKey(input);
  if (!opts.force) {
    const existingId = await findJobByKey(key);
    const existing = existingId ? await getJob(existingId) : null;
    if (existing && Date.now() - Date.parse(existing.createdAt) < DEDUPE_HOURS * 3600_000) return existing;
  }

  // Never manufacture duplicates: one variant per distinct family (brief §12).
  const available = FAMILIES.map((f) => f.id);
  const templates: TemplateFamily[] = available.slice(0, input.templateCount);
  const notices: string[] = [];
  if (input.templateCount > available.length) {
    notices.push(`${input.templateCount} templates were requested, but ${available.length} distinct designs exist for this category. ${available.length} were generated rather than near-duplicates.`);
  }

  const result = await research(input);
  const stamp = new Date().toISOString();
  const name = result.record?.name.value ?? "business";
  const job: Job = {
    id: `${slugify(name).slice(0, 40)}-${randomBytes(3).toString("hex")}`,
    createdAt: stamp,
    updatedAt: stamp,
    contentVersion: 1,
    status: "failed",
    input: { ...input },
    templates,
    notices: [...notices, ...result.notices],
    sources: result.sources,
    record: result.record,
    error: result.error,
  };
  if (job.record) job.status = jobStatus(checkRecord(job.record, job.input));
  await saveJob(job);
  await setJobKey(key, job.id);
  return job;
}

/** Fact edits apply to every variant at once because they share the record. */
export async function updateRecord(id: string, record: BusinessRecord): Promise<Job> {
  const job = await getJob(id);
  if (!job) throw new Error("Job not found.");
  const next: Job = {
    ...job,
    record,
    contentVersion: job.contentVersion + 1,
    updatedAt: new Date().toISOString(),
    status: jobStatus(checkRecord(record, job.input)),
  };
  await saveJob(next);
  return next;
}

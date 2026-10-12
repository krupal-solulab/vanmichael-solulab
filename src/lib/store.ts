import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Job } from "./types";

/**
 * Jobs live in Netlify Blobs when deployed and in ./.data locally.
 * Every read is validated, so a hand-edited or stale job can never reach a template unchecked.
 */

interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

const onNetlify = () => Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);

async function netlifyKV(): Promise<KV> {
  const { getStore } = await import("@netlify/blobs");
  const store = getStore({ name: "site-generator", consistency: "strong" });
  return {
    get: (k) => store.get(k, { type: "text" }),
    set: async (k, v) => void (await store.set(k, v)),
    list: async (prefix) => (await store.list({ prefix })).blobs.map((b) => b.key),
  };
}

function fileKV(): KV {
  const root = path.join(process.cwd(), ".data");
  const file = (k: string) => path.join(root, `${k.replace(/[^a-z0-9/_-]/gi, "_")}.json`);
  return {
    get: (k) => fs.readFile(file(k), "utf8").catch(() => null),
    set: async (k, v) => {
      await fs.mkdir(path.dirname(file(k)), { recursive: true });
      await fs.writeFile(file(k), v, "utf8");
    },
    list: async (prefix) => {
      const dir = path.join(root, prefix);
      const names = await fs.readdir(dir).catch(() => [] as string[]);
      return names.filter((n) => n.endsWith(".json")).map((n) => `${prefix}${n.slice(0, -5)}`);
    },
  };
}

let kv: Promise<KV> | undefined;
const store = () => (kv ??= onNetlify() ? netlifyKV() : Promise.resolve(fileKV()));

export const isValidJobId = (id: string) => /^[a-z0-9-]{6,80}$/.test(id);

export async function getJob(id: string): Promise<Job | null> {
  if (!isValidJobId(id)) return null;
  const raw = await (await store()).get(`jobs/${id}`);
  if (!raw) return null;
  const parsed = Job.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : null;
}

export async function saveJob(job: Job): Promise<void> {
  await (await store()).set(`jobs/${job.id}`, JSON.stringify(Job.parse(job)));
}

export async function listJobs(): Promise<Job[]> {
  const s = await store();
  const keys = await s.list("jobs/");
  const jobs = await Promise.all(keys.map((k) => getJob(k.replace(/^jobs\//, ""))));
  return jobs.filter((j): j is Job => j !== null).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Maps a normalised input to its most recent job so repeat submissions do not redo the research. */
export async function findJobByKey(key: string): Promise<string | null> {
  return (await store()).get(`keys/${key}`);
}

export async function setJobKey(key: string, id: string) {
  await (await store()).set(`keys/${key}`, id);
}

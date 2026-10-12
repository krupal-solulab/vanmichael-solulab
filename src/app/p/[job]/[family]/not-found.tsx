import { headers } from "next/headers";
import { getJob } from "@/lib/store";
import { TemplateFamily } from "@/lib/types";
import { SiteRenderer } from "@/templates/render";

/**
 * Branded 404 with Home and Book actions, served with a real 404 status.
 * not-found receives no params, so the job and family come from the path the proxy forwards.
 */
export default async function PreviewNotFound() {
  const path = (await headers()).get("x-pathname") ?? "";
  const [, , jobId, family] = path.split("/");
  const fam = TemplateFamily.safeParse(family);
  const job = jobId ? await getJob(jobId) : null;
  if (!fam.success || !job?.record) {
    return <main className="grid min-h-screen place-items-center p-10 font-tool"><p>Preview not found.</p></main>;
  }
  return <SiteRenderer job={job} family={fam.data} route="not-found" />;
}

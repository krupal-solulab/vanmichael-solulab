import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/store";
import { FAMILIES } from "@/lib/checks";
import { CompareFrames } from "./CompareFrames";

export default async function ComparePage({ params }: PageProps<"/jobs/[id]/compare">) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job?.record) notFound();
  return (
    <div>
      <Link href={`/jobs/${job.id}`} className="text-sm text-tool-muted hover:underline">← {job.record.name.value}</Link>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Compare designs</h1>
      <p className="text-sm text-tool-muted">Same facts, different design. Choosing a version chooses the whole site, not just its colors.</p>
      <CompareFrames jobId={job.id} templates={job.templates.map((t) => ({ id: t, name: FAMILIES.find((f) => f.id === t)!.name }))} />
    </div>
  );
}

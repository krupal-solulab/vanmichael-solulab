import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/store";
import { EditForm } from "./EditForm";

export default async function EditPage({ params }: PageProps<"/jobs/[id]/edit">) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job?.record) notFound();
  return (
    <div>
      <Link href={`/jobs/${job.id}`} className="text-sm text-tool-muted hover:underline">← {job.record.name.value}</Link>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Edit facts</h1>
      <p className="mt-1 max-w-[80ch] text-sm text-tool-muted">
        The record below drives every template. Edit values (for example add a missing phone, fix a service name, add provider specialties
        the owner confirmed, or set a status to <code>owner-confirmed</code>), then save. The record is validated before saving and the content version increments.
      </p>
      <EditForm id={job.id} initial={JSON.stringify(job.record, null, 2)} />
    </div>
  );
}

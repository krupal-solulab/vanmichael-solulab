import type { Job } from "@/lib/types";

export function StatusBadge({ status }: { status: Job["status"] }) {
  const styles = {
    ready: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    "needs-review": "bg-amber-50 text-amber-800 ring-amber-200",
    failed: "bg-red-50 text-red-800 ring-red-200",
  }[status];
  const label = { ready: "Ready", "needs-review": "Needs review", failed: "Failed" }[status];
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles}`}>{label}</span>;
}

export function Card({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-tool-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

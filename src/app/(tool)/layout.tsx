import Link from "next/link";

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-tool-bg font-tool text-[15px] leading-relaxed text-tool-ink">
      <header className="border-b border-tool-line bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
          <Link href="/" className="font-bold tracking-tight">Site Generator</Link>
          <span className="rounded bg-tool-bg px-2 py-0.5 text-xs text-tool-muted">Salon &amp; barber · 2 designs</span>
          <span className="ml-auto text-xs text-tool-muted">Private · not indexed</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}

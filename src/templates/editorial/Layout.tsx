import Link from "next/link";
import type { ReactNode } from "react";
import type { RouteId, SiteContent } from "../content";
import { MobileMenu } from "../shared/MobileMenu";
import { BookingDialog } from "../shared/BookingDialog";
import { MapDialog } from "../shared/MapDialog";

export const pill =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-terra px-6 text-[15px] font-semibold text-white transition-colors hover:bg-ink";
export const pillGhost =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ink/20 px-6 text-[15px] font-semibold text-ink transition-colors hover:border-ink";

export function Book({ c, className = pill, children }: { c: SiteContent; className?: string; children?: ReactNode }) {
  if (!c.booking) return null;
  return (
    <a href={c.booking.url} target="_blank" rel="noopener noreferrer" data-book-embed={c.booking.embedUrl ? "" : undefined} className={className}>
      {children ?? c.booking.label}
      {!c.booking.embedUrl && (
        <>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.6" d="M5 11L11 5M6 5h5v5" /></svg>
          <span className="sr-only"> (opens {c.booking.platform})</span>
        </>
      )}
    </a>
  );
}

export function EditorialLayout({ c, route, children }: { c: SiteContent; route: RouteId | "not-found"; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-porcelain font-e-display text-[16.5px] leading-[1.65] text-ink selection:bg-terra selection:text-white">
      <a href="#main" className="absolute left-[-9999px] top-2 z-[100] rounded-full bg-ink px-4 py-3 text-porcelain focus:left-2">Skip to content</a>
      <header className="sticky top-0 z-50 border-b border-line bg-porcelain/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={c.href("home")} className="flex items-baseline gap-2 leading-none">
            <span className="text-[19px] font-bold tracking-[-.02em]">{c.name}</span>
            <span className="hidden font-e-serif text-[17px] italic text-muted sm:inline">{c.city}</span>
          </Link>
          <nav aria-label="Main" className="mx-auto hidden items-center gap-1 rounded-full border border-line bg-card p-1 lg:flex">
            {c.nav.map((n) => (
              <Link
                key={n.route}
                href={c.href(n.route)}
                aria-current={n.route === route ? "page" : undefined}
                className="rounded-full px-4 py-2 text-[14.5px] font-medium text-muted transition-colors hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-porcelain"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            {c.phone && (
              <a href={c.phone.href} className="hidden min-h-11 items-center rounded-full px-3 text-[14.5px] font-medium text-muted hover:text-ink md:inline-flex">
                {c.phone.display}
              </a>
            )}
            <Book c={c} className="hidden min-h-11 items-center gap-2 rounded-full bg-terra px-5 text-[14.5px] font-semibold text-white hover:bg-ink sm:inline-flex">Book</Book>
            <div className="lg:hidden">
              <MobileMenu buttonClassName="grid h-11 w-11 place-items-center rounded-full border border-line bg-card" panelClassName="fixed inset-x-3 top-[80px] z-50 rounded-3xl border border-line bg-card p-3 shadow-xl">
                <nav aria-label="Mobile">
                  <ul className="m-0 grid list-none gap-1 p-0">
                    <li><Link href={c.href("home")} className="block rounded-2xl px-4 py-3 text-lg font-semibold hover:bg-porcelain">Home</Link></li>
                    {c.nav.map((n) => (
                      <li key={n.route}>
                        <Link href={c.href(n.route)} aria-current={n.route === route ? "page" : undefined} className="block rounded-2xl px-4 py-3 text-lg font-semibold hover:bg-porcelain aria-[current=page]:bg-terra-soft">
                          {n.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </MobileMenu>
            </div>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">{children}</main>

      <footer className="mt-24 bg-ink pb-28 pt-16 text-porcelain lg:pb-12">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-8 border-b border-white/15 pb-12">
            <p className="max-w-[16ch] text-[clamp(36px,5vw,64px)] font-bold leading-[.95] tracking-[-.03em]">
              See you <span className="font-e-serif font-normal italic text-terra-soft">soon.</span>
            </p>
            <Book c={c} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-porcelain px-6 text-[15px] font-semibold text-ink hover:bg-terra-soft" />
          </div>
          <div className="grid gap-10 py-12 text-[15px] text-porcelain/75 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-semibold text-porcelain">{c.name}</p>
              <address className="mt-2 not-italic">{c.address.street}{c.address.suite ? `, ${c.address.suite}` : ""}<br />{c.address.city}, {c.address.region} {c.address.postalCode}</address>
            </div>
            <div>
              <p className="font-semibold text-porcelain">Contact</p>
              <ul className="mt-2 list-none space-y-1 p-0">
                {c.phone && <li><a href={c.phone.href} className="hover:text-porcelain">{c.phone.display}</a></li>}
                <li><a href={c.directions} target="_blank" rel="noopener noreferrer" data-map-embed="" className="hover:text-porcelain">Directions</a></li>
                {c.social.instagram && <li><a href={c.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-porcelain">Instagram</a></li>}
                {c.social.facebook && <li><a href={c.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-porcelain">Facebook</a></li>}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-porcelain">Pages</p>
              <ul className="mt-2 list-none space-y-1 p-0">
                {c.nav.map((n) => <li key={n.route}><Link href={c.href(n.route)} className="hover:text-porcelain">{n.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-porcelain">Hours</p>
              {c.hoursRows ? (
                <ul className="mt-2 list-none space-y-1 p-0">
                  {c.hoursRows.map((h) => <li key={h.days}><span className="text-porcelain/55">{h.days}:</span> {h.time}</li>)}
                </ul>
              ) : (
                <p className="mt-2">Call or check online booking.</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-white/15 pt-6 text-[13px] text-porcelain/60">
            <span>© {c.year} {c.name}</span>
            <span className="flex flex-wrap gap-x-5">
              {c.has("policies") && <Link href={c.href("policies")} className="hover:text-porcelain">Policies</Link>}
              <Link href={c.href("privacy")} className="hover:text-porcelain">Privacy</Link>
              {c.usesGoogle && <span>Some photos and reviews via Google Maps</span>}
              {c.video?.credit && <span>Video: {c.video.credit.text} (stock)</span>}
            </span>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-3 bottom-3 z-40 flex gap-2 rounded-full border border-line bg-card/95 p-1.5 shadow-lg backdrop-blur lg:hidden">
        {c.phone ? (
          <a href={c.phone.href} className="flex min-h-12 flex-1 items-center justify-center rounded-full text-[15px] font-semibold">Call</a>
        ) : (
          <a href={c.directions} target="_blank" rel="noopener noreferrer" data-map-embed="" className="flex min-h-12 flex-1 items-center justify-center rounded-full text-[15px] font-semibold">Directions</a>
        )}
        <Book c={c} className="flex min-h-12 flex-[1.4] items-center justify-center gap-2 rounded-full bg-terra text-[15px] font-semibold text-white">Book now</Book>
      </div>
      {c.booking?.embedUrl && <BookingDialog embedUrl={c.booking.embedUrl} platform={c.booking.platform} title={c.name} variant="editorial" phone={c.phone ?? undefined} />}
      <MapDialog embedUrl={c.mapEmbedUrl} title={c.name} address={c.addressLine} variant="editorial" phone={c.phone ?? undefined} />
    </div>
  );
}

export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="inline-flex items-center gap-2 rounded-full bg-terra-soft px-3 py-1 text-[13px] font-semibold text-terra">{children}</p>;
}

export function Title({ children, as: As = "h2", className = "" }: { children: ReactNode; as?: "h1" | "h2"; className?: string }) {
  return <As className={`font-bold leading-[1] tracking-[-.035em] ${As === "h1" ? "text-[clamp(40px,6.4vw,84px)]" : "text-[clamp(32px,4.4vw,56px)]"} ${className}`}>{children}</As>;
}

export function Accent({ children }: { children: ReactNode }) {
  return <span className="font-e-serif font-normal italic tracking-normal text-terra">{children}</span>;
}

export function InnerHead({ kicker, title, intro }: { kicker: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <Shell className="pb-10 pt-14 lg:pb-14 lg:pt-20">
      <Kicker>{kicker}</Kicker>
      <Title as="h1" className="mt-5 max-w-[18ch]">{title}</Title>
      {intro && <div className="mt-5 max-w-[62ch] text-[18px] text-muted">{intro}</div>}
    </Shell>
  );
}

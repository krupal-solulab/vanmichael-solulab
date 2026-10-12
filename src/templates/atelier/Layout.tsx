import Link from "next/link";
import type { ReactNode } from "react";
import type { RouteId, SiteContent } from "../content";
import { MobileMenu } from "../shared/MobileMenu";
import { BookingDialog } from "../shared/BookingDialog";
import { MapDialog } from "../shared/MapDialog";

export function BookLink({ c, className = "", children }: { c: SiteContent; className?: string; children?: ReactNode }) {
  if (!c.booking) return null;
  return (
    <a href={c.booking.url} target="_blank" rel="noopener noreferrer" data-book-embed={c.booking.embedUrl ? "" : undefined} className={className}>
      {children ?? c.booking.label}
      {!c.booking.embedUrl && <span className="sr-only"> (opens {c.booking.platform})</span>}
    </a>
  );
}

export const btnSolid =
  "inline-flex min-h-12 items-center justify-center gap-2 bg-champ px-7 text-[13px] font-semibold uppercase tracking-[.16em] text-char transition-colors hover:bg-ivory";
export const btnLine =
  "inline-flex min-h-12 items-center justify-center gap-2 border border-ivory/35 px-7 text-[13px] font-semibold uppercase tracking-[.16em] text-ivory transition-colors hover:border-ivory hover:bg-ivory hover:text-char";

export function AtelierLayout({ c, route, children }: { c: SiteContent; route: RouteId | "not-found"; children: ReactNode }) {
  const overHero = route === "home";
  return (
    <div className="min-h-screen bg-char font-a-body text-[16px] leading-[1.7] text-ivory selection:bg-champ selection:text-char">
      <a href="#main" className="absolute left-[-9999px] top-2 z-[100] bg-champ px-4 py-3 text-char focus:left-2">
        Skip to content
      </a>
      <header className={`${overHero ? "absolute" : "sticky bg-char/95 backdrop-blur"} inset-x-0 top-0 z-50 border-b border-ivory/10`}>
        <div className="mx-auto flex h-20 max-w-[1320px] items-center gap-6 px-5 sm:px-8 lg:px-12">
          <Link href={c.href("home")} className="font-a-display text-[22px] font-medium uppercase leading-none tracking-[.14em] text-ivory">
            {c.name}
          </Link>
          <nav aria-label="Main" className="ml-auto hidden items-center gap-8 lg:flex">
            {c.nav.map((n) => (
              <Link
                key={n.route}
                href={c.href(n.route)}
                aria-current={n.route === route ? "page" : undefined}
                className="text-[13px] uppercase tracking-[.14em] text-ivory/75 transition-colors hover:text-ivory aria-[current=page]:text-champ"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          {c.phone && (
            <a href={c.phone.href} className="hidden text-[13px] tracking-[.08em] text-ivory/75 hover:text-ivory xl:inline">
              {c.phone.display}
            </a>
          )}
          <BookLink c={c} className="ml-auto hidden min-h-11 items-center border border-champ px-5 text-[12px] font-semibold uppercase tracking-[.16em] text-champ transition-colors hover:bg-champ hover:text-char lg:ml-0 lg:inline-flex">
            Book
          </BookLink>
          <div className="ml-auto lg:hidden">
            <MobileMenu
              buttonClassName="grid h-11 w-11 place-items-center text-ivory"
              panelClassName="fixed inset-x-0 top-20 z-50 border-t border-ivory/10 bg-char px-5 pb-8 pt-4"
            >
              <nav aria-label="Mobile">
                <ul className="m-0 list-none p-0">
                  <li><Link href={c.href("home")} className="block border-b border-ivory/10 py-4 font-a-display text-3xl">Home</Link></li>
                  {c.nav.map((n) => (
                    <li key={n.route}>
                      <Link href={c.href(n.route)} aria-current={n.route === route ? "page" : undefined} className="block border-b border-ivory/10 py-4 font-a-display text-3xl aria-[current=page]:text-champ">
                        {n.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </MobileMenu>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">{children}</main>

      <footer className="border-t border-ivory/10 bg-char pb-28 pt-16 lg:pb-12">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] lg:px-12">
          <div>
            <p className="font-a-display text-3xl font-light uppercase tracking-[.12em]">{c.name}</p>
            <address className="mt-4 not-italic text-ivory-dim">
              {c.address.street}{c.address.suite ? `, ${c.address.suite}` : ""}<br />
              {c.address.city}, {c.address.region} {c.address.postalCode}
            </address>
            {c.phone && <p className="mt-2"><a href={c.phone.href} className="text-ivory underline decoration-champ/60 underline-offset-4 hover:decoration-champ">{c.phone.display}</a></p>}
          </div>
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[.18em] text-champ">Studio</h2>
            <ul className="mt-4 list-none space-y-2 p-0 text-ivory-dim">
              {c.nav.map((n) => <li key={n.route}><Link href={c.href(n.route)} className="hover:text-ivory">{n.label}</Link></li>)}
              {c.has("policies") && <li><Link href={c.href("policies")} className="hover:text-ivory">Booking policies</Link></li>}
              <li><Link href={c.href("privacy")} className="hover:text-ivory">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[.18em] text-champ">Elsewhere</h2>
            <ul className="mt-4 list-none space-y-2 p-0 text-ivory-dim">
              {c.booking && <li><BookLink c={c} className="hover:text-ivory" /></li>}
              <li><a href={c.directions} target="_blank" rel="noopener noreferrer" data-map-embed="" className="hover:text-ivory">Directions</a></li>
              {c.social.instagram && <li><a href={c.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-ivory">Instagram</a></li>}
              {c.social.facebook && <li><a href={c.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-ivory">Facebook</a></li>}
              {c.social.tiktok && <li><a href={c.social.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-ivory">TikTok</a></li>}
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1320px] flex-wrap justify-between gap-x-8 gap-y-2 border-t border-ivory/10 px-5 pt-6 text-[12px] text-ivory-dim sm:px-8 lg:px-12">
          <span>© {c.year} {c.name}</span>
          <span>
            {c.usesGoogle && "Some photos and reviews via Google Maps. "}
            {c.video?.credit && <>Background video: {c.video.credit.text} (stock).</>}
          </span>
        </div>
      </footer>

      {/* Mobile Book/Call bar; body padding above keeps it from covering content (brief G03). */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-ivory/10 bg-char/95 backdrop-blur lg:hidden">
        {c.phone ? (
          <a href={c.phone.href} className="flex min-h-14 items-center justify-center text-[12px] font-semibold uppercase tracking-[.16em] text-ivory">Call</a>
        ) : (
          <a href={c.directions} target="_blank" rel="noopener noreferrer" data-map-embed="" className="flex min-h-14 items-center justify-center text-[12px] font-semibold uppercase tracking-[.16em] text-ivory">Directions</a>
        )}
        <BookLink c={c} className="flex min-h-14 items-center justify-center bg-champ text-[12px] font-semibold uppercase tracking-[.16em] text-char">Book now</BookLink>
      </div>
      {c.booking?.embedUrl && <BookingDialog embedUrl={c.booking.embedUrl} platform={c.booking.platform} title={c.name} variant="atelier" phone={c.phone ?? undefined} />}
      <MapDialog embedUrl={c.mapEmbedUrl} title={c.name} address={c.addressLine} variant="atelier" phone={c.phone ?? undefined} />
    </div>
  );
}

export function PageHead({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <section className="border-b border-ivory/10">
      <div className="mx-auto max-w-[1320px] px-5 pb-14 pt-16 sm:px-8 lg:px-12 lg:pb-20 lg:pt-24">
        <p className="fade-up text-[12px] font-semibold uppercase tracking-[.22em] text-champ">{eyebrow}</p>
        <h1 className="fade-up-2 mt-5 max-w-[16ch] font-a-display text-[clamp(44px,7vw,96px)] font-light leading-[.98] tracking-[-.01em]">{title}</h1>
        {intro && <div className="fade-up-3 mt-6 max-w-[60ch] text-[17px] text-ivory-dim">{intro}</div>}
      </div>
    </section>
  );
}

export function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[.22em] text-champ">{children}</p>;
}

import Link from "next/link";
import type { SiteContent } from "../content";
import { HeroVideo } from "../shared/HeroVideo";
import { SmartImg } from "../shared/SmartImg";
import { Gallery } from "../shared/Gallery";
import { MapFrame } from "../shared/MapDialog";
import { privacySections } from "../shared/legal";
import { BookLink, Eyebrow, PageHead, Wrap, btnLine, btnSolid } from "./Layout";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

function RatingLine({ c, className = "" }: { c: SiteContent; className?: string }) {
  if (!c.ratings.length) return null;
  return (
    <ul className={`m-0 flex list-none flex-wrap gap-x-6 gap-y-1 p-0 ${className}`}>
      {c.ratings.map((r) => (
        <li key={r.label}>
          <span>
            <span className="font-semibold text-ivory">{r.display}</span>
            <span className="text-champ" aria-hidden="true"> ★ </span>
            <span className="sr-only"> out of 5 stars, </span>
            {r.count} reviews on {r.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function HoursTable({ c }: { c: SiteContent }) {
  if (!c.hoursRows) {
    return <p className="text-ivory-dim">Hours vary. {c.phone ? <>Call <a className="underline" href={c.phone.href}>{c.phone.display}</a> or </> : ""}check availability when you book.</p>;
  }
  return (
    <dl className="m-0 divide-y divide-ivory/10 border-y border-ivory/10">
      {c.hoursRows.map((h) => (
        <div key={h.days} className="flex justify-between gap-6 py-3">
          <dt className="text-ivory-dim">{h.days}</dt>
          <dd className={`m-0 text-right ${h.closed ? "text-ivory-dim" : ""}`}>{h.time}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProviderNote({ c }: { c: SiteContent }) {
  if (!c.booking) return null;
  return <p className="text-[14px] text-ivory-dim">Choose your {c.isBarber ? "barber" : "stylist"} by name when you book on {c.booking.platform}.</p>;
}

/* ───────────────────────────── Home ───────────────────────────── */

export function Home({ c }: { c: SiteContent }) {
  const hero = c.cover;
  const curated = c.work.slice(0, c.work.length >= 5 ? 5 : 3);
  const tiles =
    curated.length === 5
      ? ["col-span-2 aspect-[4/5] md:col-span-5 md:row-span-2 md:aspect-auto", "aspect-square md:col-span-4", "aspect-square md:col-span-3", "aspect-square md:col-span-3", "aspect-square md:col-span-4"]
      : ["col-span-2 aspect-[4/5] md:col-span-7 md:row-span-2 md:aspect-auto", "aspect-[4/3] md:col-span-5", "aspect-[4/3] md:col-span-5"];
  const signature = c.groups.slice(0, 4);
  const lead = c.topCategories.slice(0, 3);

  return (
    <>
      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-char-2">
        <div className="absolute inset-0">
          {c.video ? (
            <HeroVideo
              src={c.video.src}
              poster={c.video.poster ?? hero?.src}
              className="h-full w-full object-cover"
              buttonClassName="absolute bottom-24 right-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-ivory/40 bg-char/40 text-ivory backdrop-blur hover:bg-char/70 sm:right-8 lg:bottom-10 lg:right-12"
            />
          ) : hero ? (
            <SmartImg src={hero.src} alt="" priority className="h-full w-full object-cover" fallbackClassName="bg-char-2" />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,19,18,.88)_0%,rgba(20,19,18,.55)_45%,rgba(20,19,18,.15)_100%),linear-gradient(0deg,rgba(20,19,18,.9)_0%,rgba(20,19,18,0)_45%)]" />
        </div>
        <Wrap className="relative z-10 w-full pb-28 pt-36 lg:pb-24">
          <p className="fade-up text-[12px] font-semibold uppercase tracking-[.24em] text-champ">
            {c.name} · {c.city}, {c.region}
          </p>
          <h1 className="fade-up-2 mt-6 max-w-[11ch] font-a-display text-[clamp(54px,9vw,128px)] font-light leading-[.92] tracking-[-.015em]">
            Your next look <em className="font-normal text-champ">starts here.</em>
          </h1>
          <p className="fade-up-3 mt-7 max-w-[46ch] text-[18px] text-ivory/85">
            A {c.kind} in {c.city}
            {lead.length ? <> for {lead.slice(0, -1).join(", ")}{lead.length > 1 ? " and " : ""}{lead[lead.length - 1]}</> : null}.
            {c.providers.length > 1 ? ` ${c.providers.length} ${c.isBarber ? "barbers" : "artists"}, one address.` : ""}
          </p>
          <div className="fade-up-3 mt-10 flex flex-wrap gap-3">
            <BookLink c={c} className={btnSolid} />
            <Link href={c.has("gallery") ? c.href("gallery") : c.href("services")} className={btnLine}>
              {c.has("gallery") ? "Explore our work" : "View services"}
            </Link>
          </div>
        </Wrap>
        {hero && !c.video && hero.credit && (
          <p className="absolute bottom-20 right-5 z-10 text-[11px] text-ivory/55 lg:bottom-4 lg:right-12">{hero.credit.text}</p>
        )}
      </section>

      <section aria-label="At a glance" className="border-b border-ivory/10 bg-char-2">
        <Wrap className="grid gap-6 py-7 text-[14px] text-ivory-dim md:grid-cols-3 md:items-center">
          <RatingLine c={c} />
          <a href={c.directions} target="_blank" rel="noopener noreferrer" data-map-embed="" className="hover:text-ivory">
            {c.address.street}{c.address.suite ? `, ${c.address.suite}` : ""}, {c.address.city}
          </a>
          <p className="m-0 md:text-right">{c.today?.label ?? (c.phone ? `Call ${c.phone.display}` : "")}</p>
        </Wrap>
      </section>

      {curated.length >= 3 && (
        <section className="py-24 lg:py-32">
          <Wrap>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow>Our work</Eyebrow>
                <h2 className="mt-4 font-a-display text-[clamp(36px,5vw,64px)] font-light leading-none">From the chair</h2>
              </div>
              {c.has("gallery") && <Link href={c.href("gallery")} className="text-[13px] uppercase tracking-[.16em] text-champ hover:text-ivory">See the gallery →</Link>}
            </div>
            <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-12 md:gap-3">
              {curated.map((img, i) => (
                <figure
                  key={img.src}
                  className={`relative m-0 overflow-hidden bg-char-2 ${tiles[i]}`}
                >
                  <SmartImg src={img.src} alt={img.alt} className="h-full w-full object-cover" fallbackClassName="bg-char-3" />
                  {img.credit && <figcaption className="absolute bottom-2 left-2 bg-char/70 px-2 py-1 text-[11px] text-ivory/80">{img.credit.text}</figcaption>}
                </figure>
              ))}
            </div>
          </Wrap>
        </section>
      )}

      {signature.length > 0 && (
        <section className="border-t border-ivory/10 bg-char-2 py-24 lg:py-32">
          <Wrap>
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <Eyebrow>Services</Eyebrow>
                <h2 className="mt-4 font-a-display text-[clamp(36px,5vw,64px)] font-light leading-none">Signature work</h2>
                <p className="mt-6 max-w-[40ch] text-ivory-dim">
                  {c.serviceCount} services on the menu{c.groups.length > 4 ? `, from ${c.groups.slice(4).map((g) => g.label.toLowerCase()).join(", ")} to the essentials below` : ""}.
                </p>
                <Link href={c.href("services")} className={`${btnLine} mt-8`}>Full menu & prices</Link>
              </div>
              <ol className="m-0 list-none divide-y divide-ivory/10 border-y border-ivory/10 p-0">
                {signature.map((g, i) => (
                  <li key={g.id} className="grid gap-4 py-8 sm:grid-cols-[72px_1fr]">
                    <span className="font-a-display text-2xl italic text-champ">{ROMAN[i]}</span>
                    <div>
                      <h3 className="font-a-display text-[34px] font-light leading-tight">
                        <Link href={c.href("services", `#${g.id}`)} className="hover:text-champ">{g.label}</Link>
                      </h3>
                      <ul className="mt-3 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-[14px] text-ivory-dim">
                        {g.services.slice(0, 4).map((s) => (
                          <li key={s.id}>{s.name}{c.priceLabel(s) && <span className="text-ivory/50"> · {c.priceLabel(s)}</span>}</li>
                        ))}
                        {g.services.length > 4 && <li>+{g.services.length - 4} more</li>}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Wrap>
        </section>
      )}

      {c.providers.length > 0 && (
        <section className="py-24 lg:py-32">
          <Wrap>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow>The team</Eyebrow>
                <h2 className="mt-4 font-a-display text-[clamp(36px,5vw,64px)] font-light leading-none">Book the hands you trust</h2>
              </div>
              <Link href={c.href("team")} className="text-[13px] uppercase tracking-[.16em] text-champ hover:text-ivory">Meet everyone →</Link>
            </div>
            <ul className="mt-12 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-5">
              {c.providers.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <div className="aspect-[3/4] overflow-hidden bg-char-2">
                    {p.photo ? (
                      <SmartImg src={p.photo.src} alt={p.photo.alt} className="h-full w-full object-cover grayscale-[35%]" fallbackClassName="bg-char-3" />
                    ) : (
                      <div className="grid h-full place-items-center font-a-display text-6xl font-light text-champ/70" aria-hidden="true">{p.name[0]}</div>
                    )}
                  </div>
                  <p className="mt-3 font-a-display text-[22px] leading-tight">{p.name}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8"><ProviderNote c={c} /></div>
          </Wrap>
        </section>
      )}

      <Proof c={c} />

      {c.about && (
        <section className="border-t border-ivory/10 py-24 lg:py-32">
          <Wrap className="grid gap-10 lg:grid-cols-2 lg:gap-20">
            <div>
              <Eyebrow>The studio</Eyebrow>
              <h2 className="mt-4 font-a-display text-[clamp(36px,5vw,64px)] font-light leading-none">About {c.name}</h2>
            </div>
            <div className="text-[18px] text-ivory/85">
              <p>{c.about}</p>
              {c.has("about") && <Link href={c.href("about")} className="mt-6 inline-block text-[13px] uppercase tracking-[.16em] text-champ">Read more →</Link>}
            </div>
          </Wrap>
        </section>
      )}

      <VisitBlock c={c} />
      <FinalCta c={c} />
    </>
  );
}

function Proof({ c }: { c: SiteContent }) {
  if (!c.reviews.length && !c.ratings.length) return null;
  return (
    <section className="border-t border-ivory/10 bg-char-2 py-24 lg:py-32">
      <Wrap>
        <Eyebrow>Kind words</Eyebrow>
        {c.reviews.length ? (
          <>
            <ul className="mt-10 grid list-none gap-10 p-0 md:grid-cols-3">
              {c.reviews.slice(0, 3).map((r) => (
                <li key={r.author + r.text.slice(0, 20)}>
                  <blockquote className="m-0">
                    <p className="font-a-display text-[24px] font-light italic leading-snug">“{r.text.length > 260 ? `${r.text.slice(0, 257).trimEnd()}…` : r.text}”</p>
                    <footer className="mt-5 text-[13px] uppercase tracking-[.14em] text-ivory-dim">
                      {r.author} · {r.rating}★ on {r.sourceLabel}
                    </footer>
                  </blockquote>
                </li>
              ))}
            </ul>
            <RatingLine c={c} className="mt-12 text-[14px] text-ivory-dim" />
          </>
        ) : (
          <div className="mt-8">
            {c.ratings.map((r) => (
              <p key={r.label} className="mr-12 inline-block">
                <span className="font-a-display text-[clamp(64px,10vw,120px)] font-light leading-none">{r.display}</span>
                <span className="block text-[13px] uppercase tracking-[.16em] text-ivory-dim">{r.count} reviews on {r.label}</span>
              </p>
            ))}
          </div>
        )}
      </Wrap>
    </section>
  );
}

function VisitBlock({ c }: { c: SiteContent }) {
  return (
    <section className="border-t border-ivory/10 py-24 lg:py-32">
      <Wrap className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <Eyebrow>Visit</Eyebrow>
          <h2 className="mt-4 font-a-display text-[clamp(36px,5vw,64px)] font-light leading-none">Find us in {c.city}</h2>
          <address className="mt-8 text-[20px] not-italic leading-relaxed">
            {c.address.street}{c.address.suite ? `, ${c.address.suite}` : ""}<br />
            {c.address.city}, {c.address.region} {c.address.postalCode}
          </address>
          {c.phone && <p className="mt-3"><a href={c.phone.href} className="text-[20px] underline decoration-champ/60 underline-offset-4">{c.phone.display}</a></p>}
          {c.policies.length > 0 && (
            <p className="mt-6 text-[14px] text-champ">
              <span className="border border-champ/40 px-3 py-1.5">{c.policies.find((p) => /walk/i.test(p)) ?? c.policies[0]}</span>
              {c.policies.length > 1 && c.has("policies") && <Link href={c.href("policies")} className="ml-3 underline underline-offset-4">All booking policies</Link>}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={c.directions} target="_blank" rel="noopener noreferrer" data-map-embed="" className={btnLine}>Directions</a>
            <Link href={c.href("visit")} className={btnLine}>Visit details</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-[.18em] text-ivory-dim">Hours{c.today ? ` · ${c.today.label}` : ""}</h3>
          <HoursTable c={c} />
        </div>
      </Wrap>
    </section>
  );
}

function FinalCta({ c }: { c: SiteContent }) {
  return (
    <section className="relative overflow-hidden border-t border-ivory/10 bg-char-2 py-24 text-center lg:py-32">
      <Wrap>
        <h2 className="mx-auto max-w-[14ch] font-a-display text-[clamp(44px,7vw,96px)] font-light leading-[.95]">
          Ready when <em className="text-champ">you are.</em>
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <BookLink c={c} className={btnSolid} />
          {c.phone && <a href={c.phone.href} className={btnLine}>Call {c.phone.display}</a>}
          <a href={c.directions} target="_blank" rel="noopener noreferrer" data-map-embed="" className={btnLine}>Directions</a>
        </div>
      </Wrap>
    </section>
  );
}

/* ─────────────────────────── Services ─────────────────────────── */

export function Services({ c }: { c: SiteContent }) {
  return (
    <>
      <PageHead
        eyebrow="Services & prices"
        title={<>The menu, <em className="text-champ">in full.</em></>}
        intro={
          c.groups.length ? (
            <p>
              {c.serviceCount} services across {c.groups.length} disciplines.{" "}
              {c.pricesConfirmed
                ? "Prices are starting points and vary by length, density and artist."
                : `Prices are “from” amounts listed on ${c.booking?.platform ?? "our booking page"}${c.pricesAsOf ? ` as of ${c.pricesAsOf}` : ""}; your exact price is shown before you confirm.`}
            </p>
          ) : (
            <p>See current services and prices{c.booking ? ` on ${c.booking.platform}` : ""}.</p>
          )
        }
      />
      {c.groups.length > 0 && (
        <nav aria-label="Service categories" className="sticky top-20 z-30 border-b border-ivory/10 bg-char/95 backdrop-blur">
          <Wrap className="flex gap-6 overflow-x-auto py-4 text-[12px] uppercase tracking-[.16em]">
            {c.groups.map((g) => <a key={g.id} href={`#${g.id}`} className="shrink-0 text-ivory-dim hover:text-champ">{g.label}</a>)}
          </Wrap>
        </nav>
      )}
      <Wrap className="py-16 lg:py-24">
        {c.groups.map((g, i) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="grid gap-8 border-b border-ivory/10 py-14 first:pt-0 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div>
              <span className="font-a-display text-xl italic text-champ">{ROMAN[i]}</span>
              <h2 id={`${g.id}-h`} className="mt-2 font-a-display text-[clamp(34px,4vw,52px)] font-light leading-none">{g.label}</h2>
              <BookLink c={c} className="mt-6 inline-block text-[12px] font-semibold uppercase tracking-[.16em] text-champ hover:text-ivory">Book {g.label.toLowerCase()} →</BookLink>
            </div>
            <ul className="m-0 list-none p-0">
              {g.services.map((s) => (
                <li key={s.id} className="flex items-baseline gap-4 py-3">
                  <span>{s.name}</span>
                  <span aria-hidden="true" className="min-w-6 flex-1 border-b border-dotted border-ivory/20" />
                  <span className="whitespace-nowrap text-ivory-dim">{c.priceLabel(s) ?? "Price on booking"}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <aside className="mt-16 grid gap-6 border border-champ/30 p-8 md:grid-cols-[1fr_auto] md:items-center lg:p-12">
          <div>
            <h2 className="font-a-display text-[32px] font-light">Not sure what to book?</h2>
            <p className="mt-2 max-w-[56ch] text-ivory-dim">
              {c.phone ? <>Call <a href={c.phone.href} className="text-ivory underline underline-offset-4">{c.phone.display}</a> and describe what you have in mind. We will point you to the right service and artist.</> : "Book the closest service and mention what you have in mind in your booking notes."}
            </p>
          </div>
          <BookLink c={c} className={btnSolid} />
        </aside>
      </Wrap>
    </>
  );
}

/* ───────────────────────────── Team ───────────────────────────── */

export function Team({ c }: { c: SiteContent }) {
  return (
    <>
      <PageHead eyebrow="Our team" title={<>The <em className="text-champ">artists.</em></>} intro={<><p>{c.providers.length} {c.isBarber ? "barbers" : "stylists and artists"} at {c.name}.</p><ProviderNote c={c} /></>} />
      <Wrap className="py-16 lg:py-24">
        <ul className="grid list-none gap-x-4 gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {c.providers.map((p, i) => (
            <li key={p.id} className={i % 3 === 1 ? "lg:mt-16" : ""}>
              <div className="aspect-[4/5] overflow-hidden bg-char-2">
                {p.photo ? (
                  <SmartImg src={p.photo.src} alt={p.photo.alt} className="h-full w-full object-cover" fallbackClassName="bg-char-3" />
                ) : (
                  <div className="grid h-full place-items-center font-a-display text-8xl font-light text-champ/60" aria-hidden="true">{p.name[0]}</div>
                )}
              </div>
              <h2 className="mt-5 font-a-display text-[32px] font-light leading-tight">{p.name}</h2>
              {p.specialties.length > 0 && <p className="mt-1 text-[14px] text-ivory-dim">{p.specialties.join(" · ")}</p>}
              {p.bio && <p className="mt-3 text-ivory-dim">{p.bio}</p>}
              <BookLink c={c} className="mt-4 inline-block text-[12px] font-semibold uppercase tracking-[.16em] text-champ hover:text-ivory">
                Book with {p.name.split(" ")[0]} →
              </BookLink>
            </li>
          ))}
        </ul>
      </Wrap>
    </>
  );
}

/* ──────────────────────────── Gallery ─────────────────────────── */

export function GalleryPage({ c }: { c: SiteContent }) {
  return (
    <>
      <PageHead eyebrow="Our work" title={<>From <em className="text-champ">the chair.</em></>} intro={<p>Photos from {c.name}{c.usesGoogle ? " and its Google listing, credited to each photographer" : ""}. Select any image for a larger view.</p>} />
      <Wrap className="py-16 lg:py-24">
        <Gallery images={c.work} layout="atelier" />
        <div className="mt-16 flex flex-wrap gap-3">
          <BookLink c={c} className={btnSolid} />
          {c.social.instagram && <a href={c.social.instagram} target="_blank" rel="noopener noreferrer" className={btnLine}>More on Instagram</a>}
        </div>
      </Wrap>
    </>
  );
}

/* ───────────────────────────── About ──────────────────────────── */

export function About({ c }: { c: SiteContent }) {
  return (
    <>
      <PageHead eyebrow="About" title={<>{c.name}</>} />
      <Wrap className="grid gap-12 py-16 lg:grid-cols-[1.2fr_.8fr] lg:gap-20 lg:py-24">
        <p className="font-a-display text-[clamp(24px,2.6vw,34px)] font-light leading-snug">{c.about}</p>
        <dl className="m-0 space-y-6 text-[15px]">
          <div><dt className="text-[12px] uppercase tracking-[.18em] text-champ">Where</dt><dd className="m-0 mt-1 text-ivory-dim">{c.addressLine}</dd></div>
          {c.providers.length > 0 && <div><dt className="text-[12px] uppercase tracking-[.18em] text-champ">Team</dt><dd className="m-0 mt-1 text-ivory-dim">{c.providers.length} {c.isBarber ? "barbers" : "artists"}</dd></div>}
          {c.groups.length > 0 && <div><dt className="text-[12px] uppercase tracking-[.18em] text-champ">Services</dt><dd className="m-0 mt-1 text-ivory-dim">{c.groups.map((g) => g.label).join(", ")}</dd></div>}
        </dl>
      </Wrap>
      <FinalCta c={c} />
    </>
  );
}

/* ───────────────────────────── Visit ──────────────────────────── */

export function Visit({ c }: { c: SiteContent }) {
  return (
    <>
      <PageHead eyebrow="Visit & contact" title={<>Come <em className="text-champ">see us.</em></>} intro={<p>{c.addressLine}</p>} />
      <Wrap className="grid gap-14 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <div className="space-y-10">
          <section>
            <h2 className="font-a-display text-[32px] font-light">Address</h2>
            <address className="mt-3 text-[18px] not-italic text-ivory-dim">
              {c.name}<br />{c.address.street}{c.address.suite ? `, ${c.address.suite}` : ""}<br />{c.address.city}, {c.address.region} {c.address.postalCode}
            </address>
            <a href={c.directions} target="_blank" rel="noopener noreferrer" data-map-embed="" className={`${btnLine} mt-5`}>Get directions</a>
          </section>
          {c.phone && (
            <section>
              <h2 className="font-a-display text-[32px] font-light">Phone</h2>
              <p className="mt-3"><a href={c.phone.href} className="text-[22px] underline decoration-champ/60 underline-offset-4">{c.phone.display}</a></p>
            </section>
          )}
          <section>
            <h2 className="font-a-display text-[32px] font-light">Booking</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ivory-dim marker:text-champ">
              {c.booking && <li>Book online any time on {c.booking.platform}; you will see availability and the price before confirming.</li>}
              {c.policies.map((p) => <li key={p}>{p}</li>)}
              {c.paymentAccepted.length > 0 && <li>Payment accepted: {c.paymentAccepted.join(", ")}.</li>}
            </ul>
            <BookLink c={c} className={`${btnSolid} mt-6`} />
          </section>
        </div>
        <section>
          <h2 className="font-a-display text-[32px] font-light">Hours</h2>
          {c.today && <p className={`mt-2 text-[14px] ${c.today.open ? "text-champ" : "text-ivory-dim"}`}>{c.today.label}</p>}
          <div className="mt-5"><HoursTable c={c} /></div>
          <p className="mt-4 text-[13px] text-ivory-dim">Holiday hours may differ. {c.booking ? `Live availability is always on ${c.booking.platform}.` : ""}</p>
        </section>
      </Wrap>
      <Wrap className="pb-24">
        <MapFrame src={c.mapEmbedUrl} title={`Map of ${c.name}`} className="block h-[420px] w-full border border-ivory/10 grayscale-[30%]" />
      </Wrap>
    </>
  );
}

/* ─────────────────────────── Policies ─────────────────────────── */

export function Policies({ c }: { c: SiteContent }) {
  return (
    <>
      <PageHead eyebrow="Policies" title="Booking policies" />
      <Wrap className="max-w-[860px] py-16 lg:py-24">
        <ul className="m-0 list-none divide-y divide-ivory/10 border-y border-ivory/10 p-0 text-[18px]">
          {c.policies.map((p) => <li key={p} className="py-5">{p}</li>)}
          {c.paymentAccepted.length > 0 && <li className="py-5">Payment accepted: {c.paymentAccepted.join(", ")}.</li>}
        </ul>
        <p className="mt-8 text-ivory-dim">
          To change an existing appointment, use {c.booking ? c.booking.platform : "your booking confirmation"}{c.phone ? <> or call <a href={c.phone.href} className="text-ivory underline underline-offset-4">{c.phone.display}</a></> : ""}.
        </p>
      </Wrap>
    </>
  );
}

/* ─────────────────────────── Privacy ──────────────────────────── */

export function Privacy({ c }: { c: SiteContent }) {
  return (
    <>
      <PageHead eyebrow="Privacy" title="Privacy notice" />
      <Wrap className="max-w-[860px] space-y-10 py-16 lg:py-24">
        {privacySections(c).map((s) => (
          <section key={s.heading}>
            <h2 className="font-a-display text-[30px] font-light">{s.heading}</h2>
            {s.body.map((b) => <p key={b} className="mt-3 text-ivory-dim">{b}</p>)}
          </section>
        ))}
      </Wrap>
    </>
  );
}

/* ─────────────────────────── 404 ──────────────────────────────── */

export function NotFound({ c }: { c: SiteContent }) {
  return (
    <Wrap className="py-32 lg:py-44">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-5 max-w-[14ch] font-a-display text-[clamp(44px,7vw,96px)] font-light leading-[.98]">This page <em className="text-champ">isn’t here.</em></h1>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={c.href("home")} className={btnLine}>Home</Link>
        <BookLink c={c} className={btnSolid} />
      </div>
    </Wrap>
  );
}

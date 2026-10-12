import Link from "next/link";
import type { SiteContent } from "../content";
import { HeroVideo } from "../shared/HeroVideo";
import { SmartImg } from "../shared/SmartImg";
import { Gallery } from "../shared/Gallery";
import { MapFrame } from "../shared/MapDialog";
import { ServiceTabs } from "../shared/ServiceTabs";
import { privacySections } from "../shared/legal";
import { Accent, Book, InnerHead, Kicker, Shell, Title, pill, pillGhost } from "./Layout";

const tabGroups = (c: SiteContent) =>
  c.groups.map((g) => ({ id: g.id, label: g.label, services: g.services.map((s) => ({ id: s.id, name: s.name, price: c.priceLabel(s) })) }));

function Stars({ value }: { value: number }) {
  // Partial fill so 4.6 does not render as five full stars (reference audit L03).
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className="relative inline-block text-[15px] leading-none tracking-[2px]" aria-hidden="true">
      <span className="text-line">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-terra" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}

function RatingChip({ c }: { c: SiteContent }) {
  const r = c.ratings[0];
  if (!r) return null;
  return (
    <p className="m-0 inline-flex items-center gap-2 text-[14.5px] text-muted">
      <Stars value={r.value} />
      <span><b className="font-semibold text-ink">{r.display}</b> · {r.count} reviews on {r.label}</span>
    </p>
  );
}

function faqs(c: SiteContent) {
  const out: { q: string; a: string }[] = [];
  if (c.booking) out.push({ q: "How do I book?", a: `Online any time on ${c.booking.platform}. Pick your service, choose your ${c.isBarber ? "barber" : "stylist"} by name and select a time.${c.phone ? ` You can also call ${c.phone.display}.` : ""}` });
  const walk = c.policies.find((p) => /walk/i.test(p));
  if (walk) out.push({ q: "Do you take walk-ins?", a: `${walk}. Please book ahead${c.booking ? ` on ${c.booking.platform}` : ""}.` });
  if (c.serviceCount) out.push({ q: "How much does it cost?", a: `Prices start from the amounts on our services page and can vary with hair length, density and the ${c.isBarber ? "barber" : "artist"} you choose. ${c.booking ? `Your exact price is shown on ${c.booking.platform} before you confirm.` : ""}` });
  if (c.hoursRows) out.push({ q: "When are you open?", a: c.hoursRows.map((h) => `${h.days}: ${h.time}`).join(". ") + "." });
  if (c.paymentAccepted.length) out.push({ q: "How can I pay?", a: `We accept ${c.paymentAccepted.join(", ").toLowerCase()}.` });
  return out;
}

function Faq({ c }: { c: SiteContent }) {
  const items = faqs(c);
  if (!items.length) return null;
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f, i) => (
        <details key={f.q} open={i === 0} className="group py-1">
          <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 text-[18px] font-semibold">
            {f.q}
            {/* Indicator follows the real open state (reference audit V01). */}
            <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-terra transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="max-w-[64ch] pb-5 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

function HoursList({ c }: { c: SiteContent }) {
  if (!c.hoursRows) return <p className="text-muted">Hours vary; {c.phone ? <>call <a href={c.phone.href} className="underline">{c.phone.display}</a> or </> : ""}check online booking.</p>;
  return (
    <dl className="m-0 space-y-2">
      {c.hoursRows.map((h) => (
        <div key={h.days} className="flex justify-between gap-4">
          <dt className="text-muted">{h.days}</dt>
          <dd className={`m-0 font-medium ${h.closed ? "text-muted" : ""}`}>{h.time}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ───────────────────────────── Home ───────────────────────────── */

export function Home({ c }: { c: SiteContent }) {
  const hero = c.cover;
  const thumbs = c.work.filter((w) => w.src !== hero?.src).slice(0, 3);
  const lead = c.topCategories.slice(0, 3);

  return (
    <>
      <Shell className="grid gap-6 pt-6 lg:grid-cols-[1fr_1.15fr] lg:gap-8 lg:pt-10">
        <div className="flex flex-col justify-between gap-8 lg:py-6">
          <div>
            <p className="fade-up text-[15px] font-medium text-muted">{c.kind[0].toUpperCase() + c.kind.slice(1)} · {c.city}, {c.region}</p>
            <h1 className="fade-up-2 mt-4 text-[clamp(46px,7.4vw,104px)] font-bold leading-[.92] tracking-[-.045em]">
              Your next look <Accent>starts here.</Accent>
            </h1>
            <p className="fade-up-3 mt-6 max-w-[44ch] text-[19px] text-muted">
              {lead.length ? <>{lead[0][0].toUpperCase() + lead.join(", ").slice(1)}{c.groups.length > 3 ? " and more" : ""} at {c.name}.</> : <>Welcome to {c.name}.</>}
              {c.providers.length > 1 ? ` Choose from ${c.providers.length} ${c.isBarber ? "barbers" : "artists"} and book in a minute.` : ""}
            </p>
          </div>
          <div className="fade-up-3 rounded-3xl border border-line bg-card p-5 shadow-[0_1px_0_rgba(0,0,0,.03)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <RatingChip c={c} />
              {c.today && <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${c.today.open ? "bg-terra-soft text-terra" : "bg-porcelain text-muted"}`}>{c.today.label}</span>}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Book c={c} />
              <Link href={c.has("gallery") ? c.href("gallery") : c.href("services")} className={pillGhost}>{c.has("gallery") ? "Explore our work" : "See services"}</Link>
            </div>
            <p className="mt-4 text-[14px] text-muted">{c.addressLine}{c.phone ? <> · <a href={c.phone.href} className="font-medium text-ink underline underline-offset-4">{c.phone.display}</a></> : ""}</p>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-blush sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-[620px]">
            {c.video ? (
              <HeroVideo
                src={c.video.src}
                poster={c.video.poster ?? hero?.src}
                className="h-full w-full object-cover"
                buttonClassName="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-card text-ink shadow"
              />
            ) : hero ? (
              <SmartImg src={hero.src} alt={hero.alt} priority className="h-full w-full object-cover" fallbackClassName="bg-blush" />
            ) : (
              <div className="grid h-full place-items-center p-10 text-center font-e-serif text-[clamp(40px,6vw,80px)] italic text-terra">{c.name}</div>
            )}
          </div>
          {thumbs.length === 3 && (
            <ul className="m-0 mt-3 hidden list-none grid-cols-3 gap-3 p-0 sm:grid lg:absolute lg:-bottom-10 lg:-left-10 lg:mt-0 lg:w-[70%]">
              {thumbs.map((t, i) => (
                <li key={t.src} className={`aspect-square overflow-hidden rounded-2xl border-4 border-porcelain bg-blush ${i === 1 ? "lg:-translate-y-6" : ""}`}>
                  <SmartImg src={t.src} alt={t.alt} className="h-full w-full object-cover" fallbackClassName="bg-blush" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Shell>

      {c.groups.length > 0 && (
        <section className="mt-24 lg:mt-36">
          <Shell>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Kicker>Services</Kicker>
                <Title className="mt-4 max-w-[16ch]">What are you <Accent>in for?</Accent></Title>
              </div>
              <Link href={c.href("services")} className="text-[15px] font-semibold underline underline-offset-4">Full menu ({c.serviceCount})</Link>
            </div>
            <div className="mt-10"><ServiceTabs groups={tabGroups(c)} bookUrl={c.booking?.url} bookLabel={c.booking?.label} embed={Boolean(c.booking?.embedUrl)} /></div>
          </Shell>
        </section>
      )}

      {c.providers.length > 0 && (
        <section className="mt-24 lg:mt-32">
          <Shell className="grid gap-10 rounded-[32px] bg-blush px-6 py-12 sm:px-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:p-16">
            <div>
              <Kicker>The team</Kicker>
              <Title className="mt-4">Pick your <Accent>person.</Accent></Title>
              <ol className="mt-8 list-none space-y-4 p-0">
                {["Choose a service", `Pick a ${c.isBarber ? "barber" : "stylist"} by name`, `Confirm a time on ${c.booking?.platform ?? "our booking page"}`].map((s, i) => (
                  <li key={s} className="flex items-center gap-4 text-[17px]">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card text-[14px] font-bold text-terra">{i + 1}</span>{s}
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-2">
                <Book c={c} />
                <Link href={c.href("team")} className={pillGhost}>Meet the team</Link>
              </div>
            </div>
            <ul className="m-0 grid list-none grid-cols-3 gap-4 self-center p-0 sm:grid-cols-4">
              {c.providers.slice(0, 8).map((p) => (
                <li key={p.id} className="text-center">
                  <div className="mx-auto aspect-square w-full overflow-hidden rounded-full bg-card">
                    {p.photo ? <SmartImg src={p.photo.src} alt={p.photo.alt} className="h-full w-full object-cover" fallbackClassName="bg-card" /> : <span className="grid h-full place-items-center text-2xl font-bold text-terra" aria-hidden="true">{p.name[0]}</span>}
                  </div>
                  <p className="mt-2 text-[14px] font-semibold leading-tight">{p.name}</p>
                </li>
              ))}
            </ul>
          </Shell>
        </section>
      )}

      {c.work.length >= 3 && (
        <section className="mt-24 lg:mt-32">
          <Shell>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Kicker>Our work</Kicker>
                <Title className="mt-4">Fresh from <Accent>the studio.</Accent></Title>
              </div>
              {c.has("gallery") && <Link href={c.href("gallery")} className="text-[15px] font-semibold underline underline-offset-4">Full gallery</Link>}
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
              {c.work.slice(0, c.work.length >= 5 ? 5 : 3).map((img, i, all) => (
                <figure key={img.src} className={`m-0 overflow-hidden rounded-2xl bg-blush ${i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : all.length === 3 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}>
                  <SmartImg src={img.src} alt={img.alt} className="h-full w-full object-cover" fallbackClassName="bg-blush" />
                </figure>
              ))}
            </div>
          </Shell>
        </section>
      )}

      {(c.reviews.length > 0 || c.ratings.length > 0) && (
        <section className="mt-24 lg:mt-32">
          <Shell>
            <Kicker>Reviews</Kicker>
            <div className="mt-6 flex flex-wrap items-end gap-x-12 gap-y-6">
              {c.ratings.map((r) => (
                <div key={r.label}>
                  <span className="block text-[clamp(56px,8vw,96px)] font-bold leading-none tracking-[-.04em]">{r.display}</span>
                  <span className="mt-2 flex items-center gap-2 text-[15px] text-muted"><Stars value={r.value} /> {r.count} reviews on {r.label}</span>
                </div>
              ))}
            </div>
            {c.reviews.length > 0 && (
              <ul className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-3">
                {c.reviews.slice(0, 3).map((r) => (
                  <li key={r.author + r.text.slice(0, 20)} className="rounded-3xl border border-line bg-card p-6">
                    <Stars value={r.rating} />
                    <p className="mt-4 text-[16px]">“{r.text.length > 240 ? `${r.text.slice(0, 237).trimEnd()}…` : r.text}”</p>
                    <p className="mt-4 text-[14px] text-muted">
                      <b className="text-ink">{r.author}</b> on {r.sourceLabel}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Shell>
        </section>
      )}

      <section className="mt-24 lg:mt-32">
        <Shell className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Kicker>Visit</Kicker>
            <Title className="mt-4">Good to <Accent>know.</Accent></Title>
            <div className="mt-8"><Faq c={c} /></div>
          </div>
          <div className="space-y-4 lg:pt-20">
            <div className="rounded-3xl border border-line bg-card p-6">
              <p className="text-[13px] font-semibold uppercase tracking-[.08em] text-muted">Address</p>
              <p className="mt-2 text-[18px] font-semibold">{c.addressLine}</p>
              <a href={c.directions} target="_blank" rel="noopener noreferrer" data-map-embed="" className={`${pillGhost} mt-4 min-h-11`}>Directions</a>
            </div>
            <div className="rounded-3xl border border-line bg-card p-6">
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-[.08em] text-muted">Hours</p>
              <HoursList c={c} />
            </div>
          </div>
        </Shell>
      </section>

      <section className="mt-24 lg:mt-32">
        <Shell>
          <div className="flex flex-col items-start justify-between gap-8 rounded-[32px] bg-terra px-6 py-12 text-white sm:px-10 md:flex-row md:items-center lg:p-16">
            <h2 className="max-w-[14ch] text-[clamp(34px,4.6vw,60px)] font-bold leading-[.98] tracking-[-.035em]">
              Book your <span className="font-e-serif font-normal italic">next visit.</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <Book c={c} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-ink hover:bg-terra-soft" />
              {c.phone && <a href={c.phone.href} className="inline-flex min-h-12 items-center rounded-full border border-white/50 px-6 text-[15px] font-semibold hover:bg-white/10">Call {c.phone.display}</a>}
            </div>
          </div>
        </Shell>
      </section>
    </>
  );
}

/* ─────────────────────────── Services ─────────────────────────── */

export function Services({ c }: { c: SiteContent }) {
  return (
    <>
      <InnerHead
        kicker="Services & prices"
        title={<>Everything <Accent>on the menu.</Accent></>}
        intro={
          c.groups.length ? (
            <p>
              {c.serviceCount} services in {c.groups.length} categories.{" "}
              {c.pricesConfirmed ? "Prices are starting points." : `“From” prices as listed on ${c.booking?.platform ?? "our booking page"}${c.pricesAsOf ? ` on ${c.pricesAsOf}` : ""}.`} Your exact price depends on length, density and {c.isBarber ? "barber" : "artist"}, and is shown before you confirm.
            </p>
          ) : (
            <p>See current services and prices{c.booking ? ` on ${c.booking.platform}` : ""}.</p>
          )
        }
      />
      <Shell>
        {c.groups.length > 0 ? (
          <ServiceTabs groups={tabGroups(c)} bookUrl={c.booking?.url} bookLabel={c.booking?.label} embed={Boolean(c.booking?.embedUrl)} />
        ) : (
          <Book c={c} />
        )}
        <div className="mt-16 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-blush p-8">
            <h2 className="text-[26px] font-bold tracking-[-.02em]">Not sure what to book?</h2>
            <p className="mt-2 text-muted">{c.phone ? <>Call <a className="font-semibold text-ink underline underline-offset-4" href={c.phone.href}>{c.phone.display}</a> and tell us what you have in mind; we will suggest the right service.</> : "Book the closest match and describe what you want in the booking notes."}</p>
          </div>
          <div className="rounded-3xl border border-line bg-card p-8">
            <h2 className="text-[26px] font-bold tracking-[-.02em]">Ready to go?</h2>
            <p className="mt-2 text-muted">Pick your service and {c.isBarber ? "barber" : "stylist"}, then confirm a time.</p>
            <div className="mt-5"><Book c={c} /></div>
          </div>
        </div>
      </Shell>
    </>
  );
}

/* ───────────────────────────── Team ───────────────────────────── */

export function Team({ c }: { c: SiteContent }) {
  return (
    <>
      <InnerHead kicker="Our team" title={<>Find your <Accent>{c.isBarber ? "barber" : "stylist"}.</Accent></>} intro={<p>{c.providers.length} people, one studio. When you book{c.booking ? ` on ${c.booking.platform}` : ""}, choose the person you want by name.</p>} />
      <Shell>
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4">
          {c.providers.map((p) => (
            <li key={p.id} className="rounded-3xl border border-line bg-card p-3">
              <div className="aspect-square overflow-hidden rounded-2xl bg-blush">
                {p.photo ? <SmartImg src={p.photo.src} alt={p.photo.alt} className="h-full w-full object-cover" fallbackClassName="bg-blush" /> : <span className="grid h-full place-items-center text-5xl font-bold text-terra" aria-hidden="true">{p.name[0]}</span>}
              </div>
              <div className="px-2 pb-2 pt-4">
                <h2 className="text-[18px] font-bold leading-tight">{p.name}</h2>
                {p.specialties.length > 0 && <p className="mt-1 text-[14px] text-muted">{p.specialties.join(", ")}</p>}
                <Book c={c} className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-terra hover:underline">Book with {p.name.split(" ")[0]}</Book>
              </div>
            </li>
          ))}
        </ul>
      </Shell>
    </>
  );
}

/* ──────────────────────────── Gallery ─────────────────────────── */

export function GalleryPage({ c }: { c: SiteContent }) {
  return (
    <>
      <InnerHead kicker="Our work" title={<>Recent <Accent>work.</Accent></>} intro={<p>Select a photo to see it larger. {c.usesGoogle ? "Google photos are credited to the person who took them." : ""}</p>} />
      <Shell>
        <Gallery images={c.work} layout="editorial" />
        <div className="mt-12 flex flex-wrap gap-2">
          <Book c={c} />
          {c.social.instagram && <a href={c.social.instagram} target="_blank" rel="noopener noreferrer" className={pillGhost}>Follow on Instagram</a>}
        </div>
      </Shell>
    </>
  );
}

/* ───────────────────────────── About ──────────────────────────── */

export function About({ c }: { c: SiteContent }) {
  return (
    <>
      <InnerHead kicker="About" title={<>Hello from <Accent>{c.city}.</Accent></>} />
      <Shell className="grid gap-10 lg:grid-cols-[1.3fr_.7fr]">
        <p className="text-[clamp(20px,2.2vw,26px)] leading-snug">{c.about}</p>
        <div className="rounded-3xl border border-line bg-card p-6 text-[15px]">
          <p className="font-semibold">{c.name}</p>
          <p className="mt-1 text-muted">{c.addressLine}</p>
          <div className="mt-5"><Book c={c} /></div>
        </div>
      </Shell>
    </>
  );
}

/* ───────────────────────────── Visit ──────────────────────────── */

export function Visit({ c }: { c: SiteContent }) {
  return (
    <>
      <InnerHead kicker="Visit & contact" title={<>Plan your <Accent>visit.</Accent></>} />
      <Shell className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-3xl border border-line bg-card p-7">
          <h2 className="text-[13px] font-semibold uppercase tracking-[.08em] text-muted">Address</h2>
          <address className="mt-3 text-[19px] font-semibold not-italic leading-snug">{c.address.street}{c.address.suite ? `, ${c.address.suite}` : ""}<br />{c.address.city}, {c.address.region} {c.address.postalCode}</address>
          <a href={c.directions} target="_blank" rel="noopener noreferrer" data-map-embed="" className={`${pillGhost} mt-5 min-h-11`}>Get directions</a>
        </section>
        <section className="rounded-3xl border border-line bg-card p-7">
          <h2 className="text-[13px] font-semibold uppercase tracking-[.08em] text-muted">Hours</h2>
          {c.today && <p className="mt-2 text-[14px] font-semibold text-terra">{c.today.label}</p>}
          <div className="mt-3"><HoursList c={c} /></div>
        </section>
        <section className="rounded-3xl bg-ink p-7 text-porcelain md:col-span-2 lg:col-span-1">
          <h2 className="text-[13px] font-semibold uppercase tracking-[.08em] text-porcelain/60">Book & contact</h2>
          {c.phone && <p className="mt-3 text-[24px] font-bold"><a href={c.phone.href} className="hover:underline">{c.phone.display}</a></p>}
          <ul className="mt-3 list-none space-y-1 p-0 text-porcelain/80">
            {c.policies.map((p) => <li key={p}>{p}</li>)}
            {c.paymentAccepted.length > 0 && <li>Payment: {c.paymentAccepted.join(", ")}</li>}
          </ul>
          <Book c={c} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-porcelain px-6 text-[15px] font-semibold text-ink hover:bg-terra-soft" />
        </section>
      </Shell>
      <Shell className="mt-4">
        <div className="overflow-hidden rounded-3xl border border-line bg-card">
          <MapFrame src={c.mapEmbedUrl} title={`Map of ${c.name}`} className="block h-[400px] w-full border-0" />
        </div>
      </Shell>
      <Shell className="mt-16 max-w-[900px]">
        <Title>Questions</Title>
        <div className="mt-6"><Faq c={c} /></div>
      </Shell>
    </>
  );
}

/* ─────────────────────────── Policies ─────────────────────────── */

export function Policies({ c }: { c: SiteContent }) {
  return (
    <>
      <InnerHead kicker="Policies" title="Booking policies" />
      <Shell className="max-w-[860px]">
        <ul className="m-0 list-none space-y-3 p-0">
          {c.policies.map((p) => <li key={p} className="rounded-2xl border border-line bg-card px-6 py-5 text-[18px] font-medium">{p}</li>)}
          {c.paymentAccepted.length > 0 && <li className="rounded-2xl border border-line bg-card px-6 py-5 text-[18px] font-medium">Payment accepted: {c.paymentAccepted.join(", ")}</li>}
        </ul>
        <p className="mt-8 text-muted">To change an appointment, use {c.booking ? c.booking.platform : "your booking confirmation"}{c.phone ? <> or call <a className="font-semibold text-ink underline underline-offset-4" href={c.phone.href}>{c.phone.display}</a></> : ""}.</p>
      </Shell>
    </>
  );
}

/* ─────────────────────────── Privacy ──────────────────────────── */

export function Privacy({ c }: { c: SiteContent }) {
  return (
    <>
      <InnerHead kicker="Privacy" title="Privacy notice" />
      <Shell className="max-w-[860px] space-y-8">
        {privacySections(c).map((s) => (
          <section key={s.heading}>
            <h2 className="text-[24px] font-bold tracking-[-.02em]">{s.heading}</h2>
            {s.body.map((b) => <p key={b} className="mt-2 text-muted">{b}</p>)}
          </section>
        ))}
      </Shell>
    </>
  );
}

/* ─────────────────────────── 404 ──────────────────────────────── */

export function NotFound({ c }: { c: SiteContent }) {
  return (
    <Shell className="py-24 lg:py-36">
      <Kicker>404</Kicker>
      <Title as="h1" className="mt-5 max-w-[14ch]">Nothing <Accent>here.</Accent></Title>
      <p className="mt-4 text-[18px] text-muted">The page you were looking for does not exist.</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href={c.href("home")} className={pillGhost}>Home</Link>
        <Book c={c} className={pill} />
      </div>
    </Shell>
  );
}

import Link from "next/link";
import { site, awards } from "@/content/site";
import { services } from "@/content/services";
import { locations, aggregate } from "@/content/locations";
import { Section, Eyebrow } from "@/components/Section";
import { Container } from "@/components/Container";
import { BookButton, LinkButton } from "@/components/BookButton";
import { Photo } from "@/components/Photo";
import { LocationCard } from "@/components/LocationCard";

const hero = locations[0];
const agg = aggregate();

const stats = [
  { big: String(agg.rating), small: `Average across ${agg.reviews.toLocaleString("en-US")} Google reviews`, stars: true },
  { big: String(locations.length), small: "Locations across metro Atlanta" },
  { big: site.founded, small: "Founded in Buckhead by Van and Michael Council" },
  { big: "Aveda", small: "Concept salons, products and colour lines" },
];

export default function Home() {
  return (
    <>
      <section className="relative flex min-h-[460px] items-end overflow-hidden bg-green lg:min-h-[640px]">
        <div className="absolute inset-0">
          <Photo src={hero.photo} fallback={hero.photoFallback} alt={hero.photoAlt} priority className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(170deg,rgba(14,26,23,.56)_0%,rgba(14,26,23,.34)_45%,rgba(14,26,23,.9)_100%)]" />
        </div>
        <div className="relative w-full py-12 text-[#F4F6F3] sm:py-16 lg:py-20">
          <Container>
            <Eyebrow light>Atlanta since {site.founded}</Eyebrow>
            <h1 className="h1 mb-5 max-w-[15ch]">Experience the Van Michael difference.</h1>
            <p className="lede max-w-[50ch] !text-[#DCE3DC]">
              Aveda-concept salons across metro Atlanta. Every artist trains to master a single discipline — precision
              cutting, colour, or aesthetics — and you book directly into their chair.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <BookButton />
              <LinkButton href="/locations/" variant="light">Find your salon</LinkButton>
            </div>
          </Container>
        </div>
        <span className="absolute bottom-2 right-5 text-[11px] text-[#F4F6F3]/60 lg:right-16">Photo: Van Michael Salon via Google</span>
      </section>

      <section aria-label="At a glance" className="bg-green text-green-ink">
        <div className="mx-auto max-w-site border-l border-white/[.14] md:grid md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.small} className="border-b border-r border-white/[.14] px-5 py-7 sm:px-7">
              <b className="block font-serif text-[clamp(28px,3.4vw,38px)] font-light leading-none">{s.big}</b>
              {s.stars && <span aria-hidden="true" className="block tracking-[2px] text-[#E8C98A]">★★★★★</span>}
              <span className="mt-2 block text-[13.5px] text-[#F4F6F3]/75">{s.small}</span>
            </div>
          ))}
        </div>
      </section>

      <Section>
        <Eyebrow>Services</Eyebrow>
        <h2 className="h2">What we do</h2>
        <p className="lede mt-3">
          Departmentalised salons: cutting, colour and aesthetics are each a separate craft, practised by artists who
          specialise in one. Prices vary by artist level and are shown when you book.
        </p>
        <div className="mt-9 grid gap-px border border-ink/[.07] bg-ink/[.07] sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <a key={s.slug} href={s.url} target="_blank" rel="noopener noreferrer"
               className="flex flex-col gap-2 bg-paper p-6 no-underline transition-colors hover:bg-surface">
              <h3 className="font-serif text-[21px] font-light">{s.name}</h3>
              <p className="m-0 text-[14.5px] text-soft">{s.blurb}</p>
              <span className="mt-auto pt-3 text-[13px] font-semibold text-green">Explore</span>
            </a>
          ))}
        </div>
      </Section>

      <Section tone="sunk" id="locations">
        <Eyebrow>Locations</Eyebrow>
        <h2 className="h2">Nine salons across metro Atlanta</h2>
        <p className="lede mt-3">Each salon keeps its own team and its own calendar. Choose the one nearest you.</p>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {locations.slice(0, 3).map((l) => <LocationCard key={l.slug} loc={l} />)}
        </div>
        <p className="mt-7"><Link href="/locations/" className="prose-link">See all nine locations</Link></p>
      </Section>

      <Section tone="green">
        <Eyebrow light>Our artists</Eyebrow>
        <h2 className="h2">Trained to master one craft</h2>
        <p className="lede mt-3 !text-[#DCE3DC]">
          Every artist completes an advanced training programme and then specialises. You are not booking a generalist —
          you are booking the person who does your service all day, every day.
        </p>
        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {[
            { h: "Precision cutting", p: "Shape, texture and finish, built around how you actually wear your hair." },
            { h: "Hair colour", p: "A separate colour department, with specialists in dimensional, corrective and grey-blending work." },
            { h: "Facial aesthetics", p: "Injectables and skin renewal, delivered by licensed practitioners at our Sandy Springs studio." },
          ].map((x) => (
            <div key={x.h} className="border-t border-white/20 pt-4">
              <h3 className="mb-[6px] font-serif text-[21px] font-light">{x.h}</h3>
              <p className="m-0 text-[14.5px] text-[#F4F6F3]/80">{x.p}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href={site.links.artists} variant="light" external>Meet the artists</LinkButton>
          <LinkButton href={site.links.careers} variant="light" external>Work with us</LinkButton>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
          <div>
            <Eyebrow>About</Eyebrow>
            <h2 className="h2">Four decades in Atlanta</h2>
            <p className="lede mt-4">
              Van Michael opened in Buckhead in {site.founded}, founded by brothers Van and Michael Council. It has grown
              into nine metro Atlanta salons and a team of several hundred — still Aveda, still departmentalised, still
              built on advanced training.
            </p>
            <ul className="mt-7 list-none border-t border-ink/15 p-0">
              {awards.map((a) => (
                <li key={a.title} className="flex items-baseline justify-between gap-4 border-b border-ink/[.07] py-[13px] text-[15px]">
                  <span>{a.title}</span>
                  <span className="whitespace-nowrap font-serif text-faint">{a.year}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <a href={site.links.about} target="_blank" rel="noopener noreferrer" className="prose-link">More about us</a>
            </p>
          </div>
          <figure className="m-0 aspect-[4/5] overflow-hidden bg-sunk">
            <Photo src={locations[1].photo} fallback={locations[1].photoFallback} alt="Styling floor at a Van Michael Salon" className="h-full w-full object-cover" />
          </figure>
        </div>
      </Section>
    </>
  );
}

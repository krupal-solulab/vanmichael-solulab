import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locations, getLocation } from "@/content/locations";
import { site } from "@/content/site";
import { Section, Eyebrow } from "@/components/Section";
import { Photo } from "@/components/Photo";
import { Rating } from "@/components/Rating";
import { Hours } from "@/components/Hours";
import { BookButton, LinkButton } from "@/components/BookButton";
import { LocationCard } from "@/components/LocationCard";
import { JsonLd } from "@/components/JsonLd";
import { locationSchema, breadcrumbSchema } from "@/lib/schema";

type Props = { params: { slug: string } };

/** Pre-renders one static page per location — the local SEO surface. */
export function generateStaticParams() {
  return locations.map((l) => ({ slug: l.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const loc = getLocation(params.slug);
  if (!loc) return {};
  return {
    // absolute: skip the "| Van Michael Salon" template so titles stay short
    title: { absolute: loc.metaTitle },
    description: `${loc.fullName}. ${loc.street}, ${loc.city}, ${loc.state} ${loc.zip}. ${loc.intro} Opening hours, directions and online booking.`,
    alternates: { canonical: `/locations/${loc.slug}/` },
    openGraph: { title: `${loc.fullName}`, description: loc.intro, images: [loc.photo] },
  };
}

export default function LocationPage({ params }: Props) {
  const loc = getLocation(params.slug);
  if (!loc) notFound();
  const others = locations.filter((l) => l.slug !== loc.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={locationSchema(loc)} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: `${site.url}/` },
        { name: "Locations", url: `${site.url}/locations/` },
        { name: loc.name, url: `${site.url}/locations/${loc.slug}/` },
      ])} />

      <Section>
        <nav aria-label="Breadcrumb" className="mb-5 text-[14px] text-soft">
          <Link href="/locations/" className="hover:text-ink">← All locations</Link>
        </nav>
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
          <div>
            <Eyebrow>{loc.city}, {loc.state}</Eyebrow>
            <h1 className="h2 flex flex-wrap items-baseline gap-3">
              {loc.name}
              {loc.badge && (
                <span className="rounded-sm bg-green-tint px-2 py-[3px] font-sans text-[11px] font-bold uppercase tracking-wide text-green">
                  {loc.badge}
                </span>
              )}
            </h1>
            <div className="mt-3"><Rating rating={loc.rating} reviews={loc.reviews} /></div>
            <p className="lede mt-4">{loc.intro}</p>
            <address className="mt-6 text-[16px] not-italic leading-relaxed text-soft">
              {loc.street}<br />{loc.city}, {loc.state} {loc.zip}
            </address>
            <p className="mt-2">
              <a href={loc.phoneHref} className="prose-link text-[16px]">{loc.phone}</a>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <BookButton>Book at {loc.name}</BookButton>
              <LinkButton href={loc.mapsUrl} external>Directions</LinkButton>
            </div>
          </div>

          <div className="border border-ink/[.07] bg-surface">
            <div className="aspect-[4/3] overflow-hidden bg-sunk">
              <Photo src={loc.photo} fallback={loc.photoFallback} alt={loc.photoAlt} priority className="h-full w-full object-cover" />
            </div>
            <div className="p-6">
              <h2 className="mb-1 font-serif text-[21px] font-light">Opening hours</h2>
              <Hours hours={loc.hours} className="!border-t-0 !pt-2 text-[14.5px]" />
              <p className="mt-4 text-[13px] text-faint">Holiday hours may differ — call ahead.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="sunk">
        <Eyebrow>Nearby</Eyebrow>
        <h2 className="h2">Other Van Michael salons</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {others.map((l) => <LocationCard key={l.slug} loc={l} />)}
        </div>
        <p className="mt-7"><Link href="/locations/" className="prose-link">See all nine</Link></p>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/Section";
import { LocationGrid } from "@/components/LocationGrid";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { site } from "@/content/site";
import { locations } from "@/content/locations";

export const metadata: Metadata = {
  title: "Locations — Nine Hair Salons Across Metro Atlanta",
  description:
    "Find your nearest Van Michael Salon: Buckhead, Midtown, Virginia-Highland, Sandy Springs, The Forum, Avalon, East Cobb, Van Michael Men and Van Michael Aesthetics. Addresses, hours and booking.",
  alternates: { canonical: "/locations/" },
};

export default function LocationsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: `${site.url}/` },
        { name: "Locations", url: `${site.url}/locations/` },
      ])} />
      <Section tone="sunk">
        <Eyebrow>Locations</Eyebrow>
        <h1 className="h2">Nine salons across metro Atlanta</h1>
        <p className="lede mt-3">
          Each salon keeps its own team and its own calendar. Pick the one nearest you and book straight into it.
        </p>
        <LocationGrid />
        <p className="mt-7 text-[13px] text-faint">
          Ratings, hours and location photography via Google. Holiday hours may differ — call ahead.
          {" "}{locations.length} locations listed.
        </p>
      </Section>
    </>
  );
}

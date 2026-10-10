import type { Metadata } from "next";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { Section, Eyebrow } from "@/components/Section";
import { BookButton } from "@/components/BookButton";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Services — Cutting, Colour, Grooming and Aesthetics",
  description:
    "Precision cutting, dimensional colour, New Talents, men's grooming, aesthetics, makeup and waxing, bridal, extensions and smoothing. Prices are tiered by artist level and shown when you book.",
  alternates: { canonical: "/services/" },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: `${site.url}/` },
        { name: "Services", url: `${site.url}/services/` },
      ])} />
      <Section>
        <Eyebrow>Services</Eyebrow>
        <h1 className="h2">What we do</h1>
        <p className="lede mt-3">
          Departmentalised salons: cutting, colour and aesthetics are each a separate craft, practised by artists who
          specialise in one.
        </p>
        <div className="mt-9 border-t border-ink">
          {services.map((s) => (
            <a key={s.slug} href={s.url} target="_blank" rel="noopener noreferrer"
               className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink/[.07] py-6 no-underline group">
              <div className="flex-1 basis-[28ch]">
                <h2 className="font-serif text-[clamp(20px,2.4vw,27px)] font-light group-hover:text-green">{s.name}</h2>
                <p className="m-0 mt-1 max-w-[52ch] text-[15px] text-soft">{s.blurb}</p>
              </div>
              <span className="whitespace-nowrap text-[13.5px] text-faint">On vanmichael.com</span>
            </a>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border border-ink/[.07] bg-surface p-7 sm:p-10">
          <h2 className="h2 max-w-[18ch]">Prices are shown when you book.</h2>
          <BookButton>See services and prices</BookButton>
        </div>
      </Section>
    </>
  );
}

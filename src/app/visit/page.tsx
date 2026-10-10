import type { Metadata } from "next";
import { site, faq } from "@/content/site";
import { Section, Eyebrow } from "@/components/Section";
import { BookButton, LinkButton } from "@/components/BookButton";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Visit — Booking, Pricing and Your First Appointment",
  description:
    "How to book at Van Michael Salon, what an appointment costs, what New Talents means, gift cards and how to reach us.",
  alternates: { canonical: "/visit/" },
};

export default function VisitPage() {
  return (
    <>
      <JsonLd data={faqSchema(faq)} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: `${site.url}/` },
        { name: "Visit", url: `${site.url}/visit/` },
      ])} />
      <Section tone="sunk">
        <Eyebrow>Visit</Eyebrow>
        <h1 className="h2">Before you come in</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:gap-14">
          <div>
            {faq.map((f, i) => (
              <details key={f.q} open={i === 0} className="border-b border-ink/[.07] py-[18px]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-[20px] font-normal [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="text-[22px] leading-none text-green">+</span>
                </summary>
                <div className="max-w-[68ch] pt-[10px] text-soft">{f.a}</div>
              </details>
            ))}
          </div>
          <div>
            <h2 className="mb-[14px] font-serif text-[24px] font-light">Contact</h2>
            <p className="text-[15px] text-soft">
              Corporate Resource Center<br />{site.corporate.street}<br />
              {site.corporate.city}, {site.corporate.state} {site.corporate.zip}
            </p>
            <p><a href={site.corporate.phoneHref} className="prose-link">{site.corporate.phone}</a></p>
            <div className="mt-5 flex flex-wrap gap-[10px]">
              <LinkButton href={site.links.contact} external className="!min-h-[40px] !px-4 !py-[9px] !text-[13.5px]">Contact us</LinkButton>
              <LinkButton href={site.links.policy} external className="!min-h-[40px] !px-4 !py-[9px] !text-[13.5px]">Salon policies</LinkButton>
              <LinkButton href={site.booking.giftCards} external className="!min-h-[40px] !px-4 !py-[9px] !text-[13.5px]">Gift cards</LinkButton>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border border-ink/[.07] bg-surface p-7 sm:p-10">
          <h2 className="h2 max-w-[18ch]">Book the chair that fits.</h2>
          <div className="flex flex-wrap gap-3">
            <BookButton />
            <LinkButton href="/locations/">Find a location</LinkButton>
          </div>
        </div>
      </Section>
    </>
  );
}

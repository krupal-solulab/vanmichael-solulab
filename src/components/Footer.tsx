import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "./Container";

const col = (title: string, items: { href: string; label: string; ext?: boolean }[]) => (
  <div key={title}>
    <h4 className="mb-[14px] font-sans text-[12.5px] uppercase tracking-[.09em] text-paper/55">{title}</h4>
    <ul className="m-0 list-none p-0">
      {items.map((i) => (
        <li key={i.label} className="mb-[10px] text-[14.5px] text-paper/70">
          {i.ext ? (
            <a href={i.href} target="_blank" rel="noopener noreferrer" className="hover:underline">{i.label}</a>
          ) : (
            <Link href={i.href} className="hover:underline">{i.label}</Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export function Footer() {
  return (
    <footer className="bg-ink pb-7 pt-12 text-paper sm:pt-16">
      <Container>
        <div className="grid gap-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <span className="mb-[14px] inline-block font-serif text-[19px] uppercase leading-tight tracking-[.11em]">
              {site.shortName}
              <small className="mt-[2px] block font-sans text-[9.5px] tracking-[.2em] text-paper/55">{site.tagline}</small>
            </span>
            <p className="text-[14.5px] text-paper/70">Aveda-concept hair salons across metro Atlanta since {site.founded}.</p>
            <p className="text-[14.5px] text-paper/70">
              {site.corporate.street}<br />{site.corporate.city}, {site.corporate.state} {site.corporate.zip}<br />
              <a href={site.corporate.phoneHref} className="hover:underline">{site.corporate.phone}</a>
            </p>
          </div>
          {col("Salon", [
            { href: "/services/", label: "Services" },
            { href: "/locations/", label: "Locations" },
            { href: site.links.artists, label: "Our artists", ext: true },
            { href: site.links.about, label: "About us", ext: true },
            { href: site.links.aveda, label: "Aveda", ext: true },
          ])}
          {col("Book", [
            { href: site.booking.url, label: "Book online", ext: true },
            { href: site.booking.giftCards, label: "Gift cards", ext: true },
            { href: "/visit/", label: "Visit & FAQ" },
            { href: site.links.careers, label: "Careers", ext: true },
            { href: site.links.contact, label: "Contact", ext: true },
          ])}
          {col("Follow", [
            { href: site.social.instagram, label: "Instagram", ext: true },
            { href: site.social.facebook, label: "Facebook", ext: true },
            { href: site.links.blog, label: "Blog", ext: true },
            { href: site.links.policy, label: "Policies", ext: true },
            { href: site.links.privacy, label: "Privacy policy", ext: true },
          ])}
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-x-6 gap-y-[10px] border-t border-white/[.15] pt-5 text-[12.5px] text-paper/55">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <span>Ratings, hours and location photography via Google.</span>
        </div>
      </Container>
    </footer>
  );
}

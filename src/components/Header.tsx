import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "./Container";
import { BookButton } from "./BookButton";

const nav = [
  { href: "/services/", label: "Services" },
  { href: "/locations/", label: "Locations" },
  { href: "/visit/", label: "Visit" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/[.07] bg-paper/90 backdrop-blur">
      <Container className="flex min-h-[72px] items-center gap-4">
        <Link href="/" className="whitespace-nowrap font-serif text-[19px] uppercase leading-tight tracking-[.11em]">
          {site.shortName}
          <small className="mt-[2px] block font-sans text-[9.5px] tracking-[.2em] text-faint">{site.tagline}</small>
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-6 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-[14.5px] text-soft hover:text-ink">{n.label}</Link>
          ))}
          <a href={site.links.artists} target="_blank" rel="noopener noreferrer" className="text-[14.5px] text-soft hover:text-ink">Our artists</a>
        </nav>
        <BookButton className="ml-auto !min-h-[40px] !px-4 !py-[9px] !text-[13.5px] lg:ml-5">Book now</BookButton>
      </Container>
    </header>
  );
}

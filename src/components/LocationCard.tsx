import Link from "next/link";
import type { Location } from "@/content/locations";
import { Photo } from "./Photo";
import { Rating } from "./Rating";
import { Hours } from "./Hours";
import { BookButton, LinkButton } from "./BookButton";

export function LocationCard({ loc }: { loc: Location }) {
  return (
    <article className="flex flex-col overflow-hidden border border-ink/[.07] bg-surface">
      <Link href={`/locations/${loc.slug}`} className="block aspect-[16/10] overflow-hidden bg-sunk">
        <Photo src={loc.photo} fallback={loc.photoFallback} alt={loc.photoAlt} className="h-full w-full object-cover" />
      </Link>
      <div className="flex flex-1 flex-col gap-[10px] p-[22px] pb-6">
        <h3 className="flex flex-wrap items-baseline gap-[9px] font-serif text-[21px] font-light leading-tight">
          <Link href={`/locations/${loc.slug}`} className="hover:text-green">{loc.name}</Link>
          {loc.badge && (
            <span className="rounded-sm bg-green-tint px-2 py-[3px] text-[11px] font-bold uppercase tracking-wide text-green">
              {loc.badge}
            </span>
          )}
        </h3>
        <Rating rating={loc.rating} reviews={loc.reviews} />
        <address className="text-[14.5px] not-italic leading-relaxed text-soft">
          {loc.street}<br />{loc.city}, {loc.state} {loc.zip}
        </address>
        <a href={loc.phoneHref} className="w-fit border-b border-green pb-px text-[15px]">{loc.phone}</a>
        <Hours hours={loc.hours} />
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <BookButton className="!min-h-[40px] !px-4 !py-[9px] !text-[13.5px]">Book</BookButton>
          <LinkButton href={`/locations/${loc.slug}`} className="!min-h-[40px] !px-4 !py-[9px] !text-[13.5px]">Details</LinkButton>
        </div>
      </div>
    </article>
  );
}

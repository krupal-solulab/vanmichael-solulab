import type { SiteContent, RouteId } from "../content";
import { DAY_NAMES } from "@/lib/normalize";
import type { BusinessRecord } from "@/lib/types";

/**
 * One coherent JSON-LD graph per page (brief T02). No aggregateRating: ratings
 * gathered from Google/Booksy are third-party and self-serving review markup is
 * ineligible. `url`/`@id` are only emitted once a production domain exists.
 */
export function SchemaGraph({ c, r, route, domain }: { c: SiteContent; r: BusinessRecord; route: RouteId; domain?: string }) {
  const id = domain ? `${domain}/#business` : undefined;
  const business: Record<string, unknown> = {
    "@type": c.isBarber ? "BarberShop" : "HairSalon",
    ...(id ? { "@id": id, url: `${domain}/` } : {}),
    name: c.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: [c.address.street, c.address.suite].filter(Boolean).join(", "),
      addressLocality: c.address.city,
      addressRegion: c.address.region,
      postalCode: c.address.postalCode,
      addressCountry: c.address.country,
    },
    ...(c.phone ? { telephone: c.phone.href.replace("tel:", "") } : {}),
    ...(r.geo ? { geo: { "@type": "GeoCoordinates", latitude: r.geo.value.lat, longitude: r.geo.value.lng } } : {}),
    ...(r.hours
      ? {
          openingHoursSpecification: r.hours.value.map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: DAY_NAMES[h.day],
            opens: h.open,
            closes: h.close,
          })),
        }
      : {}),
    ...(c.booking
      ? { potentialAction: { "@type": "ReserveAction", target: { "@type": "EntryPoint", urlTemplate: c.booking.url } } }
      : {}),
    sameAs: [c.social.instagram, c.social.facebook, c.social.tiktok].filter(Boolean),
  };
  const graph: Record<string, unknown>[] = [business];
  if (domain && route !== "home") {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${domain}/` },
        { "@type": "ListItem", position: 2, name: route[0].toUpperCase() + route.slice(1), item: `${domain}/${route}/` },
      ],
    });
  }
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export const ROUTE_TITLES: Record<RouteId, string> = {
  home: "",
  services: "Services & Prices",
  team: "Our Team",
  gallery: "Our Work",
  about: "About",
  visit: "Visit & Contact",
  policies: "Booking Policies",
  privacy: "Privacy",
};

export function pageTitle(c: SiteContent, route: RouteId) {
  if (route === "home") return `${c.name} | ${c.isBarber ? "Barbershop" : "Hair Salon"} in ${c.city}, ${c.region}`;
  return `${ROUTE_TITLES[route]} | ${c.name}, ${c.city}`;
}

export function pageDescription(c: SiteContent, route: RouteId) {
  const cats = c.topCategories.slice(0, 3).join(", ");
  switch (route) {
    case "services":
      return `${c.serviceCount ? `${c.serviceCount} services` : "Services"}${cats ? ` including ${cats}` : ""} at ${c.name} in ${c.city}, ${c.region}. See prices and book online.`;
    case "team":
      return `Meet the ${c.providers.length} ${c.isBarber ? "barbers" : "stylists and artists"} at ${c.name} in ${c.city} and book with the one you want.`;
    case "gallery":
      return `Recent work from ${c.name}, ${c.city}, ${c.region}.`;
    case "visit":
      return `Address, hours, directions and booking for ${c.name}: ${c.addressLine}.`;
    default:
      return `${c.name} is a ${c.kind} at ${c.addressLine}.${cats ? ` ${cats[0].toUpperCase() + cats.slice(1)} and more.` : ""} Book online.`;
  }
}

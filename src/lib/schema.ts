import { site } from "@/content/site";
import { locations, type Location, aggregate } from "@/content/locations";

const postal = (l: Location) => ({
  "@type": "PostalAddress",
  streetAddress: l.street,
  addressLocality: l.city,
  addressRegion: l.state,
  postalCode: l.zip,
  addressCountry: "US",
});

export function locationSchema(l: Location) {
  return {
    "@context": "https://schema.org",
    "@type": l.schemaType,
    "@id": `${site.url}/locations/${l.slug}/`,
    name: l.fullName,
    url: `${site.url}/locations/${l.slug}/`,
    telephone: l.phoneHref.replace("tel:", ""),
    image: l.photo,
    address: postal(l),
    geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng },
    openingHours: l.openingHours,
    hasMap: l.mapsUrl,
    aggregateRating: { "@type": "AggregateRating", ratingValue: l.rating, reviewCount: l.reviews },
    parentOrganization: { "@type": "Organization", name: site.name, url: site.url },
    potentialAction: {
      "@type": "ReserveAction",
      target: { "@type": "EntryPoint", urlTemplate: site.booking.url, actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"] },
      result: { "@type": "Reservation", name: "Salon appointment" },
    },
  };
}

export function organizationSchema() {
  const agg = aggregate();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    foundingDate: site.founded,
    telephone: site.corporate.phoneHref.replace("tel:", ""),
    sameAs: [site.social.instagram, site.social.facebook],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.corporate.street,
      addressLocality: site.corporate.city,
      addressRegion: site.corporate.state,
      postalCode: site.corporate.zip,
      addressCountry: "US",
    },
    aggregateRating: { "@type": "AggregateRating", ratingValue: agg.rating, reviewCount: agg.reviews },
    subOrganization: locations.map((l) => ({
      "@type": l.schemaType,
      name: l.fullName,
      url: `${site.url}/locations/${l.slug}/`,
      telephone: l.phoneHref.replace("tel:", ""),
      address: postal(l),
      geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng },
      openingHours: l.openingHours,
      aggregateRating: { "@type": "AggregateRating", ratingValue: l.rating, reviewCount: l.reviews },
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: t.url })),
  };
}

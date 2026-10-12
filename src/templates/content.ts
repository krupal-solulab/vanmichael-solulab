import type { Asset, BusinessRecord, Service, ServiceCategory, TemplateFamily } from "@/lib/types";
import {
  CATEGORY_LABELS, CATEGORY_ORDER, DAY_NAMES, addressLine, directionsUrl, formatTime, groupHours, telHref, type HoursRow,
} from "@/lib/normalize";
import { bookingEmbedUrl } from "@/lib/sources/booking-parse";

/**
 * Everything a template renders, derived once from the verified record.
 * Both families read this same object, so they can never disagree on a fact.
 */

export type RouteId = "home" | "services" | "team" | "gallery" | "about" | "visit" | "policies" | "privacy";

export type Img = { src: string; alt: string; credit?: { text: string; url?: string }; width?: number; height?: number; stock: boolean; pending: boolean };

export type SiteContent = ReturnType<typeof buildContent>;

export function imageUrl(a: Asset, width = 1600) {
  if (a.permission === "places-attribution") return `/api/media/places/?name=${encodeURIComponent(a.src)}&w=${width}`;
  return a.src;
}

const toImg = (a: Asset, width?: number): Img => ({
  src: imageUrl(a, width),
  alt: a.alt,
  credit: a.credit,
  width: a.width,
  height: a.height,
  stock: a.origin === "stock",
  pending: a.permission === "pending-owner",
});

export function buildContent(r: BusinessRecord, opts: { jobId: string; family: TemplateFamily; now?: Date }) {
  const base = `/p/${opts.jobId}/${opts.family}`;
  const name = r.name.value;
  const a = r.address.value;
  const isBarber = r.category === "barber_shop";

  const photos = r.assets.filter((x) => x.kind === "photo");
  const work = photos.filter((x) => x.role === "work" || x.role === "cover");
  const cover = photos.find((x) => x.role === "cover") ?? work[0];
  const logo = photos.find((x) => x.role === "logo");
  const video = r.assets.find((x) => x.kind === "video");
  const providerPhoto = (id?: string) => {
    const asset = id ? r.assets.find((x) => x.id === id) : undefined;
    return asset ? toImg(asset, 800) : undefined;
  };

  // Services grouped hair-first, then the rest of the confirmed menu (brief S03).
  const groups = CATEGORY_ORDER.map((cat) => ({
    id: cat,
    label: CATEGORY_LABELS[cat],
    services: r.services.filter((s) => s.category === cat),
  })).filter((g) => g.services.length);

  const priceLabel = (s: Service) =>
    s.price ? `${s.price.qualifier === "from" ? "from " : ""}${new Intl.NumberFormat("en-US", { style: "currency", currency: s.price.currency, maximumFractionDigits: 0 }).format(s.price.amount)}` : undefined;

  const hoursRows: HoursRow[] | null = r.hours ? groupHours(r.hours.value) : null;
  const today = todayLine(r, opts.now ?? new Date());

  const routes: RouteId[] = ["home", "services"];
  if (r.providers.length) routes.push("team");
  if (work.length >= 3) routes.push("gallery");
  if (r.about) routes.push("about");
  routes.push("visit");
  if (r.policies || r.paymentAccepted.length) routes.push("policies");
  routes.push("privacy");

  const href = (route: RouteId, hash = "") => `${base}${route === "home" ? "/" : `/${route}/`}${hash}`;
  const nav: { route: RouteId; label: string }[] = [
    { route: "services" as const, label: "Services" },
    ...(routes.includes("team") ? [{ route: "team" as const, label: "Our Team" }] : []),
    ...(routes.includes("gallery") ? [{ route: "gallery" as const, label: "Our Work" }] : []),
    ...(routes.includes("about") ? [{ route: "about" as const, label: "About" }] : []),
    { route: "visit" as const, label: "Visit" },
  ];

  const booking = r.booking
    ? {
        url: r.booking.url,
        platform: r.booking.platform,
        label: r.booking.platform === "online booking" ? "Book online" : `Book on ${r.booking.platform}`,
        /** In-page booking widget, when the platform officially supports embedding. */
        embedUrl: bookingEmbedUrl(r.booking.url),
      }
    : null;

  const ratings = r.ratings.map((x) => ({ ...x, display: x.value.toFixed(1) }));
  const topCategories = groups.slice(0, 4).map((g) => g.label.toLowerCase());

  return {
    base,
    family: opts.family,
    jobId: opts.jobId,
    name,
    isBarber,
    kind: isBarber ? "barbershop" : "hair studio",
    city: a.city,
    region: a.region,
    address: a,
    addressLine: addressLine(a),
    phone: r.phone ? { display: r.phone.value, href: telHref(r.phone.value) } : null,
    directions: r.mapsUrl ?? directionsUrl(name, a),
    /** Google's embeddable map of the business, shown in-page instead of opening Google Maps. */
    mapEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(`${name}, ${addressLine(a)}`)}&output=embed`,
    booking,
    social: r.social,
    hoursRows,
    today,
    ratings,
    reviews: r.reviews.filter((x) => x.rating >= 4).slice(0, 6),
    about: r.about?.value ?? null,
    policies: r.policies?.value ?? [],
    paymentAccepted: r.paymentAccepted,
    groups,
    serviceCount: r.services.length,
    pricesAsOf: r.services[0]
      ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: r.timezone }).format(new Date(r.services[0].evidence.retrievedAt))
      : null,
    pricesConfirmed: r.services.length > 0 && r.services.every((s) => s.status === "owner-confirmed"),
    topCategories,
    priceLabel,
    providers: r.providers.map((p) => ({ ...p, photo: providerPhoto(p.photoAssetId) })),
    cover: cover ? toImg(cover, 2000) : undefined,
    logo: logo ? toImg(logo, 400) : undefined,
    work: work.map((x) => toImg(x, 1400)),
    video: video ? { src: video.src, poster: video.poster, credit: video.credit } : undefined,
    usesGoogle: r.assets.some((x) => x.permission === "places-attribution") || r.reviews.some((x) => x.source === "google-places"),
    routes,
    nav,
    href,
    has: (route: RouteId) => routes.includes(route),
    categoryLabel: (c: ServiceCategory) => CATEGORY_LABELS[c],
    year: (opts.now ?? new Date()).getFullYear(),
  };
}

function todayLine(r: BusinessRecord, now: Date) {
  if (!r.hours) return null;
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: r.timezone, weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hm = `${parts.find((p) => p.type === "hour")?.value}:${parts.find((p) => p.type === "minute")?.value}`;
  const day = DAY_NAMES.indexOf(weekday);
  const slots = r.hours.value.filter((h) => h.day === day);
  if (!slots.length) return { open: false, label: "Closed today" };
  const current = slots.find((s) => hm >= s.open && hm < s.close);
  if (current) return { open: true, label: `Open today until ${formatTime(current.close)}` };
  const later = slots.find((s) => hm < s.open);
  return later ? { open: false, label: `Opens today at ${formatTime(later.open)}` } : { open: false, label: "Closed for today" };
}

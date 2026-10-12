import "server-only";
import type { Asset, BusinessRecord, Evidence, HoursInterval, JobInput, Provider, Review, Service, SourceLog, Address } from "./types";
import { readBookingPage, type BookingFacts } from "./sources/booking";
import { readWebsite, type WebsiteFacts } from "./sources/website";
import { addressFromPlace, getPlace, hoursFromPlace, parseMapsLink, placesEnabled, searchPlace, type PlaceResult } from "./sources/places";
import { findHeroVideo, stockEnabled } from "./sources/stock";
import { categorize, digits, displayName, formatUsPhone, sameAddress, sameHours, slugify } from "./normalize";

export type ResearchResult = { record: BusinessRecord | null; sources: SourceLog[]; notices: string[]; error?: string };

const now = () => new Date().toISOString();
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Resolves one business from whatever links were supplied and merges the
 * sources into a single record. Precedence for identity facts:
 * Google Business Profile (owner-managed) > booking platform > website.
 * Sources that do not match the same name/address/phone are not merged.
 */
export async function research(input: JobInput): Promise<ResearchResult> {
  const sources: SourceLog[] = [];
  const notices: string[] = [];
  const log = (kind: SourceLog["kind"], url: string, status: SourceLog["status"], note?: string) =>
    sources.push({ kind, url, status, retrievedAt: now(), note });

  // 1. Read every supplied source independently; one failure never blocks the rest.
  const [booking, website] = await Promise.all([
    input.bookingUrl
      ? readBookingPage(input.bookingUrl).then(
          (b) => (log("booking", b.url, "ok", `${b.platform}: ${b.offers.length} services, ${b.employees.length} staff, ${b.photos.length} photos`), b),
          (e) => (log("booking", input.bookingUrl!, "failed", errMsg(e)), undefined),
        )
      : Promise.resolve(undefined),
    input.websiteUrl
      ? readWebsite(input.websiteUrl).then(
          (w) => (log("website", w.url, "ok"), w),
          (e) => (log("website", input.websiteUrl!, "failed", errMsg(e)), undefined),
        )
      : Promise.resolve(undefined),
  ]);
  if (booking) notices.push(...booking.notices);

  // 2. Google Places: from the Maps link if given, otherwise look the business up to cross-check.
  let place: PlaceResult | undefined;
  if (!placesEnabled()) {
    log("google-places", input.mapsUrl ?? "—", "skipped", "GOOGLE_PLACES_API_KEY is not configured.");
    if (input.mapsUrl) notices.push("A Google Maps link was supplied but no Places API key is configured, so Google data was not read.");
  } else {
    try {
      place = await resolvePlace(input.mapsUrl, booking, website);
      if (place) log("google-places", place.googleMapsUri ?? `place:${place.id}`, "ok", `${place.photos?.length ?? 0} photos, ${place.reviews?.length ?? 0} reviews`);
      else log("google-places", input.mapsUrl ?? "search", "failed", "No matching Google listing was found.");
    } catch (e) {
      log("google-places", input.mapsUrl ?? "search", "failed", errMsg(e));
    }
  }

  // 3. Identity check: never merge a similarly named but different business.
  const placeAddr = place ? addressFromPlace(place) : undefined;
  const bookingAddr = booking ? addressFromBooking(booking) : undefined;
  if (place && booking && placeAddr && bookingAddr) {
    const phoneMatch = place.nationalPhoneNumber && booking.phone && digits(place.nationalPhoneNumber) === digits(booking.phone);
    if (!sameAddress(placeAddr, bookingAddr) && !phoneMatch) {
      notices.push(
        `The Google listing (${placeAddr.street}, ${placeAddr.postalCode}) and the ${booking.platform} page (${bookingAddr.street}, ${bookingAddr.postalCode}) ` +
          `do not appear to be the same business. Only the ${input.mapsUrl ? "Google" : booking.platform} data was used.`,
      );
      if (input.mapsUrl) return assemble(input, sources, notices, place, undefined, website);
      return assemble(input, sources, notices, undefined, booking, website);
    }
  }

  return assemble(input, sources, notices, place, booking, website);
}

async function resolvePlace(mapsUrl: string | undefined, booking?: BookingFacts, website?: WebsiteFacts) {
  if (mapsUrl) {
    const hints = await parseMapsLink(mapsUrl);
    if (hints.placeId) return getPlace(hints.placeId);
    const query = hints.name ?? hints.query;
    if (!query) throw new Error("Could not identify a place in that Google Maps link. Open the business in Google Maps and copy the Share link.");
    const results = await searchPlace(query, hints.near);
    return results[0];
  }
  // No Maps link: find the listing that matches the booking page's identity, if any.
  const name = booking?.name ?? website?.name;
  if (!name) return undefined;
  const addr = booking ? addressFromBooking(booking) : undefined;
  const results = await searchPlace([name, addr?.street, addr?.city, addr?.region].filter(Boolean).join(", "), booking?.geo);
  return results.find((p) => {
    const pa = addressFromPlace(p);
    return addr && pa ? sameAddress(addr, pa) : false;
  });
}

function addressFromBooking(b: BookingFacts): Address | undefined {
  if (!b.street || !b.city || !b.postalCode) return undefined;
  return { street: b.street, suite: b.suite, city: b.city, region: b.region ?? "", postalCode: b.postalCode, country: "US" };
}

async function assemble(
  input: JobInput,
  sources: SourceLog[],
  notices: string[],
  place?: PlaceResult,
  booking?: BookingFacts,
  website?: WebsiteFacts,
): Promise<ResearchResult> {
  const placeEv: Evidence | undefined = place ? { source: "google-places", url: place.googleMapsUri ?? `place:${place.id}`, retrievedAt: now() } : undefined;
  const bookEv: Evidence | undefined = booking ? { source: "booking", url: booking.url, retrievedAt: booking.retrievedAt } : undefined;
  const webEv: Evidence | undefined = website ? { source: "website", url: website.url, retrievedAt: website.retrievedAt } : undefined;

  // Name
  const names = [
    place?.displayName?.text && placeEv ? { v: place.displayName.text, e: placeEv } : undefined,
    booking?.name && bookEv ? { v: booking.name, e: bookEv } : undefined,
    website?.name && webEv ? { v: website.name, e: webEv } : undefined,
  ].filter(Boolean) as { v: string; e: Evidence }[];
  if (!names.length) {
    return { record: null, sources, notices, error: "None of the supplied links identified a business. Check the links and try again." };
  }
  const name = merge(names, (a, b) => slugify(a) === slugify(b));

  // Address
  const addrs = [
    place && placeEv && addressFromPlace(place) ? { v: addressFromPlace(place)!, e: placeEv } : undefined,
    booking && bookEv && addressFromBooking(booking) ? { v: addressFromBooking(booking)!, e: bookEv } : undefined,
  ].filter(Boolean) as { v: Address; e: Evidence }[];
  if (!addrs.length) {
    return { record: null, sources, notices, error: "No street address was found. Add a Google Maps link or a booking page that lists the address." };
  }
  const address = merge(addrs, sameAddress);
  // Suites are often missing on one side; keep whichever source has it.
  if (!address.value.suite) address.value.suite = addrs.find((a) => a.v.suite)?.v.suite;

  // Phone
  const phones = [
    place?.nationalPhoneNumber && placeEv ? { v: formatUsPhone(place.nationalPhoneNumber), e: placeEv } : undefined,
    booking?.phone && bookEv ? { v: formatUsPhone(booking.phone), e: bookEv } : undefined,
    website?.phone && webEv ? { v: formatUsPhone(website.phone), e: webEv } : undefined,
  ].filter(Boolean) as { v: string; e: Evidence }[];
  const phone = phones.length ? merge(phones, (a, b) => digits(a) === digits(b)) : null;

  // Geo
  const geoVals = [
    place?.location && placeEv ? { v: { lat: place.location.latitude, lng: place.location.longitude }, e: placeEv } : undefined,
    booking?.geo && bookEv ? { v: booking.geo, e: bookEv } : undefined,
  ].filter(Boolean) as { v: { lat: number; lng: number }; e: Evidence }[];
  const geo = geoVals.length ? merge(geoVals, (a, b) => Math.abs(a.lat - b.lat) < 0.002 && Math.abs(a.lng - b.lng) < 0.002) : null;

  // Hours
  const placeHours = place ? hoursFromPlace(place) : undefined;
  const hourVals = [
    placeHours && placeEv ? { v: placeHours, e: placeEv } : undefined,
    booking?.hours && bookEv ? { v: booking.hours, e: bookEv } : undefined,
  ].filter(Boolean) as { v: HoursInterval[]; e: Evidence }[];
  const hours = hourVals.length ? merge(hourVals, sameHours) : null;

  // Category
  const isBarber = place?.primaryType === "barber_shop" || /barber/i.test(booking?.url ?? "");
  const category = isBarber ? "barber_shop" : "hair_salon";

  // Ratings: each platform labelled as itself, never relabelled (brief §9).
  const ratings: BusinessRecord["ratings"] = [];
  if (place?.rating && place.userRatingCount && placeEv) {
    ratings.push({ label: "Google", value: place.rating, count: place.userRatingCount, url: placeEv.url, retrievedAt: placeEv.retrievedAt, source: "google-places" });
  }
  if (booking?.rating && bookEv) {
    ratings.push({ label: booking.platform, value: Math.round(booking.rating.value * 10) / 10, count: booking.rating.count, url: booking.url, retrievedAt: booking.retrievedAt, source: "booking" });
  }

  // Services and providers come from the booking platform: it is the transactional source.
  const services: Service[] = (booking?.offers ?? []).map((o, i) => ({
    id: `${slugify(o.name) || "service"}-${i}`,
    sourceName: o.name,
    name: displayName(o.name),
    category: categorize(o.name),
    price: o.price != null ? { amount: o.price, currency: o.currency ?? "USD", qualifier: "from" as const } : undefined,
    evidence: bookEv!,
    status: "needs-review" as const,
  }));

  const assets: Asset[] = [];
  const providers: Provider[] = (booking?.employees ?? []).map((e, i) => {
    const id = `${slugify(e.name)}-${i}`;
    let photoAssetId: string | undefined;
    if (e.image && bookEv) {
      photoAssetId = `provider-${id}`;
      assets.push({
        id: photoAssetId, kind: "photo", origin: "business", role: "provider", src: e.image,
        alt: `Portrait of ${displayName(e.name)}`, permission: "pending-owner", evidence: bookEv,
      });
    }
    return { id, sourceName: e.name, name: displayName(e.name), photoAssetId, specialties: [], evidence: bookEv!, status: "needs-review" as const };
  });

  // Business photos from the booking page: shown in private previews, blocked for release until approved.
  const bizName = name.value;
  for (const [i, p] of (booking?.photos ?? []).entries()) {
    assets.push({
      id: `booking-${p.role}-${i}`, kind: "photo", origin: "business", // Booksy's profile image is frequently a logo or flyer, so it is not trusted as a cover photo.
      role: p.role === "cover" ? "atmosphere" : p.role, src: p.url,
      alt: p.role === "logo" ? `${bizName} logo` : p.role === "cover" ? `${bizName}, photo from its ${booking!.platform} profile` : `Portfolio photo from ${bizName}'s ${booking!.platform} page`,
      permission: "pending-owner", evidence: bookEv!,
    });
  }
  // Google photos: displayed live with the author's attribution, never copied.
  for (const [i, p] of (place?.photos ?? []).slice(0, 10).entries()) {
    const author = p.authorAttributions?.[0];
    const byOwner = author?.displayName && slugify(author.displayName) === slugify(bizName);
    assets.push({
      id: `places-${i}`, kind: "photo", origin: "business", role: i === 0 ? "cover" : "work", src: p.name,
      width: p.widthPx, height: p.heightPx,
      alt: byOwner ? `Photo shared on Google by ${bizName}` : `Photo of ${bizName} shared on Google by ${author?.displayName ?? "a visitor"}`,
      credit: { text: `Photo: ${author?.displayName ?? "Google user"} · Google Maps`, url: author?.uri },
      permission: "places-attribution", evidence: placeEv!,
    });
  }
  if (website?.ogImage && webEv) {
    assets.push({ id: "website-og", kind: "photo", origin: "business", role: "atmosphere", src: website.ogImage, alt: `${bizName} website image`, permission: "pending-owner", evidence: webEv });
  }

  // Hero video: licensed stock unless the business supplies its own.
  if (stockEnabled()) {
    try {
      const v = await findHeroVideo(category);
      if (v) {
        assets.push({
          id: "stock-hero-video", kind: "video", origin: "stock", role: "hero-video", src: v.src, poster: v.poster, width: v.width, height: v.height,
          alt: "Stock footage of a stylist at work (not filmed at this salon)",
          credit: { text: v.credit, url: v.creditUrl }, permission: "licensed-stock",
          evidence: { source: "stock", url: v.pageUrl, retrievedAt: now() },
        });
        sources.push({ kind: "stock", url: v.pageUrl, status: "ok", retrievedAt: now(), note: v.credit });
      }
    } catch (e) {
      sources.push({ kind: "stock", url: "https://api.pexels.com", status: "failed", retrievedAt: now(), note: errMsg(e) });
    }
  } else {
    sources.push({ kind: "stock", url: "https://api.pexels.com", status: "skipped", retrievedAt: now(), note: "PEXELS_API_KEY is not configured; hero uses a still photo." });
  }

  const reviews: Review[] = (place?.reviews ?? [])
    .filter((r) => (r.text?.text ?? r.originalText?.text ?? "").trim().length > 0)
    .map((r) => ({
      author: r.authorAttribution?.displayName ?? "Google user",
      authorUrl: r.authorAttribution?.uri,
      rating: r.rating ?? 0,
      text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
      date: r.publishTime,
      source: "google-places" as const,
      sourceLabel: "Google",
      url: place?.googleMapsUri ?? "",
    }));

  const aboutText = place?.editorialSummary?.text ?? website?.description;
  const aboutEv = place?.editorialSummary?.text ? placeEv : webEv;

  const record: BusinessRecord = {
    category,
    name,
    address,
    phone,
    geo,
    hours,
    timezone: "America/New_York",
    booking: booking ? { platform: booking.platform, url: input.bookingUrl ?? booking.url, evidence: bookEv! } : website?.bookingLinks[0] && webEv ? { platform: "online booking", url: website.bookingLinks[0], evidence: webEv } : null,
    mapsUrl: place?.googleMapsUri ?? input.mapsUrl ?? null,
    website: place?.websiteUri ?? input.websiteUrl ?? null,
    social: { ...booking?.social, ...website?.social },
    ratings,
    about: aboutText && aboutEv ? { value: aboutText, evidence: [aboutEv], status: "needs-review", conflicts: [] } : null,
    policies: booking?.policies.length && bookEv ? { value: booking.policies, evidence: [bookEv], status: "needs-review", conflicts: [] } : null,
    paymentAccepted: booking?.paymentAccepted ?? [],
    services,
    providers,
    reviews,
    assets,
  };

  if (place?.businessStatus && place.businessStatus !== "OPERATIONAL") {
    notices.push(`Google lists this business as ${place.businessStatus.toLowerCase().replace(/_/g, " ")}. Confirm before building a site.`);
  }
  return { record, sources, notices };
}

/** First value wins by source precedence; disagreeing values become conflicts and force review. */
function merge<T>(vals: { v: T; e: Evidence }[], equal: (a: T, b: T) => boolean) {
  const [first, ...rest] = vals;
  const agreeing = rest.filter((r) => equal(first.v, r.v));
  const conflicts = rest.filter((r) => !equal(first.v, r.v)).map((r) => ({ value: r.v as unknown, source: r.e.source, url: r.e.url }));
  const status = conflicts.length ? "needs-review" : first.e.source === "google-places" || agreeing.length ? "verified" : "needs-review";
  return { value: first.v, evidence: [first.e, ...agreeing.map((a) => a.e)], status: status as "verified" | "needs-review", conflicts };
}

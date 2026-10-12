import { PLATFORM_HANDLES, asString, extractJsonLd, extractSocialLinks, findBusinessNode, metaContent, stripTags, type JsonLdNode } from "./html";
import { dayIndex, hhmm, splitStreet } from "../normalize";
import type { HoursInterval } from "../types";

/**
 * Parses a public booking page. Booksy pages publish a schema.org HairSalon
 * block with address, geo, weekly hours, rating, priced offers and the staff
 * roster; other platforms are read through the same JSON-LD path where present.
 * Pure (no I/O) so it can be unit-tested against fixtures.
 */

export type BookingFacts = {
  platform: string;
  url: string;
  retrievedAt: string;
  name?: string;
  street?: string;
  suite?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  phone?: string;
  geo?: { lat: number; lng: number };
  hours?: HoursInterval[];
  rating?: { value: number; count: number };
  offers: { name: string; price?: number; currency?: string }[];
  employees: { name: string; image?: string }[];
  photos: { url: string; role: "cover" | "work" | "logo" }[];
  policies: string[];
  paymentAccepted: string[];
  social: { instagram?: string; facebook?: string; tiktok?: string };
  notices: string[];
};

export function platformOf(url: string): string {
  const h = new URL(url).hostname;
  if (h.endsWith("booksy.com")) return "Booksy";
  if (h.endsWith("vagaro.com")) return "Vagaro";
  if (h.endsWith("fresha.com")) return "Fresha";
  if (h.endsWith("styleseat.com")) return "StyleSeat";
  if (h.endsWith("square.site") || h.endsWith("squareup.com")) return "Square";
  if (h.endsWith("zenoti.com")) return "Zenoti";
  if (h.endsWith("glossgenius.com")) return "GlossGenius";
  return "online booking";
}

export function parseBookingHtml(html: string, url: string): BookingFacts {
  const facts: BookingFacts = {
    platform: platformOf(url),
    url,
    retrievedAt: new Date().toISOString(),
    offers: [],
    employees: [],
    photos: [],
    policies: [],
    paymentAccepted: [],
    social: {},
    notices: [],
  };
  const biz = findBusinessNode(extractJsonLd(html));

  if (biz) readBusinessNode(biz, facts);
  else facts.notices.push("The booking page has no structured business data; only basic details could be read.");

  facts.name ??= metaContent(html, "og:title")?.split(/\s[-|–]\s/)[0];

  if (facts.platform === "Booksy") readBooksyExtras(html, facts);
  else facts.social = extractSocialLinks(html);

  return facts;
}

function readBusinessNode(biz: JsonLdNode, f: BookingFacts) {
  f.name = asString(biz.name);
  const addr = biz.address as JsonLdNode | undefined;
  if (addr) {
    f.city = asString(addr.addressLocality);
    f.region = asString(addr.addressRegion)?.toUpperCase();
    f.postalCode = asString(addr.postalCode);
    const raw = asString(addr.streetAddress);
    if (raw) Object.assign(f, splitStreet(raw, f.city));
  }
  f.phone = asString(biz.telephone);
  const geo = biz.geo as JsonLdNode | undefined;
  if (geo && geo.latitude != null && geo.longitude != null) f.geo = { lat: Number(geo.latitude), lng: Number(geo.longitude) };

  const specs = (biz.openingHoursSpecification as JsonLdNode[] | undefined) ?? [];
  if (specs.length) {
    const hours: HoursInterval[] = [];
    for (const s of specs) {
      const days = Array.isArray(s.dayOfWeek) ? s.dayOfWeek : [s.dayOfWeek];
      for (const d of days) {
        const day = dayIndex(String(d));
        const open = asString(s.opens);
        const close = asString(s.closes);
        if (day !== undefined && open && close && !(open === "00:00" && close === "00:00")) hours.push({ day, open: hhmm(open), close: hhmm(close) });
      }
    }
    if (hours.length) f.hours = hours;
  }

  const agg = biz.aggregateRating as JsonLdNode | undefined;
  if (agg?.ratingValue != null && agg.reviewCount != null) {
    f.rating = { value: Number(agg.ratingValue), count: Number(agg.reviewCount) };
  }

  for (const o of (biz.makesOffer as JsonLdNode[] | undefined) ?? []) {
    const item = (o.itemOffered as JsonLdNode | undefined) ?? o;
    const name = asString(item.name) ?? asString(o.name);
    if (!name) continue;
    const price = o.price != null ? Number(o.price) : undefined;
    f.offers.push({ name, price: Number.isFinite(price) ? price : undefined, currency: asString(o.priceCurrency) });
  }

  for (const e of (biz.employee as JsonLdNode[] | undefined) ?? []) {
    const name = asString(e.name);
    if (name) f.employees.push({ name, image: asString(e.image) });
  }

  const cover = asString(biz.image);
  if (cover) f.photos.push({ url: cover, role: "cover" });
  const logo = asString(biz.logo);
  if (logo) f.photos.push({ url: logo, role: "logo" });

  const pay = asString(biz.paymentAccepted);
  if (pay) f.paymentAccepted = pay.split(/,\s*/);

  for (const s of (Array.isArray(biz.sameAs) ? biz.sameAs : [biz.sameAs]).filter(Boolean)) {
    const u = String(s);
    if (/instagram\.com\//i.test(u)) f.social.instagram ??= u;
    else if (/facebook\.com\//i.test(u)) f.social.facebook ??= u;
    else if (/tiktok\.com\//i.test(u)) f.social.tiktok ??= u;
  }
}

function readBooksyExtras(html: string, f: BookingFacts) {
  // Business portfolio ("inspiration") and gallery ("biz_photo") images. Review photos are
  // uploaded by customers, who own them, so they are deliberately skipped.
  const bizId = f.url.match(/\/(\d+)_/)?.[1];
  if (bizId) {
    const re = new RegExp(`https://[a-z0-9.-]+\\.cloudfront\\.net/[a-z0-9]+/[a-z]+/${bizId}/(biz_photo|inspiration)/[^"'\\\\\\s?),]+`, "g");
    const seen = new Set(f.photos.map((p) => p.url));
    for (const m of html.matchAll(re)) {
      if (seen.has(m[0])) continue;
      seen.add(m[0]);
      f.photos.push({ url: m[0], role: "work" });
    }
  }

  const section = (title: string) => {
    const i = html.indexOf(`>${title}<`);
    if (i === -1) return "";
    // A section ends at the next heading or the end of its <section>, whichever comes first.
    const ends = [html.indexOf("<h2", i + title.length), html.indexOf("</section>", i)].filter((n) => n !== -1);
    return html.slice(i, ends.length ? Math.min(...ends) : i + 4000);
  };

  const policyHtml = section("Booking Policies");
  for (const m of policyHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
    const t = stripTags(m[1]);
    if (t) f.policies.push(t);
  }

  // The owner-written note under the hours often holds scheduling rules and the phone number.
  const note = html.match(/<p[^>]*data-test="boh-note-text"[^>]*>([\s\S]*?)<\/p>/)?.[1];
  if (note) {
    const text = stripTags(note);
    const phone = text.match(/\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/)?.[0];
    if (phone) f.phone ??= phone;
    const items = text
      .replace(/^[^:]{0,60}:\s*/, "")
      .split(/\s*-\s*(?=[A-Z])/)
      .map((s) => s.replace(/,\s*,/g, ",").replace(/\.$/, "").trim())
      .filter((s) => s.length > 3 && !/\d{3}[\s.-]?\d{4}/.test(s));
    f.policies.push(...items);
  }

  const socialHtml = section("Social Media");
  for (const m of socialHtml.matchAll(/href="([^"]+)"[\s\S]*?(Instagram|Facebook|TikTok)/gi)) {
    const href = m[1];
    if (PLATFORM_HANDLES.test(href)) continue;
    const network = m[2].toLowerCase() as "instagram" | "facebook" | "tiktok";
    if (/^https?:\/\/(www\.)?(instagram|facebook|tiktok)\.com\/[^/]+/i.test(href)) {
      f.social[network] ??= href;
    } else {
      // Booksy sometimes stores only a handle and renders it as a broken URL.
      const handle = href.replace(/^https?:\/\//, "").replace(/\/$/, "");
      f.notices.push(
        `Booksy lists an ${m[2]} account as "${href}", which is not a valid link. ` +
          `It may be @${handle}; confirm the exact account before linking it.`,
      );
    }
  }
}

/**
 * Booksy blocks framing of its profile pages (X-Frame-Options: DENY) but publishes an
 * embeddable booking widget for business websites. Returns that widget URL, or null for
 * platforms whose embedding has not been verified (those keep opening in a new tab).
 */
export function bookingEmbedUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (!/(^|\.)booksy\.com$/.test(u.hostname)) return null;
  const id = u.pathname.match(/\/(\d+)_/)?.[1];
  const locale = u.pathname.match(/^\/([a-z]{2})-([a-z]{2})\//i);
  if (!id) return null;
  const lang = locale?.[1].toLowerCase() ?? "en";
  const country = locale?.[2].toLowerCase() ?? "us";
  const params = new URLSearchParams({ id, businessId: "", appointmentUid: "", lang, country, mode: "dialog", theme: "default" });
  return `https://booksy.com/widget-2021/index.html?${params}`;
}

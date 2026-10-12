/** Small, dependency-free readers for public HTML. Content is data, never instructions. */

export type JsonLdNode = Record<string, unknown>;

export function extractJsonLd(html: string): JsonLdNode[] {
  const out: JsonLdNode[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] ? parsed["@graph"] : [parsed];
      for (const n of nodes) if (n && typeof n === "object") out.push(n as JsonLdNode);
    } catch {
      // Malformed blocks are common on small-business sites; skip them.
    }
  }
  return out;
}

const BUSINESS_TYPES = /LocalBusiness|HairSalon|BeautySalon|BarberShop|DaySpa|HealthAndBeautyBusiness|NailSalon/i;

export function findBusinessNode(nodes: JsonLdNode[]): JsonLdNode | undefined {
  return nodes.find((n) => {
    const t = n["@type"];
    return Array.isArray(t) ? t.some((x) => BUSINESS_TYPES.test(String(x))) : BUSINESS_TYPES.test(String(t ?? ""));
  });
}

export function metaContent(html: string, key: string): string | undefined {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  return tag ? decodeEntities(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "") || undefined : undefined;
}

export function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

export function stripTags(s: string): string {
  return decodeEntities(s.replace(/<svg[\s\S]*?<\/svg>/gi, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Platform accounts that appear in every page footer and must never be mistaken for the business. */
export const PLATFORM_HANDLES = /\/(booksybiz|booksy|booksyus|vagaro|squareup|fresha|styleseat|wix|squarespace|godaddy|google)\/?$/i;

export function extractSocialLinks(html: string) {
  const found: { instagram?: string; facebook?: string; tiktok?: string } = {};
  for (const m of html.matchAll(/href=["'](https?:\/\/(?:www\.)?(instagram\.com|facebook\.com|tiktok\.com)\/[^"'?#\s]+)/gi)) {
    const url = m[1].replace(/\/$/, "") + "/";
    if (PLATFORM_HANDLES.test(url) || /\/(sharer|share|p|reel|explore|tr)\b/i.test(url)) continue;
    const host = m[2].toLowerCase();
    if (host.startsWith("instagram")) found.instagram ??= url;
    else if (host.startsWith("facebook")) found.facebook ??= url;
    else found.tiktok ??= url;
  }
  return found;
}

export function asString(v: unknown): string | undefined {
  if (typeof v === "string") return v.trim() || undefined;
  if (Array.isArray(v)) return asString(v[0]);
  if (v && typeof v === "object" && "url" in v) return asString((v as { url: unknown }).url);
  return undefined;
}

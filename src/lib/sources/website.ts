import "server-only";
import { safeFetchText } from "../safe-fetch";
import { asString, extractJsonLd, extractSocialLinks, findBusinessNode, metaContent } from "./html";

export type WebsiteFacts = {
  url: string;
  retrievedAt: string;
  name?: string;
  description?: string;
  phone?: string;
  ogImage?: string;
  social: { instagram?: string; facebook?: string; tiktok?: string };
  bookingLinks: string[];
};

const BOOKING_HOSTS = /booksy\.com|vagaro\.com|fresha\.com|styleseat\.com|square\.site|squareup\.com\/appointments|zenoti\.com|glossgenius\.com|schedulicity\.com|mindbodyonline\.com/i;

export async function readWebsite(url: string): Promise<WebsiteFacts> {
  const res = await safeFetchText(url);
  if (res.status >= 400) throw new Error(`Website returned HTTP ${res.status}.`);
  const html = res.body;
  const biz = findBusinessNode(extractJsonLd(html));
  const bookingLinks = [...new Set([...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)].map((m) => m[1]).filter((u) => BOOKING_HOSTS.test(u)))];
  return {
    url: res.url,
    retrievedAt: new Date().toISOString(),
    name: asString(biz?.name) ?? metaContent(html, "og:site_name"),
    description: asString(biz?.description) ?? metaContent(html, "description") ?? metaContent(html, "og:description"),
    phone: asString(biz?.telephone) ?? html.match(/href=["']tel:([+\d\-().\s]{7,})["']/i)?.[1],
    ogImage: metaContent(html, "og:image"),
    social: extractSocialLinks(html),
    bookingLinks,
  };
}

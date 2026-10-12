import "server-only";
import { resolveRedirects, assertPublicUrl } from "../safe-fetch";
import { hhmm } from "../normalize";
import type { HoursInterval } from "../types";

/**
 * Google Places API (New). Official, terms-compliant source for identity,
 * hours, rating, reviews and photos. Photos are never stored: they are served
 * live through /api/media/places with the author attribution Google requires.
 */

const API = "https://places.googleapis.com/v1";
const FIELDS = [
  "id", "displayName", "formattedAddress", "addressComponents", "nationalPhoneNumber", "internationalPhoneNumber",
  "location", "regularOpeningHours", "rating", "userRatingCount", "googleMapsUri", "websiteUri", "photos",
  "reviews", "editorialSummary", "primaryType", "types", "businessStatus",
];

export const placesEnabled = () => Boolean(process.env.GOOGLE_PLACES_API_KEY);

type LocalizedText = { text?: string };
type AddressComponent = { longText?: string; shortText?: string; types?: string[] };
type TimePoint = { day: number; hour: number; minute: number };

export type PlaceResult = {
  id: string;
  displayName?: LocalizedText;
  formattedAddress?: string;
  addressComponents?: AddressComponent[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  location?: { latitude: number; longitude: number };
  regularOpeningHours?: { periods?: { open: TimePoint; close?: TimePoint }[] };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  photos?: { name: string; widthPx?: number; heightPx?: number; authorAttributions?: { displayName?: string; uri?: string }[] }[];
  reviews?: {
    rating?: number;
    text?: LocalizedText;
    originalText?: LocalizedText;
    publishTime?: string;
    authorAttribution?: { displayName?: string; uri?: string };
  }[];
  editorialSummary?: LocalizedText;
  primaryType?: string;
  types?: string[];
  businessStatus?: string;
};

async function placesFetch<T>(path: string, init: RequestInit & { fieldMask: string }): Promise<T> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set.");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": init.fieldMask, "content-type": "application/json" },
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Google Places returned HTTP ${res.status}. ${detail.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export function getPlace(placeId: string) {
  return placesFetch<PlaceResult>(`/places/${encodeURIComponent(placeId)}`, { method: "GET", fieldMask: FIELDS.join(",") });
}

export async function searchPlace(query: string, near?: { lat: number; lng: number }): Promise<PlaceResult[]> {
  const body: Record<string, unknown> = { textQuery: query, pageSize: 5 };
  if (near) body.locationBias = { circle: { center: { latitude: near.lat, longitude: near.lng }, radius: 2000 } };
  const res = await placesFetch<{ places?: PlaceResult[] }>("/places:searchText", {
    method: "POST",
    body: JSON.stringify(body),
    fieldMask: FIELDS.map((f) => `places.${f}`).join(","),
  });
  return res.places ?? [];
}

export type MapsLinkHints = { placeId?: string; name?: string; near?: { lat: number; lng: number }; query?: string; expandedUrl: string };

const MAPS_HOSTS = /(^|\.)google\.[a-z.]+$|^maps\.app\.goo\.gl$|^goo\.gl$/i;

/** Pulls whatever identifies the place out of the many Google Maps URL shapes. */
export async function parseMapsLink(raw: string): Promise<MapsLinkHints> {
  const first = await assertPublicUrl(raw);
  if (!MAPS_HOSTS.test(first.hostname)) throw new Error("That does not look like a Google Maps link.");
  const expanded = /goo\.gl$/i.test(first.hostname) ? await resolveRedirects(raw) : raw;
  const url = new URL(expanded);
  const hints: MapsLinkHints = { expandedUrl: expanded };

  const q = url.searchParams.get("q") ?? url.searchParams.get("query") ?? "";
  hints.placeId =
    url.searchParams.get("query_place_id") ??
    url.searchParams.get("place_id") ??
    q.match(/place_id:([\w-]+)/)?.[1] ??
    undefined;

  const placeName = url.pathname.match(/\/place\/([^/]+)/)?.[1];
  if (placeName) hints.name = decodeURIComponent(placeName.replace(/\+/g, " "));
  else if (q && !q.startsWith("place_id:")) hints.query = q;

  // !3d/!4d are the place's own coordinates; @lat,lng is only the map viewport.
  const pin = expanded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  const view = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const c = pin ?? view;
  if (c) hints.near = { lat: Number(c[1]), lng: Number(c[2]) };
  return hints;
}

export function hoursFromPlace(p: PlaceResult): HoursInterval[] | undefined {
  const periods = p.regularOpeningHours?.periods;
  if (!periods?.length) return undefined;
  // A single open period with no close means open 24/7.
  if (periods.length === 1 && !periods[0].close) return [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: "00:00", close: "23:59" }));
  return periods
    .filter((x) => x.close)
    .map((x) => ({
      day: x.open.day,
      open: hhmm(`${x.open.hour}:${String(x.open.minute).padStart(2, "0")}`),
      close: hhmm(`${x.close!.hour}:${String(x.close!.minute).padStart(2, "0")}`),
    }));
}

export function addressFromPlace(p: PlaceResult) {
  const get = (type: string, short = false) => {
    const c = p.addressComponents?.find((x) => x.types?.includes(type));
    return short ? c?.shortText : c?.longText;
  };
  const number = get("street_number");
  const route = get("route", true) ?? get("route");
  const sub = get("subpremise");
  if (!route) return undefined;
  return {
    street: [number, route].filter(Boolean).join(" "),
    suite: sub ? (/^\d/.test(sub) ? `Suite ${sub}` : sub) : undefined,
    city: get("locality") ?? get("postal_town") ?? get("sublocality") ?? "",
    region: get("administrative_area_level_1", true) ?? "",
    postalCode: get("postal_code") ?? "",
    country: get("country", true) ?? "US",
  };
}

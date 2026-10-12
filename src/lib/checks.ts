import type { BusinessRecord, Job, TemplateFamily } from "./types";

/**
 * Release checks. "blocker" items stop a version from being called
 * production-ready; "approval" items need the business owner; "info" items
 * are honest fallbacks that are already handled in the templates.
 */

export type Check = { id: string; level: "blocker" | "approval" | "info"; message: string };

/** Strings from the Van Michael reference build that must never leak into a generated site (brief G01). */
const REFERENCE_LEAKS = /van michael|aveda|zenoti|vanmichael|buckhead|council brothers/i;

export function checkRecord(r: BusinessRecord, input: Job["input"]): Check[] {
  const out: Check[] = [];
  const add = (id: string, level: Check["level"], message: string) => out.push({ id, level, message });

  if (!input.bookingUrl && !r.booking) add("booking-missing", "blocker", "No booking link. Add the business's booking page so every Book button works.");
  if (!r.phone) add("phone-missing", "blocker", "No phone number was found in any source. Add one in Edit facts.");
  if (r.name.conflicts.length) add("name-conflict", "blocker", `Sources disagree on the business name: ${r.name.conflicts.map((c) => JSON.stringify(c.value)).join(", ")}.`);
  if (r.address.conflicts.length) add("address-conflict", "blocker", "Sources disagree on the address. Confirm the correct one.");
  if (r.phone?.conflicts.length) add("phone-conflict", "blocker", `Sources disagree on the phone number: ${r.phone.conflicts.map((c) => String(c.value)).join(", ")}.`);
  if (!r.hours) add("hours-missing", "info", "Weekly hours were not found. Pages show “Call or check booking for hours” instead of guessing.");
  else if (r.hours.conflicts.length) add("hours-conflict", "blocker", "Google and the booking page list different weekly hours. Confirm which is current.");

  if (REFERENCE_LEAKS.test(JSON.stringify(r))) add("reference-leak", "blocker", "The record contains names from the Van Michael reference build.");

  const pendingAssets = r.assets.filter((a) => a.permission === "pending-owner");
  if (pendingAssets.length) {
    add("assets-permission", "approval", `${pendingAssets.length} photos come from public pages and need the owner's permission before going live. They show in private previews only.`);
  }
  const unconfirmedPrices = r.services.filter((s) => s.price && s.status !== "owner-confirmed").length;
  if (unconfirmedPrices) add("prices", "approval", `${unconfirmedPrices} prices were read from the booking page. They are shown as “from” prices; confirm them or switch to the live-pricing link.`);
  const unconfirmedProviders = r.providers.filter((p) => p.status !== "owner-confirmed").length;
  if (unconfirmedProviders) add("roster", "approval", `Confirm the ${unconfirmedProviders}-person team roster is current.`);
  if (r.policies && r.policies.status !== "owner-confirmed") add("policies", "approval", `Confirm booking policies: ${r.policies.value.join("; ")}.`);
  if (r.about && r.about.status !== "owner-confirmed") add("about", "approval", "Confirm the studio description.");
  if (!r.about) add("about-missing", "info", "No verified studio story. The About page is omitted rather than invented.");

  if (!r.assets.some((a) => a.kind === "video")) add("video", "info", "No licensed hero video. Heroes use a still image (add PEXELS_API_KEY or upload footage).");
  if (!r.reviews.length) add("reviews", "info", "No review text is available to quote. Rating summaries link to their source instead.");
  if (!r.services.length) add("services-missing", "info", "No service menu was found. The Services page links to the live booking menu.");
  if (!r.providers.length) add("team-missing", "info", "No team roster was found. The Team page is omitted.");
  return out;
}

export const FAMILIES: { id: TemplateFamily; name: string; summary: string }[] = [
  { id: "atelier", name: "Cinematic Atelier", summary: "Dark, intimate, craft-led. Full-bleed hero, image-led service chapters, portrait team panels." },
  { id: "editorial", name: "Modern Editorial Studio", summary: "Bright, contemporary, approachable. Split hero with booking panel, tabbed menu, magazine gallery." },
];

export function jobStatus(checks: Check[]): Job["status"] {
  return checks.some((c) => c.level !== "info") ? "needs-review" : "ready";
}

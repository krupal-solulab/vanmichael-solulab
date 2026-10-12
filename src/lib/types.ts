import { z } from "zod";

/**
 * The business record is the single source of truth for every template.
 * Each fact keeps where it came from, when, and whether a human has
 * approved it. Templates may style facts differently but never change them.
 */

export const SourceKind = z.enum(["google-places", "booking", "website", "stock", "manual"]);
export type SourceKind = z.infer<typeof SourceKind>;

export const Evidence = z.object({
  source: SourceKind,
  url: z.string(),
  retrievedAt: z.string(),
});
export type Evidence = z.infer<typeof Evidence>;

export const Approval = z.enum(["verified", "needs-review", "owner-confirmed"]);
export type Approval = z.infer<typeof Approval>;

const fieldOf = <T extends z.ZodType>(value: T) =>
  z.object({
    value,
    evidence: z.array(Evidence),
    status: Approval,
    conflicts: z.array(z.object({ value: z.unknown(), source: SourceKind, url: z.string() })).default([]),
  });

export const Address = z.object({
  street: z.string(),
  suite: z.string().optional(),
  city: z.string(),
  region: z.string(),
  postalCode: z.string(),
  country: z.string().default("US"),
});
export type Address = z.infer<typeof Address>;

/** One opening interval. day: 0 = Sunday … 6 = Saturday. Times are HH:MM, 24h, local. */
export const HoursInterval = z.object({ day: z.number().int().min(0).max(6), open: z.string(), close: z.string() });
export type HoursInterval = z.infer<typeof HoursInterval>;

export const ServiceCategory = z.enum([
  "cuts", "color", "treatments", "styling", "extensions", "grooming",
  "makeup", "nails", "lashes", "brows-waxing", "other",
]);
export type ServiceCategory = z.infer<typeof ServiceCategory>;

export const Service = z.object({
  id: z.string(),
  /** Exactly as the source spells it. */
  sourceName: z.string(),
  /** Display spelling (capitalisation/typos normalised, meaning unchanged). Editable. */
  name: z.string(),
  category: ServiceCategory,
  price: z
    .object({
      amount: z.number(),
      currency: z.string(),
      /** Booking platforms list one number per service even when variants exist, so "from" is the safe default. */
      qualifier: z.enum(["from", "exact"]),
    })
    .optional(),
  durationMinutes: z.number().optional(),
  evidence: Evidence,
  status: Approval,
});
export type Service = z.infer<typeof Service>;

export const Provider = z.object({
  id: z.string(),
  sourceName: z.string(),
  name: z.string(),
  photoAssetId: z.string().optional(),
  /** Only ever filled by a human. Never inferred. */
  specialties: z.array(z.string()).default([]),
  bio: z.string().optional(),
  evidence: Evidence,
  status: Approval,
});
export type Provider = z.infer<typeof Provider>;

export const Review = z.object({
  author: z.string(),
  authorUrl: z.string().optional(),
  rating: z.number(),
  text: z.string(),
  date: z.string().optional(),
  source: SourceKind,
  sourceLabel: z.string(),
  url: z.string(),
});
export type Review = z.infer<typeof Review>;

/**
 * permission:
 * - places-attribution: Google Places photo. Displayed live via our proxy with author credit; never stored.
 * - pending-owner: found on a public page. Shown in private previews only; blocks release until approved.
 * - owner-approved: the business has granted permission.
 * - licensed-stock: stock under a licence that permits this use. Never presented as the business.
 */
export const Asset = z.object({
  id: z.string(),
  kind: z.enum(["photo", "video"]),
  origin: z.enum(["business", "stock"]),
  role: z.enum(["logo", "cover", "provider", "work", "atmosphere", "hero-video"]),
  /** Direct URL, or for Google Places a photo resource name (places/…/photos/…). */
  src: z.string(),
  poster: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  alt: z.string(),
  credit: z.object({ text: z.string(), url: z.string().optional() }).optional(),
  permission: z.enum(["places-attribution", "pending-owner", "owner-approved", "licensed-stock"]),
  evidence: Evidence,
});
export type Asset = z.infer<typeof Asset>;

export const SourceLog = z.object({
  kind: SourceKind,
  url: z.string(),
  status: z.enum(["ok", "failed", "skipped"]),
  retrievedAt: z.string(),
  note: z.string().optional(),
});
export type SourceLog = z.infer<typeof SourceLog>;

export const BusinessRecord = z.object({
  category: z.enum(["hair_salon", "barber_shop"]),
  name: fieldOf(z.string()),
  address: fieldOf(Address),
  phone: fieldOf(z.string()).nullable(),
  geo: fieldOf(z.object({ lat: z.number(), lng: z.number() })).nullable(),
  hours: fieldOf(z.array(HoursInterval)).nullable(),
  timezone: z.string().default("America/New_York"),
  booking: z
    .object({ platform: z.string(), url: z.string(), evidence: Evidence })
    .nullable(),
  mapsUrl: z.string().nullable(),
  website: z.string().nullable(),
  social: z.object({ instagram: z.string().optional(), facebook: z.string().optional(), tiktok: z.string().optional() }),
  ratings: z.array(
    z.object({ label: z.string(), value: z.number(), count: z.number(), url: z.string(), retrievedAt: z.string(), source: SourceKind }),
  ),
  /** Factual description from a listing, or owner-supplied story. Empty means no About page. */
  about: fieldOf(z.string()).nullable(),
  policies: fieldOf(z.array(z.string())).nullable(),
  paymentAccepted: z.array(z.string()).default([]),
  services: z.array(Service),
  providers: z.array(Provider),
  reviews: z.array(Review),
  assets: z.array(Asset),
});
export type BusinessRecord = z.infer<typeof BusinessRecord>;

export const TemplateFamily = z.enum(["atelier", "editorial"]);
export type TemplateFamily = z.infer<typeof TemplateFamily>;

export const JobInput = z
  .object({
    mapsUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
    bookingUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
    websiteUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
    templateCount: z.coerce.number().int().min(1).max(10).default(2),
  })
  .refine((v) => v.mapsUrl || v.bookingUrl || v.websiteUrl, {
    message: "Add at least one source: a Google Maps link, a booking link or a website.",
  });
export type JobInput = z.infer<typeof JobInput>;

export const Job = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  /** Increments on every fact edit so previews and exports can be traced to a content version. */
  contentVersion: z.number().int(),
  status: z.enum(["ready", "needs-review", "failed"]),
  input: z.object({
    mapsUrl: z.string().optional(),
    bookingUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
    templateCount: z.number(),
  }),
  /** Requested count may exceed available families; we never fake extra designs. */
  templates: z.array(TemplateFamily),
  notices: z.array(z.string()),
  sources: z.array(SourceLog),
  record: BusinessRecord.nullable(),
  error: z.string().optional(),
});
export type Job = z.infer<typeof Job>;

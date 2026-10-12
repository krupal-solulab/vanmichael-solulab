import { describe, expect, it } from "vitest";
import { checkRecord } from "../src/lib/checks";
import { buildContent } from "../src/templates/content";
import type { BusinessRecord } from "../src/lib/types";

const ev = { source: "booking" as const, url: "https://booksy.com/x", retrievedAt: "2026-10-12T10:00:00.000Z" };
const field = <T,>(value: T) => ({ value, evidence: [ev], status: "verified" as const, conflicts: [] });

function record(over: Partial<BusinessRecord> = {}): BusinessRecord {
  return {
    category: "hair_salon",
    name: field("Sample Studio"),
    address: field({ street: "100 Main St", suite: "Suite 5", city: "Testville", region: "GA", postalCode: "30000", country: "US" }),
    phone: field("(555) 010-4477"),
    geo: null,
    hours: field([{ day: 2, open: "10:00", close: "19:00" }]),
    timezone: "America/New_York",
    booking: { platform: "Booksy", url: "https://booksy.com/x", evidence: ev },
    mapsUrl: null,
    website: null,
    social: {},
    ratings: [],
    about: null,
    policies: null,
    paymentAccepted: [],
    services: [],
    providers: [],
    reviews: [],
    assets: [],
    ...over,
  };
}

const input = { bookingUrl: "https://booksy.com/x", templateCount: 2 };

describe("checkRecord", () => {
  it("blocks a missing phone", () => {
    expect(checkRecord(record({ phone: null }), input).find((c) => c.id === "phone-missing")?.level).toBe("blocker");
  });

  it("blocks reference-business leakage", () => {
    expect(checkRecord(record({ name: field("Van Michael Salon") }), input).some((c) => c.id === "reference-leak")).toBe(true);
  });

  it("requires owner approval for photos taken from public pages", () => {
    const r = record({
      assets: [{ id: "a", kind: "photo", origin: "business", role: "work", src: "https://x/y.jpg", alt: "x", permission: "pending-owner", evidence: ev }],
    });
    expect(checkRecord(r, input).find((c) => c.id === "assets-permission")?.level).toBe("approval");
  });

  it("blocks conflicting hours", () => {
    const r = record({ hours: { ...field([{ day: 2, open: "10:00", close: "19:00" }]), conflicts: [{ value: [], source: "google-places", url: "g" }] } });
    expect(checkRecord(r, input).find((c) => c.id === "hours-conflict")?.level).toBe("blocker");
  });
});

describe("buildContent routes", () => {
  it("omits pages that have no verified content", () => {
    const c = buildContent(record(), { jobId: "job-123456", family: "atelier" });
    expect(c.routes).toEqual(["home", "services", "visit", "privacy"]);
  });

  it("adds team, gallery, about and policies only when supported", () => {
    const photo = (i: number) => ({ id: `p${i}`, kind: "photo" as const, origin: "business" as const, role: "work" as const, src: `https://x/${i}.jpg`, alt: "x", permission: "owner-approved" as const, evidence: ev });
    const c = buildContent(
      record({
        providers: [{ id: "ana", sourceName: "Ana", name: "Ana", specialties: [], evidence: ev, status: "verified" }],
        assets: [photo(1), photo(2), photo(3)],
        about: field("A studio."),
        policies: field(["No walk-ins"]),
      }),
      { jobId: "job-123456", family: "editorial" },
    );
    expect(c.routes).toEqual(["home", "services", "team", "gallery", "about", "visit", "policies", "privacy"]);
    expect(c.href("services")).toBe("/p/job-123456/editorial/services/");
  });

  it("computes today's status in the business time zone", () => {
    // Tuesday 2026-10-13 15:00 UTC = 11:00 in Atlanta.
    const c = buildContent(record(), { jobId: "job-123456", family: "atelier", now: new Date("2026-10-13T15:00:00Z") });
    expect(c.today).toEqual({ open: true, label: "Open today until 7pm" });
  });
});

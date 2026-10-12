import { describe, expect, it } from "vitest";
import { bookingEmbedUrl, parseBookingHtml } from "../src/lib/sources/booking-parse";
import { BOOKSY_HTML, BOOKSY_URL } from "./fixtures";

describe("parseBookingHtml (Booksy)", () => {
  const f = parseBookingHtml(BOOKSY_HTML, BOOKSY_URL);

  it("reads identity and splits the suite out of the street", () => {
    expect(f.platform).toBe("Booksy");
    expect(f.name).toBe("Sample Studio");
    expect(f.street).toBe("100 Main St");
    expect(f.suite).toBe("Suite 5");
    expect(f.city).toBe("Testville");
    expect(f.postalCode).toBe("30000");
    expect(f.geo).toEqual({ lat: 33.9, lng: -84.2 });
  });

  it("expands weekly hours per day", () => {
    expect(f.hours).toEqual([
      { day: 2, open: "10:00", close: "19:00" },
      { day: 3, open: "10:00", close: "19:00" },
      { day: 6, open: "10:00", close: "17:00" },
    ]);
  });

  it("keeps the platform's own rating and count", () => {
    expect(f.rating).toEqual({ value: 4.790322580645161, count: 62 });
  });

  it("reads offers, staff and the phone from the owner's note", () => {
    expect(f.offers.map((o) => o.name)).toEqual(["eyebrow waxinng", "Balayage", "Eyelash Application"]);
    expect(f.employees.map((e) => e.name)).toEqual(["Ana Example", "luis sample"]);
    expect(f.phone).toBe("555-010-4477");
  });

  it("collects policies but not the contact sentence", () => {
    expect(f.policies).toContain("No walk-ins");
    expect(f.policies).toContain("Bleach appointments are not accepted after 1pm");
    expect(f.policies.some((p) => p.includes("555"))).toBe(false);
  });

  it("takes business photos and skips customer review photos", () => {
    const urls = f.photos.map((p) => p.url);
    expect(urls.some((u) => u.includes("/inspiration/work1"))).toBe(true);
    expect(urls.some((u) => u.includes("review_photos"))).toBe(false);
    expect(f.photos.find((p) => p.role === "logo")).toBeTruthy();
  });

  it("flags a malformed social link instead of guessing, and ignores the platform's own account", () => {
    expect(f.social.instagram).toBeUndefined();
    expect(f.notices.join(" ")).toMatch(/not a valid link/);
  });
});

describe("bookingEmbedUrl", () => {
  it("builds Booksy's official widget URL from a profile link", () => {
    const u = new URL(bookingEmbedUrl("https://booksy.com/en-us/551176_elkin-mack-hair-studio_hair-salon_16409_norcross")!);
    expect(u.origin + u.pathname).toBe("https://booksy.com/widget-2021/index.html");
    expect(u.searchParams.get("id")).toBe("551176");
    expect(u.searchParams.get("lang")).toBe("en");
    expect(u.searchParams.get("country")).toBe("us");
    expect(u.searchParams.get("mode")).toBe("dialog");
  });

  it("returns null for platforms whose embedding is unverified", () => {
    expect(bookingEmbedUrl("https://www.vagaro.com/somesalon")).toBeNull();
    expect(bookingEmbedUrl("not a url")).toBeNull();
  });
});

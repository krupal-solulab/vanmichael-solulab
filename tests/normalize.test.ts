import { describe, expect, it } from "vitest";
import { categorize, displayName, groupHours, splitStreet, telHref, formatUsPhone } from "../src/lib/normalize";

describe("displayName", () => {
  it.each([
    ["eyebrow waxinng", "Eyebrow Waxing"],
    ["Press On", "Press On"],
    ["Istar montoya", "Istar Montoya"],
    ["BROW HENNA (sin depilacion)", "Brow Henna (sin Depilación)"],
    ["Barba candado con corte", "Barba Candado con Corte"],
    ["Brow lamination+brow wax+ tint", "Brow Lamination+Brow Wax+ Tint"],
  ])("%s → %s", (input, out) => expect(displayName(input)).toBe(out));
});

describe("categorize", () => {
  it.each([
    ["Eyelash Application", "lashes"],
    ["Eyebrows with thread", "brows-waxing"],
    ["hair wax fusio dose kerastase", "treatments"],
    ["Balayage", "color"],
    ["classic mens haircut", "cuts"],
    ["Barba candado con corte", "grooming"],
    ["Base Ruber", "nails"],
    ["Updo", "styling"],
    ["Express Mack", "other"],
  ])("%s → %s", (input, out) => expect(categorize(input)).toBe(out));
});

describe("hours and addresses", () => {
  it("groups consecutive identical days, Monday first", () => {
    const rows = groupHours([2, 3, 4, 5].map((day) => ({ day, open: "10:00", close: "19:00" })).concat([{ day: 6, open: "10:00", close: "17:00" }]));
    expect(rows).toEqual([
      { days: "Monday", time: "Closed", closed: true },
      { days: "Tuesday – Friday", time: "10am – 7pm", closed: false },
      { days: "Saturday", time: "10am – 5pm", closed: false },
      { days: "Sunday", time: "Closed", closed: true },
    ]);
  });

  it("splits suites and de-shouts street names", () => {
    expect(splitStreet("6409 JIMMY CARTER BLVD. SUITE 200, Norcross, GA, 30071", "Norcross")).toEqual({ street: "6409 Jimmy Carter Blvd", suite: "Suite 200" });
  });

  it("formats US phones", () => {
    expect(formatUsPhone("470-514-5787")).toBe("(470) 514-5787");
    expect(telHref("(470) 514-5787")).toBe("tel:+14705145787");
  });
});

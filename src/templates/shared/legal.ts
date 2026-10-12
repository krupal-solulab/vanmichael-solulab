import type { SiteContent } from "../content";

/**
 * Privacy text that describes what the generated site actually does: no forms,
 * no accounts, no analytics, no cookies set by the site. Third parties are
 * named because visitors' browsers contact them. The owner must still review it.
 */
export function privacySections(c: SiteContent): { heading: string; body: string[] }[] {
  const third: string[] = [];
  if (c.booking) third.push(`${c.booking.platform}, when you choose to book. Bookings, payments and reminders are handled by ${c.booking.platform} under its own privacy policy.`);
  if (c.usesGoogle) third.push("Google, which serves some photos and reviews on this site and opens when you ask for directions.");
  if (c.video) third.push("Pexels, which hosts the background video on the home page.");
  if (c.social.instagram || c.social.facebook || c.social.tiktok) third.push("Social networks, only if you follow a link to our profiles.");

  return [
    {
      heading: "What this website collects",
      body: [
        "This website has no contact forms, accounts or newsletter sign-ups, and it does not set its own cookies or run analytics. We do not collect personal information through it.",
      ],
    },
    {
      heading: "Services your browser connects to",
      body: third.length ? third : ["None beyond the website host."],
    },
    {
      heading: "Server logs",
      body: ["Like any website, our hosting provider may keep standard technical logs (such as IP address and browser type) for security and reliability."],
    },
    {
      heading: "Contact",
      body: [
        `Questions about privacy can be directed to ${c.name}${c.phone ? ` at ${c.phone.display}` : ""}, ${c.addressLine}.`,
      ],
    },
  ];
}

# Van Michael Salon — website

Production site for a nine-location salon group in metro Atlanta.
Next.js 14 (App Router) + TypeScript + Tailwind, built as a **fully static export**.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build it

```bash
npm run build      # static site in ./out
npm run typecheck  # types only, no emit
```

`npm run build` writes 18 static pages to `out/`. There is no server, no
database and no runtime cost.

---

## Deploy

### Netlify (configured)
`netlify.toml` is committed. Connect the repo and Netlify reads it:
build `npm run build`, publish `out`. Security and cache headers are set there too.

To deploy by hand: run `npm run build` and drag the `out` folder onto
<https://app.netlify.com/drop>.

### Anywhere else
`out/` is plain HTML, CSS and JS. Vercel, Cloudflare Pages, S3 + CloudFront,
or any web server will serve it.

---

## Architecture, and why

| Decision | Reason |
| --- | --- |
| **Static export** (`output: "export"`) | Content changes rarely and booking is external, so there is nothing to render per request. Fastest possible site, no server to patch, no hosting bill. |
| **Booking handed to Zenoti** | The salon already runs Zenoti. It owns the calendar, so it is the only system that can prevent a double booking, and it sends every confirmation, reschedule and cancellation notice. This site never accepts an appointment — a second booking surface is how double bookings happen. |
| **No forms, no database, no admin** | Nothing is collected, so there is nothing to leak, no privacy notice required and no login to secure. |
| **One page per location** | Nine `/locations/[slug]/` pages, each with its own title, description, canonical and LocalBusiness schema. This is the local SEO surface; a single combined page cannot rank for nine neighbourhoods. |
| **Content in `src/content/*.ts`** | Typed data files. Change a phone number in one place and it updates the card, the location page, the footer and the structured data together. |
| **Fonts via stylesheet link** | `next/font` downloads font files during `next build`, so a slow fonts.googleapis.com breaks CI. See "Switching to next/font" below if you would rather self-host. |

---

## Editing content

Everything a marketer touches lives in three files:

```
src/content/site.ts        brand, contact, booking URLs, awards, FAQ
src/content/locations.ts   all nine salons — the single source of truth
src/content/services.ts    the eight service areas
```

### Changing a location
Open `src/content/locations.ts`, edit the entry, commit. Keep `hours` and
`openingHours` in step — the first is what people read, the second is what
Google reads.

### Adding a tenth location
Append an object to the `locations` array. The card, the `/locations/<slug>/`
page, the sitemap entry and the structured data are all generated from it.

---

## Photography

Each location carries two image URLs:

```ts
photo:         // the salon's own Google Business Profile photograph
photoFallback: // licensed stock, used automatically if the first fails
```

`src/components/Photo.tsx` swaps to the fallback on error, so a reviewer never
sees a broken image.

**Before launch:** Google's photo URLs can expire. Ask the client for their own
image files, drop them in `public/locations/`, and change `photo` to
`/locations/buckhead.jpg`. Fifteen minutes, and it removes the only external
image dependency.

---

## SEO

- One hand-written `<title>` and description per page, all under ~60 / ~160 chars
- `Organization` schema sitewide, listing all nine as `subOrganization`
- `HairSalon` / `HealthAndBeautyBusiness` schema per location, with coordinates,
  opening hours, aggregate rating and a `ReserveAction` pointing at Zenoti
- `BreadcrumbList` on inner pages, `FAQPage` on `/visit/`
- `sitemap.xml` and `robots.txt` generated at build from the content files
- Canonical URLs everywhere

Set the real domain in `src/content/site.ts` → `url`. Everything else follows.

---

## Accessibility

Skip link, semantic landmarks, one `h1` per page, alt text on every image,
visible focus rings, decorative stars hidden from assistive tech, and
`prefers-reduced-motion` respected.

---

## Verifying

```bash
npm run build && node verify.js
```

`verify.js` checks the built `out/` directory: that all nine location pages
exist and render without JavaScript, that rating, review count, postcode and
phone match the source data on every page, that titles and canonicals are
present and correctly sized, that all JSON-LD parses, that every booking link
reaches Zenoti, that no placeholder text shipped, and that the sitemap covers
every page. 20 assertions, all passing.

---

## Switching to next/font

If your CI can reach Google, self-hosting the fonts is slightly faster and
removes a third-party request. In `src/app/layout.tsx`, drop the three `<link>`
tags and restore:

```tsx
import { Newsreader, Public_Sans } from "next/font/google";
const serif = Newsreader({ subsets: ["latin"], weight: ["300","400"], variable: "--font-serif", display: "swap" });
const sans  = Public_Sans({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-sans", display: "swap" });
// <html lang="en" className={`${serif.variable} ${sans.variable}`}>
```

Then point the Tailwind font stacks back at `var(--font-serif)` / `var(--font-sans)`.

---

## Still needed from the client

1. **Written authorisation to publish** under the Van Michael name.
2. **Logo files** — the header currently uses a text wordmark.
3. **Photography** — their own image files, to replace the Google-hosted URLs.
4. **Artist roster** with headshots, if a team page is wanted.

Business data (addresses, phone numbers, opening hours, ratings) was read from
vanmichael.com and Google Business Profile on 9 October 2026. Confirm hours with
the owner before launch; holiday hours are not represented.

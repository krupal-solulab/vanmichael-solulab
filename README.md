# Site Generator (salon & barber)

Next.js 16 app that turns a **Google Maps listing and/or booking link** into complete, distinct website designs for that exact business.
First category: hair salons and barbershops, with **2 template families**:

| Family | Character |
| --- | --- |
| **Cinematic Atelier** | Dark, craft-led. Full-bleed video/photo hero, image-led work mosaic, numbered service chapters, portrait team panels. |
| **Modern Editorial Studio** | Bright, approachable. Split hero with booking panel, tabbed service chooser, choose-a-stylist path, magazine gallery, FAQ. |

Both render the **same verified business record**, so they can never disagree on a fact. They differ in composition, typography, DOM and pacing, not just colours.

---

## Run it

```bash
npm install
cp .env.example .env.local    # add keys (see below)
npm run dev                   # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint (flat config) |
| `npm test` | Vitest: parser, normaliser, release checks, routes, SSRF guard |

### Environment

| Variable | Needed for |
| --- | --- |
| `GOOGLE_PLACES_API_KEY` | Google Maps links, Google photos, review text, cross-checking identity. Enable **Places API (New)** and restrict the key to it. Without it, booking-page data still works. |
| `PEXELS_API_KEY` | Optional licensed stock hero video. Without it, heroes use a still photo. |
| `GENERATOR_USER` / `GENERATOR_PASSWORD` | HTTP basic auth over the whole app (generator **and** previews). Set this on any deployed instance. |

---

## How it works

```
form (Maps link / booking link / website, template count)
  → research      read each source independently; one failure never blocks the rest
  → identity      match name/address/phone; never merge a similarly named business
  → record        every fact keeps source URL, retrieval time, status, conflicts
  → checks        blockers / owner approvals / handled fallbacks
  → previews      /p/<job>/<atelier|editorial>/…  (noindex, behind auth)
```

**Sources**

- **Google Places API (New)**: name, address, phone, coordinates, weekly hours, rating, review text, photos with author attribution. Photos are proxied live through `/api/media/places/` and never stored, as Places policy requires.
- **Booking page**: the schema.org data the page publishes. On Booksy that's address, hours, rating, all priced services, the staff roster with portraits, booking policies, the owner's booking note and portfolio photos. Customer review photos are deliberately skipped. Other platforms are read through the same JSON-LD path where they publish it.
- **Website**: JSON-LD, description, social links, booking links.
- **Social media**: links are recorded only when they're exact and valid. Content is **not** imported. Instagram and Facebook require the business's own API authorisation, and scraping them breaks their terms.

**Rules the generator enforces** (from the audit brief)

- **Nothing invented.** Unknown stays unknown. No About page without a verified story, no Team page without a roster, no Gallery with fewer than 3 photos, and provider specialties are only shown when a human adds them.
- **Prices are labelled honestly.** Booking-platform prices are shown as "from" amounts with the retrieval date until the owner confirms them.
- **Ratings stay attributed.** Each rating is labelled with its real platform and linked to it, and the stars are partially filled. There's no `aggregateRating` in the schema, because self-serving review markup is ineligible.
- **Media is tracked by permission:**
  - `places-attribution`: displayed with credit, never stored.
  - `pending-owner`: shown in private previews only, and blocks release.
  - `owner-approved`: cleared by the business.
  - `licensed-stock`: always labelled as stock.
- **Template counts are honest.** If more templates are requested than distinct families exist, the job says so and generates only the distinct ones.
- **Reference leaks are blocked.** Any Van Michael, Aveda or Zenoti text in a record is a release blocker.

**Visitors never leave the site.** Every external destination opens inside the page:

| Visitor action | What happens |
| --- | --- |
| Book (any button) | Booksy's official booking widget opens in an in-page window. Service, add-ons, staff, date, time and email sign-in all happen inside it. |
| Directions / address | Google's embeddable map of the business opens in an in-page window. The Visit page also has an embedded map. |
| Ratings, review authors, photo credits | Shown as text, not links. |

How the booking window keeps visitors on the page:
- The widget frame is sandboxed without `allow-popups` and without `allow-top-navigation`, so nothing inside it can open a tab or replace the page.
- Widget hand-offs (`goToUrl`, `sendPost`) load inside the same frame.

What can't be kept in-page, and why:
- **Social sign-in inside the Booksy widget** (Continue with Facebook, Apple or Google) can't work in-page. These login pages send `X-Frame-Options: DENY` and must open as their own window, a security rule that stops sites capturing passwords. With popups blocked, those buttons do nothing; email sign-in works inside the window.
- **"Powered by Booksy"** is Booksy's own link inside its frame. We can't remove it from another site's page, so the sandbox simply blocks it.
- **Booksy's full profile page, Google Maps' full site and Instagram** refuse framing (`DENY` / `SAMEORIGIN`). The embeddable equivalents are used for booking and maps. Instagram profiles have no embeddable equivalent, so social links, when a record has them, remain normal links.
- **Booking platforms other than Booksy** keep opening in a new tab until their embedding is verified (`bookingEmbedUrl` in `src/lib/sources/booking-parse.ts`).
- **Escape key:** it can't close the window while the keyboard focus is inside Booksy's frame, because the browser sends key presses to that frame. The ✕ button and clicking outside always work.
- **Console error:** Booksy's widget logs a "Maximum call stack size exceeded" error. It happens on Booksy's own official embed too, and booking still works.

**Job dashboard** (`/jobs/<id>/`) shows:

- The identity card with each fact's status and sources.
- Release checks, with "Mark owner-confirmed" buttons.
- The source log.
- Services, team and media with their permission badges.
- Downloads: the **evidence record** and the **media manifest**.
- **Compare side by side** at 1440, 768 and 390 px.
- **Edit facts**: a validated JSON editor. Edits apply to every variant and bump the content version.

**Automation:** `POST /api/jobs/` with `{"mapsUrl"?, "bookingUrl"?, "websiteUrl"?, "templateCount"}` takes the same input as the form.

**Security:** user-supplied URLs go through `src/lib/safe-fetch.ts`:

- Only http and https links are accepted.
- Private, loopback, link-local and metadata IPs are blocked.
- Each redirect hop is checked again.
- Requests time out, and responses have a size cap.
- Fetched pages are parsed as data and never executed.
- Form submissions are rate-limited.

Known limitation: DNS rebinding isn't fully excluded, which is acceptable behind auth.

---

## Deploy (Netlify)

`netlify.toml` is committed, and Netlify applies its Next.js runtime automatically. Jobs are stored in **Netlify Blobs** when deployed and in `./.data/` locally.

1. Connect the repo in Netlify.
2. Set `GOOGLE_PLACES_API_KEY`, `GENERATOR_PASSWORD` and optionally `PEXELS_API_KEY`.
3. Deploy. Every response carries `X-Robots-Tag: noindex`.

---

## Not built yet (next phase)

- **Publishing a selected version** as an immutable static artifact on the client's domain. This includes the canonical URL, sitemap and open-graph tags generated from that domain, the asset copy for owner-approved media, and the two-hour launch runbook. Previews already emit a schema graph that becomes complete once a domain is set.
- **Uploads**: owner logo, photos and footage. Today, owner media can only be referenced by URL in Edit facts.
- **Per-photo curation UI**: hide a photo or set the cover. Today this means changing an asset's `role` in Edit facts; `atmosphere` hides it from the hero and gallery.
- **Lighthouse and real-device testing**: not yet run. Responsive checks so far are Playwright captures at 1440 and 390 px.

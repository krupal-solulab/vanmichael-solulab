/** A trimmed, synthetic page shaped like a Booksy business page (structure only; invented business). */
export const BOOKSY_URL = "https://booksy.com/en-us/123456_sample-studio_hair-salon_1_testville";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: "Sample Studio",
  url: BOOKSY_URL,
  image: "https://d2zdpiztbgorvt.cloudfront.net/region1/us/123456/biz_photo/cover-booksy.jpeg",
  logo: "https://d2zdpiztbgorvt.cloudfront.net/region1/us/123456/logo/logo-booksy.jpeg",
  address: { "@type": "PostalAddress", streetAddress: "100 MAIN ST. SUITE 5, Testville, GA, 30000", addressLocality: "Testville", addressRegion: "GA", postalCode: "30000" },
  geo: { "@type": "GeoCoordinates", latitude: 33.9, longitude: -84.2 },
  paymentAccepted: "Cash",
  sameAs: ["https://samplestudio"],
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Wednesday"], opens: "10:00", closes: "19:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "10:00", closes: "17:00" },
  ],
  aggregateRating: { "@type": "AggregateRating", ratingValue: 4.790322580645161, reviewCount: 62 },
  makesOffer: [
    { "@type": "Offer", name: "eyebrow waxinng", priceCurrency: "USD", price: 20 },
    { "@type": "Offer", name: "Balayage", priceCurrency: "USD", price: 220 },
    { "@type": "Offer", name: "Eyelash Application", priceCurrency: "USD", price: 25 },
  ],
  employee: [
    { name: "Ana Example", image: "https://d2zdpiztbgorvt.cloudfront.net/region1/us/123456/resource_photos/ana.jpeg" },
    { name: "luis sample" },
  ],
};

export const BOOKSY_HTML = `<!doctype html><html><head>
<meta property="og:title" content="Sample Studio - Testville, GA - Book Online">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head><body>
<img src="https://d2zdpiztbgorvt.cloudfront.net/region1/us/123456/inspiration/work1-booksy.jpeg?size=360x360">
<img src="https://d2zdpiztbgorvt.cloudfront.net/region1/us/123456/inspiration/work2-booksy.jpeg?size=360x360">
<img src="https://d2zdpiztbgorvt.cloudfront.net/region1/us/123456/review_photos/customer-booksy.jpeg">
<section><h2>Business hours</h2><div data-test="boh-note-wrapper"><p class="x" data-test="boh-note-text">Please have in mind when booking:- Bleach appointments are not accepted after 1pm.- If you have any questions, give us a call at 555-010-4477</p></div></section>
<section><h2>Booking Policies</h2><ul><li><p class="text-sm">No walk-ins</p></li></ul></section>
<section><h2>Social Media</h2><a href="https://samplestudio"><svg></svg>Instagram</a></section>
<footer><a href="https://www.instagram.com/booksybiz/">Instagram</a></footer>
</body></html>`;

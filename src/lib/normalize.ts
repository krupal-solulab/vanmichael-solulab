import type { Address, HoursInterval, ServiceCategory } from "./types";

export const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const SMALL = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with", "con", "de", "del", "sin", "y"]);
const KEEP_UPPER = new Set(["VM", "UV", "CBD", "3D", "XL"]);

/** Spelling fixes that do not change meaning. Kept short and explicit on purpose. */
const TYPOS: Record<string, string> = {
  waxinng: "waxing",
  ruber: "rubber",
  clasicas: "clásicas",
  hibridas: "híbridas",
  remocion: "remoción",
  depilacion: "depilación",
  diseno: "diseño",
};

/**
 * Title-cases words the source typed in all-lower or ALL-CAPS and fixes listed typos.
 * Words the owner deliberately mixed-cased ("Press On", "McKenzie") are left alone.
 */
export function displayName(source: string): string {
  const words = source.trim().replace(/\s+/g, " ").split(" ");
  return words
    .map((w, i) => {
      const [, lead, core, trail] = w.match(/^([^\p{L}\d]*)(.*?)([^\p{L}\d]*)$/u) ?? [, "", w, ""];
      const lower = core.toLowerCase();
      const typo = TYPOS[lower];
      if (KEEP_UPPER.has(core.toUpperCase())) return lead + core.toUpperCase() + trail;
      const mixed = core !== lower && core !== core.toUpperCase();
      if (mixed && !typo) return w;
      const fixed = typo ?? lower;
      if (i > 0 && SMALL.has(fixed)) return lead + fixed + trail;
      return lead + fixed.replace(/(^|[-+/])(\p{L})/gu, (_, p, c: string) => p + c.toUpperCase()) + trail;
    })
    .join(" ");
}

const RULES: [ServiceCategory, RegExp][] = [
  ["grooming", /\b(barba|beard|shave|afeitado|line ?up|fade|men'?s? groom)/i],
  ["extensions", /\b(extension|extensiones|tape[- ]?in|k-tip|weft)/i],
  // Before waxing so "hair wax fusio dose kerastase" (a Kérastase treatment) is not filed as waxing.
  ["treatments", /\b(keratin|kerastase|kérastase|treatment|conditioning|olaplex|tratamiento|hidrata)/i],
  // No leading \b on lash/brow so "Eyelash" and "Eyebrow" match.
  ["lashes", /(lash|\bpestañas|\bpestanas|\bclasicas|\bclásicas|\bhibridas|\bhíbridas|\brimel|\bvolumen)/i],
  ["brows-waxing", /(brow|\bceja|\bcejas|\bmicroblading|\bhenna|\bhena|\bthread|\bwax|\bdepila|\blip|\bmicrolips|\bpolvo|\bmixbrows)/i],
  ["nails", /\b(manicure|pedicure|nail|acrylic|acr[ií]lic|press on|gel|ruber|rubber|uñas)/i],
  ["makeup", /\b(makeup|make-up|maquillaje)/i],
  ["color", /\b(colou?r|balayage|highlight|foil|glaze|toner|ombre|process|tint|bleach|mechas|tinte)/i],
  ["styling", /\b(blow|style|styling|updo|wash|shampoo|peinado|brushing|curl|braid)/i],
  ["cuts", /\b(cut|haircut|corte|trim|bang)/i],
];

export function categorize(name: string): ServiceCategory {
  for (const [cat, re] of RULES) if (re.test(name)) return cat;
  return "other";
}

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  cuts: "Haircuts",
  color: "Color",
  treatments: "Treatments",
  styling: "Styling",
  extensions: "Extensions",
  grooming: "Grooming",
  makeup: "Makeup",
  nails: "Nails",
  lashes: "Lashes",
  "brows-waxing": "Brows & Waxing",
  other: "More services",
};

/** Hair first, then the rest of the confirmed menu (brief S03). */
export const CATEGORY_ORDER: ServiceCategory[] = [
  "cuts", "color", "treatments", "styling", "extensions", "grooming", "makeup", "lashes", "brows-waxing", "nails", "other",
];

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function dayIndex(name: string): number | undefined {
  const key = name.replace(/^https?:\/\/schema\.org\//i, "").slice(0, 2).toLowerCase();
  const i = ["su", "mo", "tu", "we", "th", "fr", "sa"].indexOf(key);
  return i === -1 ? undefined : i;
}

export function hhmm(t: string): string {
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : t;
}

export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
}

export type HoursRow = { days: string; time: string; closed: boolean };

/** Groups consecutive days with identical hours, Monday first. */
export function groupHours(intervals: HoursInterval[]): HoursRow[] {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const perDay = order.map((d) => {
    const list = intervals.filter((i) => i.day === d).sort((a, b) => a.open.localeCompare(b.open));
    return { d, label: list.length ? list.map((i) => `${formatTime(i.open)} – ${formatTime(i.close)}`).join(", ") : "Closed" };
  });
  const rows: HoursRow[] = [];
  for (let i = 0; i < perDay.length; ) {
    let j = i;
    while (j + 1 < perDay.length && perDay[j + 1].label === perDay[i].label) j++;
    const days = i === j ? DAY_NAMES[perDay[i].d] : `${DAY_NAMES[perDay[i].d]} – ${DAY_NAMES[perDay[j].d]}`;
    rows.push({ days, time: perDay[i].label, closed: perDay[i].label === "Closed" });
    i = j + 1;
  }
  return rows;
}

export function sameHours(a: HoursInterval[], b: HoursInterval[]) {
  const key = (x: HoursInterval[]) => x.map((i) => `${i.day}-${i.open}-${i.close}`).sort().join("|");
  return key(a) === key(b);
}

export function digits(phone: string) {
  return phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
}

export function formatUsPhone(phone: string) {
  const d = digits(phone);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : phone;
}

export const telHref = (phone: string) => {
  const d = digits(phone);
  return d.length === 10 ? `tel:+1${d}` : `tel:${phone.replace(/[^\d+]/g, "")}`;
};

/** "6409 JIMMY CARTER BLVD. SUITE 200, Norcross, GA, 30071" → street + suite. */
export function splitStreet(raw: string, city?: string): { street: string; suite?: string } {
  let s = raw.split(",")[0].trim();
  if (city && raw.toLowerCase().indexOf(city.toLowerCase()) > 0) s = raw.slice(0, raw.toLowerCase().indexOf(city.toLowerCase())).replace(/,\s*$/, "").trim();
  const m = s.match(/^(.*?)[,\s]+((?:suite|ste\.?|unit|#)\s*[\w-]+)$/i);
  const street = (m ? m[1] : s).replace(/\.$/, "");
  const suite = m ? m[2].replace(/^ste\.?/i, "Suite").replace(/^suite/i, "Suite") : undefined;
  return { street: titleIfShouting(street), suite: suite && titleIfShouting(suite) };
}

function titleIfShouting(s: string) {
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/\b(\p{L})/gu, (c) => c.toUpperCase()).replace(/\b(Ne|Nw|Se|Sw)\b/g, (x) => x.toUpperCase());
}

export function addressLine(a: Address) {
  return `${a.street}${a.suite ? `, ${a.suite}` : ""}, ${a.city}, ${a.region} ${a.postalCode}`;
}

/** Loose comparison used to decide whether two sources describe the same place. */
export function sameAddress(a: Address, b: Address) {
  const num = (s: string) => s.match(/^\d+/)?.[0];
  return a.postalCode.slice(0, 5) === b.postalCode.slice(0, 5) && num(a.street) === num(b.street);
}

export function directionsUrl(name: string, a: Address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${addressLine(a)}`)}`;
}

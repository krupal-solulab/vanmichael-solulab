export type Service = { slug: string; name: string; blurb: string; url: string };

/**
 * Service areas as published by the salon. Prices are deliberately absent:
 * they are tiered by artist level and shown live inside the booking system,
 * which is the only place they are guaranteed current.
 */
export const services: Service[] = [
  { slug: "cut", name: "VM Cut", blurb: "Precision cuts, expertly shaped and tailored to you.", url: "https://vanmichael.com/services/cut" },
  { slug: "color", name: "VM Color", blurb: "Dimensional colour, expertly blended.", url: "https://vanmichael.com/services/color" },
  { slug: "new-talents", name: "New Talents", blurb: "Licensed cosmetologists trained the Van Michael way, at an approachable price.", url: "https://vanmichael.com/services/new-talents" },
  { slug: "men", name: "Van Michael Men", blurb: "Expert grooming for sharp cuts and clean shaves.", url: "https://vanmichael.com/services/van-michael-men" },
  { slug: "aesthetics", name: "Aesthetics", blurb: "Injectables and skin renewal, including microneedling and peels.", url: "https://vanmichael.com/services/salon-aesthetics" },
  { slug: "makeup-waxing", name: "Makeup & Waxing", blurb: "Personalised for every style and event.", url: "https://vanmichael.com/services/makeup-and-waxing" },
  { slug: "bridal", name: "Bridal", blurb: "Flawless, radiant looks for your special day.", url: "https://vanmichael.com/services/bridal" },
  { slug: "extensions", name: "Extensions & Smoothing", blurb: "Extensions, keratin treatments and relaxers.", url: "https://vanmichael.com/services/extensions-keratin-treatments-relaxers" },
];

export type Area = "intown" | "north" | "men" | "aesthetics";

export type Location = {
  slug: string;
  /** Short label used in cards and navigation. */
  name: string;
  /** Full legal/display name used in titles and structured data. */
  fullName: string;
  area: Area;
  badge?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  phoneHref: string;
  lat: number;
  lng: number;
  /** Google rating and review count. Refresh when the client asks. */
  rating: number;
  reviews: number;
  mapsUrl: string;
  /** Photograph from the salon's Google Business Profile. */
  photo: string;
  /** Licensed stock image used automatically if the photo above fails to load. */
  photoFallback: string;
  photoAlt: string;
  /** Human-readable opening hours, grouped. */
  hours: { days: string; time: string; closed?: boolean }[];
  /** schema.org openingHours strings. Keep in step with `hours` above. */
  openingHours: string[];
  /** schema.org type — aesthetics is not a hair salon. */
  schemaType: "HairSalon" | "HealthAndBeautyBusiness";
  /** One line of orientation shown on the location page. */
  intro: string;
  /**
   * Full <title> for this location's page, written by hand so it stays under
   * ~60 characters and describes the right kind of business. Appended brand
   * names push location titles past what Google will display.
   */
  metaTitle: string;
};

const G = "https://lh3.googleusercontent.com/grass-cs/";
const U = (id: string, w = 1200, h = 750) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70&w=${w}&h=${h}`;

export const locations: Location[] = [
  {
    slug: "buckhead",
    name: "Buckhead",
    fullName: "Van Michael Salon — Buckhead",
    area: "intown",
    street: "39 W Paces Ferry Rd NW",
    city: "Atlanta",
    state: "GA",
    zip: "30305",
    phone: "404-237-4664",
    phoneHref: "tel:+14042374664",
    lat: 33.8405574,
    lng: -84.3808455,
    rating: 4.7,
    reviews: 656,
    mapsUrl: "https://maps.google.com/?cid=5827433259204875491",
    photo:
      G +
      "AABkmLcfl7yoH6ScISuHlC1bbmb28HecZXKCLHkbj9uo0NzpnWHO_0pP00Ki8iw3qKN6CdRQgwFLpUZc3a2165nUCZIMb19eodENg2NBH_WBVAE1lRErkkpHOwW9TIKie44w73nPCGIAJMPSHlpQ=s4800-w800-h600",
    photoFallback: U("1633681926022-84c23e8cb2d6"),
    photoAlt: "Interior of Van Michael Salon in Buckhead",
    hours: [
      { days: "Monday", time: "8am – 5pm" },
      { days: "Tuesday", time: "8am – 7pm" },
      { days: "Wednesday – Thursday", time: "8am – 8pm" },
      { days: "Friday", time: "8am – 7pm" },
      { days: "Saturday", time: "8am – 6pm" },
      { days: "Sunday", time: "Closed", closed: true },
    ],
    openingHours: ["Mo 08:00-17:00", "Tu 08:00-19:00", "We 08:00-20:00", "Th 08:00-20:00", "Fr 08:00-19:00", "Sa 08:00-18:00"],
    schemaType: "HairSalon",
    intro:
      "The original salon, open since 1984 and still the largest in the group. On West Paces Ferry Road, a short walk from Buckhead Village.",
    metaTitle: "Buckhead Hair Salon | Van Michael Atlanta",
  },
  {
    slug: "midtown",
    name: "Midtown",
    fullName: "Van Michael Salon — Midtown",
    area: "intown",
    street: "929 Peachtree St NE",
    city: "Atlanta",
    state: "GA",
    zip: "30309",
    phone: "404-266-8647",
    phoneHref: "tel:+14042668647",
    lat: 33.7800697,
    lng: -84.3838804,
    rating: 4.9,
    reviews: 635,
    mapsUrl: "https://maps.google.com/?cid=11247988268001896222",
    photo:
      G +
      "AABkmLe9MwndmwDdG6vdhxs1B4UTXRBv7Z9JC-mWqHT45FXItOES6tIdVbWRnrrhTsfrkXxHyTt_FQBKkG7YHywtoDrZOxshYx2B8qufY0qUddkR5LtDJhOjI47QkBe_H2gSpupsGnbiYKQ5eIw=s4800-w800-h600",
    photoFallback: U("1521590832167-7bcbfaa6381f"),
    photoAlt: "Interior of Van Michael Salon in Midtown Atlanta",
    hours: [
      { days: "Monday", time: "Closed", closed: true },
      { days: "Tuesday", time: "8:45am – 6pm" },
      { days: "Wednesday – Thursday", time: "8:45am – 7pm" },
      { days: "Friday", time: "8:45am – 6pm" },
      { days: "Saturday", time: "8am – 5pm" },
      { days: "Sunday", time: "Closed", closed: true },
    ],
    openingHours: ["Tu 08:45-18:00", "We 08:45-19:00", "Th 08:45-19:00", "Fr 08:45-18:00", "Sa 08:00-17:00"],
    schemaType: "HairSalon",
    intro:
      "On Peachtree Street, two minutes from the Midtown MARTA station. Closed Mondays.",
    metaTitle: "Midtown Atlanta Hair Salon | Van Michael",
  },
  {
    slug: "virginia-highland",
    name: "Virginia-Highland",
    fullName: "Van Michael Salon — Virginia-Highland",
    area: "intown",
    street: "675 N Highland Ave NE Ste 1000",
    city: "Atlanta",
    state: "GA",
    zip: "30306",
    phone: "404-874-6604",
    phoneHref: "tel:+14048746604",
    lat: 33.7730673,
    lng: -84.3519393,
    rating: 4.9,
    reviews: 362,
    mapsUrl: "https://maps.google.com/?cid=10142917285843032761",
    photo:
      G +
      "AABkmLeQ0o0HRzHvrzGHay5IEi3dCfHMQ2NNEjnBE29wuDYknsY9vPZ7ZnJGEBRHYf0xYsL03LprtFn1sj5q40Yoh5oCnsO7phWw78SLVfnT-uWb0s6UF-bK2l79DDXBeNAGseQszMSK=s4800-w800-h576",
    photoFallback: U("1637777269327-c4d5c7944d7b"),
    photoAlt: "Interior of Van Michael Salon in Virginia-Highland",
    hours: [
      { days: "Monday", time: "8am – 6pm" },
      { days: "Tuesday – Thursday", time: "8am – 8pm" },
      { days: "Friday", time: "8am – 6pm" },
      { days: "Saturday", time: "8am – 5pm" },
      { days: "Sunday", time: "Closed", closed: true },
    ],
    openingHours: ["Mo 08:00-18:00", "Tu 08:00-20:00", "We 08:00-20:00", "Th 08:00-20:00", "Fr 08:00-18:00", "Sa 08:00-17:00"],
    schemaType: "HairSalon",
    intro:
      "On the corner of North Highland Avenue, with large windows and natural light through the styling floor.",
    metaTitle: "Virginia-Highland Hair Salon | Van Michael",
  },
  {
    slug: "sandy-springs",
    name: "Sandy Springs",
    fullName: "Van Michael Salon — Sandy Springs",
    area: "intown",
    street: "220 Sandy Springs Cir Ste 173",
    city: "Atlanta",
    state: "GA",
    zip: "30328",
    phone: "404-255-0026",
    phoneHref: "tel:+14042550026",
    lat: 33.9249558,
    lng: -84.3838556,
    rating: 4.7,
    reviews: 355,
    mapsUrl: "https://maps.google.com/?cid=12061593967964076228",
    photo:
      G +
      "AABkmLcNr1IQCQkto2-t55OiA1R42DOA0t1TN4ZiroJWdMWyIEwnp8c539VNhQYGYXxI44UjC3uhhrqPLGhKRk7HVnzKfNumb3szD4klWeNocl7xarKv1gcyz8wVOMVubn9cSm1fq_yH_bW85IOr=s4800-w800-h600",
    photoFallback: U("1600948836101-f9ffda59d250"),
    photoAlt: "Interior of Van Michael Salon in Sandy Springs",
    hours: [
      { days: "Monday", time: "8am – 4pm" },
      { days: "Tuesday", time: "8am – 7pm" },
      { days: "Wednesday – Saturday", time: "8am – 8pm" },
      { days: "Sunday", time: "Closed", closed: true },
    ],
    openingHours: ["Mo 08:00-16:00", "Tu 08:00-19:00", "We 08:00-20:00", "Th 08:00-20:00", "Fr 08:00-20:00", "Sa 08:00-20:00"],
    schemaType: "HairSalon",
    intro:
      "On Sandy Springs Circle, next door to Van Michael Aesthetics, so hair and skin can be booked on the same visit.",
    metaTitle: "Sandy Springs Hair Salon | Van Michael",
  },
  {
    slug: "the-forum",
    name: "The Forum",
    fullName: "Van Michael Salon — The Forum",
    area: "north",
    badge: "Highest rated",
    street: "5161 Peachtree Pkwy NW Ste 605-B",
    city: "Norcross",
    state: "GA",
    zip: "30092",
    phone: "678-987-3600",
    phoneHref: "tel:+16789873600",
    lat: 33.980189,
    lng: -84.217183,
    rating: 4.9,
    reviews: 708,
    mapsUrl: "https://maps.google.com/?cid=4482323248093788467",
    photo:
      G +
      "AABkmLfisl6BDRI7pZ7TAfCXNaTTyPzBPM53C2Wf_2ViOCgrnFQSPxUxAOmSI0MOQSrbp5zSdrR0sfn65OGIKQ2mzdQPO1JBYJifbE__L-W2xEetwaKLek59uUOexP3FwcC2Sd5U5ASF=s4800-w800-h600",
    photoFallback: U("1633681926022-84c23e8cb2d6"),
    photoAlt: "Interior of Van Michael Salon at The Forum in Norcross",
    hours: [
      { days: "Monday – Friday", time: "8am – 8pm" },
      { days: "Saturday", time: "8am – 7pm" },
      { days: "Sunday", time: "11am – 6pm" },
    ],
    openingHours: ["Mo-Fr 08:00-20:00", "Sa 08:00-19:00", "Su 11:00-18:00"],
    schemaType: "HairSalon",
    intro:
      "At The Forum on Peachtree Parkway, and the only salon in the group open seven days a week with the longest weekday hours.",
    metaTitle: "The Forum Hair Salon, Norcross | Van Michael",
  },
  {
    slug: "avalon",
    name: "Avalon",
    fullName: "Van Michael Salon — Avalon",
    area: "north",
    street: "3155 Avalon Blvd",
    city: "Alpharetta",
    state: "GA",
    zip: "30009",
    phone: "678-987-3678",
    phoneHref: "tel:+16789873678",
    lat: 34.0709736,
    lng: -84.277083,
    rating: 4.6,
    reviews: 199,
    mapsUrl: "https://maps.google.com/?cid=5405578891255428873",
    photo:
      G +
      "AABkmLdgEIJEcCnRioxmpVmfgB8aNoNYt-Bs3PjONIeqMtscZLC0wsfyA3220E6Opv9KKhnQVNvFmJF8417mkDc2I4MCZQb3pWO6cbiSplj14l9VN0KbS67b9y1VYsmn1OSLWljMTWx2=s4800-w800-h600",
    photoFallback: U("1521590832167-7bcbfaa6381f"),
    photoAlt: "Interior of Van Michael Salon at Avalon in Alpharetta",
    hours: [
      { days: "Monday", time: "8am – 6pm" },
      { days: "Tuesday", time: "8am – 8pm" },
      { days: "Wednesday – Saturday", time: "8am – 7:15pm" },
      { days: "Sunday", time: "10am – 5pm" },
    ],
    openingHours: ["Mo 08:00-18:00", "Tu 08:00-20:00", "We 08:00-19:15", "Th 08:00-19:15", "Fr 08:00-19:15", "Sa 08:00-19:15", "Su 10:00-17:00"],
    schemaType: "HairSalon",
    intro:
      "Inside the Avalon development in Alpharetta, open seven days with parking on site.",
    metaTitle: "Avalon Hair Salon, Alpharetta | Van Michael",
  },
  {
    slug: "east-cobb",
    name: "East Cobb",
    fullName: "Van Michael Salon — East Cobb",
    area: "north",
    street: "4475 Roswell Rd Ste 1730",
    city: "Marietta",
    state: "GA",
    zip: "30062",
    phone: "404-566-4247",
    phoneHref: "tel:+14045664247",
    lat: 33.987952,
    lng: -84.4219195,
    rating: 4.6,
    reviews: 225,
    mapsUrl: "https://maps.google.com/?cid=4644533164966387002",
    photo:
      G +
      "AABkmLcJV37RvLTdQnSyvpCdf96O9_aeZcilhmah0ku2exU-CxhGAc-iG6ykHhl7VXhISa-qAvleACz41NbFZNAd7Che8C2itPZBvO5uSYwBBrLnCBy_n90ly1aSlyXE2MDzmj1LMdnt-dHkAYJb=s4800-w800-h600",
    photoFallback: U("1637777269327-c4d5c7944d7b"),
    photoAlt: "Interior of Van Michael Salon in East Cobb, Marietta",
    hours: [
      { days: "Monday", time: "10am – 5pm" },
      { days: "Tuesday – Friday", time: "8am – 8pm" },
      { days: "Saturday", time: "8am – 6pm" },
      { days: "Sunday", time: "Closed", closed: true },
    ],
    openingHours: ["Mo 10:00-17:00", "Tu-Fr 08:00-20:00", "Sa 08:00-18:00"],
    schemaType: "HairSalon",
    intro: "On Roswell Road in Marietta, opening later on Mondays than the rest of the group.",
    metaTitle: "East Cobb Hair Salon, Marietta | Van Michael",
  },
  {
    slug: "van-michael-men",
    name: "Van Michael Men",
    fullName: "Van Michael Men — The Battery",
    area: "men",
    badge: "Grooming",
    street: "875 Battery Ave SE Ste 745",
    city: "Atlanta",
    state: "GA",
    zip: "30339",
    phone: "678-987-3654",
    phoneHref: "tel:+16789873654",
    lat: 33.8891282,
    lng: -84.4696927,
    rating: 4.8,
    reviews: 241,
    mapsUrl: "https://maps.google.com/?cid=13713906430596154141",
    photo:
      G +
      "AABkmLdplZwIe_iBZOhmEgAkWkJSOROAlpehzkQseemMBlEcroGFO905OWzYht0mmXm6s6AUZQBotBgucgrjZ2KUW1HjeHZj8ccF2hCLCh0bnQhKJp-3B-74LUC0MWuxm_0jdCHOJyhE=s4800-w800-h600",
    photoFallback: U("1503951914875-452162b0f3f1"),
    photoAlt: "Interior of Van Michael Men at The Battery Atlanta",
    hours: [
      { days: "Monday – Wednesday", time: "10am – 7pm" },
      { days: "Thursday", time: "10am – 8pm" },
      { days: "Friday", time: "10am – 7pm" },
      { days: "Saturday – Sunday", time: "10am – 6pm" },
    ],
    openingHours: ["Mo-We 10:00-19:00", "Th 10:00-20:00", "Fr 10:00-19:00", "Sa 10:00-18:00", "Su 10:00-18:00"],
    schemaType: "HairSalon",
    intro:
      "Grooming only, at The Battery next to Truist Park. Check the baseball schedule before booking on a game day.",
    metaTitle: "Van Michael Men | Barbershop at The Battery",
  },
  {
    slug: "van-michael-aesthetics",
    name: "Van Michael Aesthetics",
    fullName: "Van Michael Aesthetics",
    area: "aesthetics",
    badge: "Skin",
    street: "220 Sandy Springs Cir Ste 177",
    city: "Sandy Springs",
    state: "GA",
    zip: "30328",
    phone: "404-487-4900",
    phoneHref: "tel:+14044874900",
    lat: 33.9249838,
    lng: -84.3837349,
    rating: 4.9,
    reviews: 56,
    mapsUrl: "https://maps.google.com/?cid=14566172552414506227",
    photo:
      G +
      "AABkmLfmXoi0By81C3FHlRJAf93Imf9UisqRjkWxrrp2RrlM68APIo0-PDvWdv8xIhS6O_c9Dgije5Bn4HxDxLOGsx_526PKEO71cpFYNqxyMmfm94lL6UP5JEYeley6ZxXRbqGsxgqcZbQNYO0=s4800-w800-h600",
    photoFallback: U("1600948836101-f9ffda59d250"),
    photoAlt: "Treatment room at Van Michael Aesthetics in Sandy Springs",
    hours: [
      { days: "Monday – Friday", time: "9am – 5pm" },
      { days: "Saturday – Sunday", time: "Closed", closed: true },
    ],
    openingHours: ["Mo-Fr 09:00-17:00"],
    schemaType: "HealthAndBeautyBusiness",
    intro:
      "Injectables and skin renewal, next door to the Sandy Springs salon. Weekdays only.",
    metaTitle: "Van Michael Aesthetics | Sandy Springs Skin Studio",
  },
];

export const areaLabels: Record<Area | "all", string> = {
  all: "All nine",
  intown: "In town",
  north: "North metro",
  men: "Men's grooming",
  aesthetics: "Aesthetics",
};

export function getLocation(slug: string) {
  return locations.find((l) => l.slug === slug);
}

/** Weighted average rating and total review count across every location. */
export function aggregate() {
  const reviews = locations.reduce((n, l) => n + l.reviews, 0);
  const weighted = locations.reduce((n, l) => n + l.reviews * l.rating, 0);
  return { reviews, rating: Math.round((weighted / reviews) * 10) / 10 };
}

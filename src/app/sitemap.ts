import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { locations } from "@/content/locations";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/locations/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/services/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/visit/`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    ...locations.map((l) => ({
      url: `${site.url}/locations/${l.slug}/`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

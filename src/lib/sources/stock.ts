import "server-only";

/**
 * Licensed stock from Pexels (free licence, commercial use allowed, credit
 * appreciated). Stock only ever supplies atmosphere: it is labelled as stock
 * and never captioned as the business, its staff, clients or results.
 */

export const stockEnabled = () => Boolean(process.env.PEXELS_API_KEY);

type PexelsVideo = {
  id: number;
  url: string;
  width: number;
  height: number;
  duration: number;
  image: string;
  user: { name: string; url: string };
  video_files: { link: string; width: number; height: number; quality: string; file_type: string }[];
};

export type StockVideo = { src: string; poster: string; width: number; height: number; credit: string; creditUrl: string; pageUrl: string };

const QUERIES: Record<"hair_salon" | "barber_shop", string> = {
  hair_salon: "hair stylist salon",
  barber_shop: "barber haircut",
};

export async function findHeroVideo(category: "hair_salon" | "barber_shop"): Promise<StockVideo | undefined> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return undefined;
  const params = new URLSearchParams({ query: QUERIES[category], orientation: "landscape", size: "medium", per_page: "15" });
  const res = await fetch(`https://api.pexels.com/videos/search?${params}`, {
    headers: { Authorization: key },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Pexels returned HTTP ${res.status}.`);
  const { videos = [] } = (await res.json()) as { videos?: PexelsVideo[] };
  // Brief H01: an 8–15 second loop; HD but not 4K to stay inside the weight budget.
  const pick = videos
    .filter((v) => v.duration >= 8 && v.duration <= 20)
    .map((v) => ({ v, file: v.video_files.filter((f) => f.file_type === "video/mp4" && f.width >= 1280 && f.width <= 1920).sort((a, b) => a.width - b.width)[0] }))
    .find((x) => x.file);
  if (!pick) return undefined;
  return {
    src: pick.file.link,
    poster: pick.v.image,
    width: pick.file.width,
    height: pick.file.height,
    credit: `Video by ${pick.v.user.name} on Pexels`,
    creditUrl: pick.v.user.url,
    pageUrl: pick.v.url,
  };
}

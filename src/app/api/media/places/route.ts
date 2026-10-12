import { NextResponse, type NextRequest } from "next/server";

/**
 * Serves a Google Places photo without exposing the API key and without
 * storing the image (Places policy forbids caching photo bytes). We ask Google
 * for a short-lived photo URI and redirect the browser to it.
 */
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name") ?? "";
  const width = Math.min(2400, Math.max(100, Number(req.nextUrl.searchParams.get("w")) || 1600));
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return new NextResponse("Places API is not configured.", { status: 503 });
  if (!/^places\/[\w-]+\/photos\/[\w-]+$/.test(name)) return new NextResponse("Bad photo name.", { status: 400 });

  const res = await fetch(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=${width}&skipHttpRedirect=true`, {
    headers: { "X-Goog-Api-Key": key },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) return new NextResponse("Photo unavailable.", { status: 404 });
  const { photoUri } = (await res.json()) as { photoUri?: string };
  if (!photoUri?.startsWith("https://")) return new NextResponse("Photo unavailable.", { status: 404 });
  return NextResponse.redirect(photoUri, { status: 302, headers: { "Cache-Control": "private, max-age=3600" } });
}

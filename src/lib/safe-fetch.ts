import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Fetches a user-supplied URL without letting it reach private networks.
 * Every redirect hop is re-validated. Pages are treated as data only.
 *
 * Limitation: DNS is resolved once before connecting, so a host that changes
 * its answer between our check and the connection (DNS rebinding) is not
 * fully excluded. The app sits behind auth, which keeps this exposure small.
 */

const MAX_BYTES = 3_000_000;
const TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 4;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

export class FetchBlocked extends Error {}

function isPrivateV4(ip: string) {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateV6(ip: string) {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb")) return true;
  const mapped = v.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? isPrivateV4(mapped[1]) : false;
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new FetchBlocked("Not a valid URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new FetchBlocked("Only http(s) links are accepted.");
  if (url.username || url.password) throw new FetchBlocked("Links with credentials are not accepted.");
  if (url.port && url.port !== "443" && url.port !== "80") throw new FetchBlocked("Non-standard ports are not accepted.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new FetchBlocked("Private hosts are not accepted.");

  const addresses = isIP(host) ? [{ address: host, family: isIP(host) }] : await lookup(host, { all: true }).catch(() => []);
  if (addresses.length === 0) throw new FetchBlocked(`Could not resolve ${host}.`);
  for (const a of addresses) {
    if (a.family === 4 ? isPrivateV4(a.address) : isPrivateV6(a.address)) {
      throw new FetchBlocked("That link points to a private network address.");
    }
  }
  return url;
}

export type SafeResponse = { url: string; status: number; contentType: string; body: string };

/** GET a public page as text, following redirects safely. */
export async function safeFetchText(raw: string, accept = "text/html,application/xhtml+xml"): Promise<SafeResponse> {
  let current = await assertPublicUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(current, {
      redirect: "manual",
      headers: { "user-agent": UA, accept, "accept-language": "en-US,en;q=0.8" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new FetchBlocked("Redirect without a destination.");
      current = await assertPublicUrl(new URL(loc, current).toString());
      continue;
    }
    const body = await readLimited(res);
    return { url: current.toString(), status: res.status, contentType: res.headers.get("content-type") ?? "", body };
  }
  throw new FetchBlocked("Too many redirects.");
}

/** Follow redirects without downloading bodies; used to expand maps.app.goo.gl short links. */
export async function resolveRedirects(raw: string): Promise<string> {
  let current = await assertPublicUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: { "user-agent": UA },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    await res.body?.cancel();
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      current = await assertPublicUrl(new URL(loc, current).toString());
      continue;
    }
    return current.toString();
  }
  return current.toString();
}

async function readLimited(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new FetchBlocked("Page is too large to read.");
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

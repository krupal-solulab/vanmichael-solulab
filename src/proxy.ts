import { NextResponse, type NextRequest } from "next/server";

/**
 * 1. Private by default: HTTP basic auth over the whole app when GENERATOR_PASSWORD is set
 *    (brief T01: prefer access-controlled demo links).
 * 2. Exposes the pathname to server components so the preview 404 can be branded per job.
 */
export function proxy(request: NextRequest) {
  const password = process.env.GENERATOR_PASSWORD;
  if (password) {
    const user = process.env.GENERATOR_USER || "solulab";
    const header = request.headers.get("authorization") ?? "";
    const [scheme, encoded] = header.split(" ");
    const [u, p] = scheme === "Basic" && encoded ? atob(encoded).split(":") : [];
    if (u !== user || p !== password) {
      return new NextResponse("Authentication required.", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Site generator", charset="UTF-8"' },
      });
    }
  }
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import type { Job, TemplateFamily } from "@/lib/types";
import { buildContent, type RouteId } from "./content";
import { AtelierSite } from "./atelier";
import { EditorialSite } from "./editorial";
import { SchemaGraph } from "./shared/seo";

export const ROUTE_IDS: RouteId[] = ["home", "services", "team", "gallery", "about", "visit", "policies", "privacy"];

export function resolveRoute(path: string[] | undefined): RouteId | null {
  if (!path || path.length === 0) return "home";
  if (path.length > 1) return null;
  return ROUTE_IDS.includes(path[0] as RouteId) && path[0] !== "home" ? (path[0] as RouteId) : null;
}

export function SiteRenderer({ job, family, route }: { job: Job; family: TemplateFamily; route: RouteId | "not-found" }) {
  const c = buildContent(job.record!, { jobId: job.id, family });
  const Site = family === "atelier" ? AtelierSite : EditorialSite;
  return (
    <>
      {route === "not-found" ? <title>{`Page not found | ${c.name}`}</title> : <SchemaGraph c={c} r={job.record!} route={route} />}
      <Site c={c} route={route} />
    </>
  );
}

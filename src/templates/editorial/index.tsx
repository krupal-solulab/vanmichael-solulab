import type { RouteId, SiteContent } from "../content";
import { EditorialLayout } from "./Layout";
import { About, GalleryPage, Home, NotFound, Policies, Privacy, Services, Team, Visit } from "./pages";

const PAGES: Record<RouteId, (p: { c: SiteContent }) => React.ReactNode> = {
  home: Home,
  services: Services,
  team: Team,
  gallery: GalleryPage,
  about: About,
  visit: Visit,
  policies: Policies,
  privacy: Privacy,
};

export function EditorialSite({ c, route }: { c: SiteContent; route: RouteId | "not-found" }) {
  const Page = route === "not-found" ? NotFound : PAGES[route];
  return (
    <EditorialLayout c={c} route={route}>
      <Page c={c} />
    </EditorialLayout>
  );
}

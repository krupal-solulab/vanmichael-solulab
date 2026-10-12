import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/store";
import { TemplateFamily } from "@/lib/types";
import { buildContent } from "@/templates/content";
import { pageDescription, pageTitle } from "@/templates/shared/seo";
import { SiteRenderer, resolveRoute } from "@/templates/render";

type Props = PageProps<"/p/[job]/[family]/[[...path]]">;

async function load(props: Props) {
  const { job: jobId, family, path } = await props.params;
  const fam = TemplateFamily.safeParse(family);
  if (!fam.success) return null;
  const job = await getJob(jobId);
  if (!job?.record || !job.templates.includes(fam.data)) return null;
  const route = resolveRoute(path);
  const c = buildContent(job.record, { jobId: job.id, family: fam.data });
  // A route only exists if there is verified content for it (no empty pages, brief §11).
  if (!route || !c.has(route)) return { job, family: fam.data, route: null, c };
  return { job, family: fam.data, route, c };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await load(props);
  if (!data?.route) return { title: "Not found", robots: { index: false, follow: false } };
  const { c, route } = data;
  return {
    title: { absolute: pageTitle(c, route) },
    description: pageDescription(c, route),
    // Previews are private; canonical/OG URLs are generated only from a production domain at publish.
    robots: { index: false, follow: false, nocache: true },
    openGraph: { title: pageTitle(c, route), description: pageDescription(c, route), type: "website" },
    icons: {
      icon: `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${data.family === "editorial" ? 16 : 0}" fill="${data.family === "atelier" ? "#141312" : "#a3461f"}"/><text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif" font-size="34" fill="#f3ede3">${c.name.trim()[0]}</text></svg>`,
      )}`,
    },
  };
}

export default async function PreviewPage(props: Props) {
  const data = await load(props);
  if (!data?.route) notFound();
  return <SiteRenderer job={data.job} family={data.family} route={data.route} />;
}

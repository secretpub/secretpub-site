import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";
import { renderPage } from "@/lib/content/render";
import { homeJsonLd, JsonLd } from "@/lib/content/jsonld";

// ISR: statically rendered, refreshed at most every 5 min, and instantly on
// CMS save via on-demand revalidation (/api/revalidate).
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      title: c.meta.title,
      description: c.meta.description,
      images: [c.meta.ogImage],
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: c.meta.title,
      description: c.meta.description,
    },
  };
}

export default async function Home() {
  const content = await getContent();
  const html = renderPage("index", content);
  const heroImg = content.hero?.slides?.[0]?.image;
  return (
    <>
      <JsonLd data={homeJsonLd(content)} />
      {/* Preload de la VRAIE image hero (résolue depuis le contenu) pour le LCP */}
      {heroImg && (
        // eslint-disable-next-line @next/next/no-head-element
        <link rel="preload" as="image" href={heroImg} fetchPriority="high" />
      )}
      <a href="#main" className="skip-link">Aller au contenu</a>
      <div id="site-root" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

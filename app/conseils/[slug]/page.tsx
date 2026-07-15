import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content/store";
import { renderPage } from "@/lib/content/render";
import { articleJsonLd, JsonLd } from "@/lib/content/jsonld";
import conseils from "@/content/conseils.json";
import type { SiteContent } from "@/lib/content/schema";

export const revalidate = 3600;
// N'accepte QUE les slugs d'articles connus ; tout autre chemin -> 404.
export const dynamicParams = false;

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return conseils.articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = conseils.articles.find((x) => x.slug === slug);
  if (!a) return {};
  return {
    title: a.metaTitle,
    description: a.metaDescription,
    alternates: { canonical: `/conseils/${slug}` },
    openGraph: {
      type: "article",
      title: a.metaTitle,
      description: a.metaDescription,
      images: [
        { url: "/assets/og-cover.jpg", width: 1200, height: 630, alt: a.title },
      ],
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: a.metaTitle,
      description: a.metaDescription,
      images: ["/assets/og-cover.jpg"],
    },
  };
}

export default async function ConseilArticle({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = conseils.articles.find((x) => x.slug === slug);
  if (!article) notFound();
  const content = await getContent();
  const html = renderPage("conseils", {
    ...content,
    article,
  } as unknown as SiteContent);
  return (
    <>
      <JsonLd data={articleJsonLd(content, article)} />
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <div id="site-root" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

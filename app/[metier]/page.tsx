import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent, getDefaultContent } from "@/lib/content/store";
import { renderPage } from "@/lib/content/render";
import { metierJsonLd, JsonLd } from "@/lib/content/jsonld";
import type { SiteContent } from "@/lib/content/schema";

export const revalidate = 300;
// N'accepte QUE les slugs métier connus ; tout autre chemin -> 404.
export const dynamicParams = false;

type Params = { metier: string };

export function generateStaticParams(): Params[] {
  const pages = getDefaultContent().metierPages || {};
  return Object.keys(pages).map((metier) => ({ metier }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { metier } = await params;
  const content = await getContent();
  const page = content.metierPages?.[metier];
  if (!page) return {};
  return {
    title: page.meta.title,
    description: page.meta.description,
    alternates: { canonical: `/${metier}` },
    openGraph: {
      type: "website",
      title: page.meta.title,
      description: page.meta.description,
      images: [
        {
          url: "/assets/og-cover.jpg",
          width: 1200,
          height: 630,
          alt: `SecretPub ${page.navLabel} à Valence`,
        },
      ],
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: page.meta.title,
      description: page.meta.description,
      images: ["/assets/og-cover.jpg"],
    },
  };
}

export default async function MetierPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { metier } = await params;
  const content = await getContent();
  const page = content.metierPages?.[metier];
  if (!page) notFound();
  const html = renderPage("metier", {
    ...content,
    page,
  } as unknown as SiteContent);
  return (
    <>
      <JsonLd data={metierJsonLd(content, page)} />
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <div id="site-root" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

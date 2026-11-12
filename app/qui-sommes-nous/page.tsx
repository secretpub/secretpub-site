import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";
import { renderPage } from "@/lib/content/render";
import { aboutJsonLd, JsonLd } from "@/lib/content/jsonld";
import type { SiteContent } from "@/lib/content/schema";

// Page « Qui sommes-nous » (12/11/2026) : notre histoire, nos ateliers, notre équipe.
export const revalidate = 300;

const PATH = "/qui-sommes-nous";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  const title = c.about?.meta?.title || "Qui sommes-nous | SecretPub";
  const description = c.about?.meta?.description || c.meta.description;
  return {
    title,
    description,
    alternates: { canonical: PATH },
    openGraph: {
      type: "website",
      url: PATH,
      title,
      description,
      images: [
        { url: c.meta.ogImage, width: 1200, height: 630, alt: "SecretPub à Valence" },
      ],
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [c.meta.ogImage],
    },
  };
}

export default async function QuiSommesNous() {
  const content = await getContent();
  // Quelques réalisations déjà publiques sur l'accueil (photo principale obligatoire).
  const items = (content.realisations?.items || []) as unknown as Array<{
    mainPhoto?: { src?: string };
  }>;
  const aboutRealisations = items.filter((it) => it?.mainPhoto?.src).slice(0, 6);
  const html = renderPage("qui-sommes-nous", {
    ...content,
    aboutRealisations,
  } as unknown as SiteContent);
  return (
    <>
      <JsonLd data={aboutJsonLd(content)} />
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <div id="site-root" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";
import { renderPage } from "@/lib/content/render";
import { conseilsIndexJsonLd, JsonLd } from "@/lib/content/jsonld";
import conseils from "@/content/conseils.json";
import type { SiteContent } from "@/lib/content/schema";

export const revalidate = 3600;

const TITLE =
  "Conseils enseigne, signalétique, print et textile | SecretPub";
const DESC =
  "Prix d'une enseigne, autorisations en mairie, choix du marquage textile, déploiement de réseau : les guides pratiques de SecretPub, enseigniste à Valence.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/conseils" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESC,
    images: [
      { url: "/assets/og-cover.jpg", width: 1200, height: 630, alt: "Conseils SecretPub" },
    ],
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ["/assets/og-cover.jpg"],
  },
};

export default async function ConseilsIndex() {
  const content = await getContent();
  const articles = conseils.articles;
  const html = renderPage("conseils-index", {
    ...content,
    articles,
  } as unknown as SiteContent);
  return (
    <>
      <JsonLd data={conseilsIndexJsonLd(content, articles)} />
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <div id="site-root" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

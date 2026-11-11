import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";
import { renderPage } from "@/lib/content/render";
import { conseilsIndexJsonLd, JsonLd } from "@/lib/content/jsonld";
import { remplacerAnnees } from "@/lib/content/annee";
import conseils from "@/content/conseils.json";
import type { SiteContent } from "@/lib/content/schema";

export const revalidate = 3600;

// Repères d'année remplacés au rendu (lib/content/annee.ts, content/mots-cles-seo.json).
const TITLE = "Conseils enseigne, signalétique et print {annee} | SecretPub";
const DESC =
  "Prix d'une enseigne en {annee}, tendances {annee_cible}, BAT, panneaux, PLV, textile : les guides pratiques de SecretPub, atelier à Valence.";

export async function generateMetadata(): Promise<Metadata> {
  const title = remplacerAnnees(TITLE);
  const description = remplacerAnnees(DESC);
  return {
    title,
    description,
    alternates: { canonical: "/conseils" },
    openGraph: {
      type: "website",
      title,
      description,
      images: [
        { url: "/assets/og-cover.jpg", width: 1200, height: 630, alt: "Conseils SecretPub" },
      ],
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/og-cover.jpg"],
    },
  };
}

const SECTIONS = [
  {
    key: "boutique",
    title: "Bien choisir et commander en {annee}",
    intro: "Enseigne, panneaux, PLV, imprimés, textile : comment commander juste, et ce que SecretPub met sur la table en {annee}.",
  },
  {
    key: "agence",
    title: "Notre agence",
    intro: "Qui nous sommes, notre savoir-faire et ce qu'on change pour votre entreprise.",
  },
  {
    key: "secteur",
    title: "Par secteur d'activité",
    intro: "Nos réponses aux besoins précis de votre métier, du commerce à la franchise.",
  },
  {
    key: "guide",
    title: "Nos guides techniques",
    intro: "Prix, autorisations, choix des supports : les conseils concrets, sans langue de bois.",
  },
];

export default async function ConseilsIndex() {
  const content = await getContent();
  const articles = remplacerAnnees(conseils.articles);
  const sections = remplacerAnnees(SECTIONS).map((s) => ({
    title: s.title,
    intro: s.intro,
    articles: articles.filter((a) => a.category === s.key),
  })).filter((s) => s.articles.length);
  const html = renderPage("conseils-index", {
    ...content,
    sections,
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

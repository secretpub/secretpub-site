import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";
import { renderPage } from "@/lib/content/render";

export const revalidate = 3600;

const TITLE = "Demande reçue | SecretPub";
const DESC =
  "Votre demande de devis a bien été envoyée à SecretPub. On vous recontacte sous 24 heures ouvrées.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/demande-recue" },
  // Page de confirmation : conversion Google Ads, aucun intérêt SEO,
  // on la garde hors de l'index (mais crawlable pour le suivi).
  robots: { index: false, follow: true },
};

export default async function DemandeRecue() {
  const content = await getContent();
  const html = renderPage("demande-recue", content);
  return <div id="site-root" dangerouslySetInnerHTML={{ __html: html }} />;
}

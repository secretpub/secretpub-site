import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";
import { renderPage } from "@/lib/content/render";

export const revalidate = 300;

const TITLE =
  "Communication multi-site pour franchises et réseaux : signalétique, print, textile | SecretPub";
const DESC =
  "Une plateforme de commande à la charte de votre réseau : chaque point de vente commande sa signalétique, son print et son textile, le siège garde le contrôle. Tarifs groupés, un seul partenaire.";

// This page is intentionally hidden for now (README: to re-activate later).
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  robots: { index: false, follow: false },
};

export default async function ReseauxFranchises() {
  const content = await getContent();
  const html = renderPage("reseaux-franchises", content);
  return <div id="site-root" dangerouslySetInnerHTML={{ __html: html }} />;
}

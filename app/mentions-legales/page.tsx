import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";
import { renderPage } from "@/lib/content/render";

export const revalidate = 3600;

const TITLE = "Mentions légales | SecretPub";
const DESC =
  "Mentions légales et politique de confidentialité de SecretPub (SARL NOSTILE FACTORY) — signalétique, print et textile à Valence.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

export default async function MentionsLegales() {
  const content = await getContent();
  const html = renderPage("mentions-legales", content);
  return <div id="site-root" dangerouslySetInnerHTML={{ __html: html }} />;
}

import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";
import { renderPage } from "@/lib/content/render";
import { serviceJsonLd, JsonLd } from "@/lib/content/jsonld";

export const revalidate = 300;

const TITLE =
  "Votre espace de commande SecretPub : la commande de vos supports, enfin simple";
const DESC =
  "Votre espace de commande SecretPub : un espace à votre charte qui réunit signalétique, print et textile. Vos produits validés, vos tarifs, votre historique. Version point de vente et version réseau.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/espace-de-commande" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESC,
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export default async function EspaceDeCommande() {
  const content = await getContent();
  const html = renderPage("espace-de-commande", content);
  return (
    <>
      <JsonLd
        data={serviceJsonLd(content, {
          name: "Votre espace de commande SecretPub",
          serviceType:
            "Espace de commande de communication physique (signalétique, print, textile)",
          path: "/espace-de-commande",
          crumbName: "Votre espace de commande",
        })}
      />
      <div id="site-root" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

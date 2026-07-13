import type { Metadata } from "next";
import CatalogueSoon from "@/components/CatalogueSoon";

export const metadata: Metadata = {
  title: "Catalogue en ligne, bientôt disponible | SecretPub",
  description:
    "Notre catalogue en ligne (print, signalétique, textile, goodies, packaging) arrive. Laissez votre email pour être prévenu de l'ouverture.",
  alternates: { canonical: "/catalogue" },
  // Page temporaire : on ne l'indexe pas.
  robots: { index: false, follow: true },
};

export default function CataloguePage() {
  return <CatalogueSoon />;
}

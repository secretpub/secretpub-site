import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getContent } from "@/lib/content/store";
import { buildMobileCss } from "@/lib/content/mobile";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://secretpub.fr";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "SecretPub Valence : signalétique, print et textile pour les professionnels",
    template: "%s",
  },
  icons: {
    icon: [{ url: "/assets/logo-mark.png", type: "image/png" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d0c",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getContent();
  const mobileCss = buildMobileCss(content.mobile);
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/site.css" />
        {/* Réglages responsive mobile poussés depuis l'admin (prend le dessus sur site.css) */}
        {mobileCss && (
          <style
            id="mobile-vars"
            dangerouslySetInnerHTML={{ __html: mobileCss }}
          />
        )}
        {/* Preconnexion au stockage Supabase (images de la galerie / hero) */}
        {SUPABASE_URL && (
          <link rel="preconnect" href={SUPABASE_URL} crossOrigin="" />
        )}
      </head>
      <body>
        {children}
        {/* The vendored, hand-tuned interactions run on the server-rendered DOM. */}
        <Script src="/site.js" strategy="afterInteractive" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

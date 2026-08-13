import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { CookieBanner } from "@/components/CookieBanner";
import { getContent } from "@/lib/content/store";
import { buildMobileCss } from "@/lib/content/mobile";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://secretpub.fr";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Google tag (gtag.js) : mesure Google Ads / Analytics. La conversion "demande
// de devis" est suivie via la visite de /demande-recue. Surchargeable par env.
const GOOGLE_TAG_ID =
  process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || "G-K9RJFD3GYE";
// Google Tag Manager (conteneur). Snippet posé le plus haut possible dans le
// <head> + noscript juste après <body>. Surchargeable par env NEXT_PUBLIC_GTM_ID.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-5NJBFL85";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "SecretPub Valence : signalétique, print et textile pour les professionnels",
    template: "%s",
  },
  applicationName: "SecretPub",
  authors: [{ name: "SecretPub", url: SITE_URL }],
  creator: "SecretPub",
  publisher: "SecretPub",
  category: "business",
  keywords: [
    "SecretPub",
    "enseigne Valence",
    "signalétique Valence",
    "imprimerie Valence",
    "impression grand format",
    "textile personnalisé",
    "objets publicitaires",
    "goodies",
    "packaging",
    "PLV",
    "habillage véhicule",
    "covering",
    "communication physique",
    "agence de communication Valence",
    "Drôme",
  ],
  formatDetection: { telephone: true, address: true, email: true },
  // Favicons servis par convention de fichier Next : app/icon.png + app/apple-icon.png.
  // max-image-preview:large + max-snippet:-1 => vignettes riches en SERP et
  // extraits complets réutilisables par les moteurs génératifs (GEO).
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Codes de vérification (renseignés via variables d'env Vercel, sans redeploy
  // de code : NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION / NEXT_PUBLIC_BING_SITE_VERIFICATION).
  verification: {
    // Token public de Google Search Console (visible dans le HTML de toute façon).
    // Codé en dur pour être garanti au déploiement ; surchargeable par variable d'env.
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "KsQLO3xT8ntK93JqoFM1-NWrcxROUgVjOky9f2tZGKI",
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {},
  },
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
        {/* Consent Mode par défaut (AVANT GTM/GA) : ad + analytics refusés tant
            que le visiteur n'a pas accepté les cookies (bandeau => 'sp-consent'). */}
        {GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}var spGranted=false;try{spGranted=localStorage.getItem('sp-consent')==='granted';}catch(e){}gtag('consent','default',{ad_storage:spGranted?'granted':'denied',analytics_storage:spGranted?'granted':'denied',ad_user_data:spGranted?'granted':'denied',ad_personalization:spGranted?'granted':'denied',wait_for_update:500});`,
            }}
          />
        )}
        {/* Google Tag Manager — le plus haut possible dans le <head>. */}
        {GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
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
        {/* Google Tag Manager (noscript) — juste après l'ouverture de <body>. */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
        {/* The vendored, hand-tuned interactions run on the server-rendered DOM. */}
        <Script src="/site.js" strategy="afterInteractive" />
        {/* Google tag (gtag.js) — suivi Google Ads (conversion sur /demande-recue). */}
        {GOOGLE_TAG_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
var spGranted=false;try{spGranted=localStorage.getItem('sp-consent')==='granted';}catch(e){}
gtag('consent','default',{ad_storage:spGranted?'granted':'denied',analytics_storage:spGranted?'granted':'denied',ad_user_data:spGranted?'granted':'denied',ad_personalization:spGranted?'granted':'denied',wait_for_update:500});
gtag('config', '${GOOGLE_TAG_ID}');`}
            </Script>
          </>
        )}
        <SiteAnalytics />
        <CookieBanner />
      </body>
    </html>
  );
}

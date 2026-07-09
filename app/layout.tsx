import type { Metadata, Viewport } from "next";
import Script from "next/script";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://secretpub.fr";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {/* Preload the hero image + the design stylesheet for a fast first paint */}
        <link
          rel="preload"
          as="image"
          href="/assets/hero-showroom-opt.jpg"
          fetchPriority="high"
        />
      </head>
      <body>
        {children}
        {/* The vendored, hand-tuned interactions run on the server-rendered DOM. */}
        <Script src="/site.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

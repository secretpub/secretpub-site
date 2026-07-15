import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The public marketing site is server-rendered (SSG/ISR) for max speed + SEO.
  // Content comes from Supabase at request time and revalidates on CMS save.
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Autorise l'upload d'images (via server action) plus lourdes que la limite
  // par défaut de 1 Mo. Les images sont de toute façon redimensionnées côté client.
  experimental: {
    serverActions: { bodySizeLimit: "15mb" },
  },
  // Autorise la prévisualisation en dev depuis le réseau local (téléphone,
  // autre poste) sans l'avertissement cross-origin. Sans effet en production.
  allowedDevOrigins: ["192.168.1.108"],
  // Ship the Mustache templates into the serverless bundle so fs.readFileSync
  // finds them at runtime on Vercel.
  outputFileTracingIncludes: {
    "/": ["./templates/**/*"],
    "/espace-de-commande": ["./templates/**/*"],
    "/reseaux-franchises": ["./templates/**/*"],
    "/mentions-legales": ["./templates/**/*"],
    "/conseils": ["./templates/**/*"],
    "/conseils/[slug]": ["./templates/**/*"],
  },
  images: {
    // Supabase Storage public bucket for CMS-uploaded images.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
    ];
    return [
      // En-têtes de sécurité sur toutes les pages.
      { source: "/(.*)", headers: security },
      {
        // Long-cache the immutable design assets (images live in /public/assets).
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // CSS/JS de design : cache raisonnable + revalidation en arrière-plan.
        source: "/:file(site\\.css|site\\.js)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

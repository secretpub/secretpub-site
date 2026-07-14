import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://secretpub.fr";

// Zones jamais indexables : back-office, page réseaux (noindex) et API.
const DISALLOW = ["/admin", "/reseaux-franchises", "/api/"];

// Crawlers des moteurs génératifs / assistants IA. On les accueille EXPLICITEMENT
// (même périmètre que Google) pour que SecretPub soit lisible et citable par
// ChatGPT, Claude, Perplexity, Google AI, Copilot, etc. — c'est le socle du GEO.
const AI_BOTS = [
  "GPTBot", // OpenAI (entraînement + ChatGPT browse)
  "OAI-SearchBot", // ChatGPT Search
  "ChatGPT-User", // actions déclenchées par un utilisateur ChatGPT
  "ClaudeBot", // Anthropic (Claude)
  "Claude-Web",
  "anthropic-ai",
  "Claude-SearchBot",
  "PerplexityBot", // Perplexity
  "Perplexity-User",
  "Google-Extended", // Google Gemini / AI Overviews (opt-in)
  "Applebot", // Siri / Spotlight
  "Applebot-Extended", // Apple Intelligence
  "Amazonbot",
  "cohere-ai",
  "CCBot", // Common Crawl (source de nombreux LLM)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}

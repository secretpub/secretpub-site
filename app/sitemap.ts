import type { MetadataRoute } from "next";
import { getDefaultContent } from "@/lib/content/store";
import conseils from "@/content/conseils.json";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://secretpub.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const metier = Object.keys(getDefaultContent().metierPages || {}).map(
    (slug) => ({
      url: `${SITE}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    }),
  );
  const articles = conseils.articles.map((a) => ({
    url: `${SITE}/conseils/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...metier,
    {
      url: `${SITE}/conseils`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...articles,
    {
      url: `${SITE}/espace-de-commande`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE}/mentions-legales`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}

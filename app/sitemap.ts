import type { MetadataRoute } from "next";
import { getContent, getDefaultContent } from "@/lib/content/store";
import conseils from "@/content/conseils.json";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://secretpub.fr";
const abs = (u: string) =>
  !u ? SITE : u.startsWith("http") ? u : `${SITE}${u.startsWith("/") ? "" : "/"}${u}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const content = await getContent();

  // Toutes les photos de réalisations (galerie de l'accueil) -> sitemap images,
  // rattachées à la page d'accueil : aide Google Images à les indexer sous
  // "SecretPub". Dédupliqué.
  const seen = new Set<string>();
  const realImages: string[] = [];
  for (const it of (content.realisations?.items || []) as any[]) {
    for (const src of [it?.mainPhoto?.src, ...((it?.extraPhotos || []).map((p: any) => p?.src))]) {
      if (src) {
        const u = abs(src);
        if (!seen.has(u)) {
          seen.add(u);
          realImages.push(u);
        }
      }
    }
  }

  const metier = Object.keys(getDefaultContent().metierPages || {}).map(
    (slug) => ({
      url: `${SITE}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    }),
  );

  const articles = conseils.articles.map((a) => {
    const cover = (a as { cover?: string }).cover;
    return {
      url: `${SITE}/conseils/${a.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(cover ? { images: [abs(cover)] } : {}),
    };
  });

  return [
    {
      url: SITE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      ...(realImages.length ? { images: realImages } : {}),
    },
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

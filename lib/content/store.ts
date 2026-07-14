import "server-only";
import defaultContent from "@/content/default.json";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { SiteContent } from "./schema";

/** Recursively merge `override` onto `base`. Arrays are replaced wholesale
 *  (so the CMS can add/remove list items). Plain objects merge key by key. */
function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base) || Array.isArray(override)) return override as T;
  if (typeof base === "object" && typeof override === "object") {
    const out: Record<string, unknown> = {
      ...(base as Record<string, unknown>),
    };
    for (const key of Object.keys(override as Record<string, unknown>)) {
      const b = (base as Record<string, unknown>)[key];
      const o = (override as Record<string, unknown>)[key];
      out[key] =
        b && typeof b === "object" && o && typeof o === "object"
          ? deepMerge(b, o)
          : o;
    }
    return out as T;
  }
  return override as T;
}

const DEFAULT = defaultContent as unknown as SiteContent;

/** Réécrit une URL Supabase Storage (object) vers l'endpoint de transformation
 *  d'image (resize + qualité) → images bien plus légères (uploads pleine résolution
 *  qui ramaient à s'afficher). N'affecte que les URLs image Supabase. */
const IMG_EXT = /\.(webp|jpe?g|png|avif)(\?|$)/i;
function optimizeImageUrl(url: string): string {
  const marker = "/storage/v1/object/public/";
  if (!url.includes(marker) || !IMG_EXT.test(url) || url.includes("/render/image/"))
    return url;
  const rendered = url.replace(marker, "/storage/v1/render/image/public/");
  return rendered + (rendered.includes("?") ? "&" : "?") + "width=1200&quality=76";
}
function optimizeImages<T>(node: T): T {
  if (typeof node === "string") return optimizeImageUrl(node) as unknown as T;
  if (Array.isArray(node)) return node.map((n) => optimizeImages(n)) as unknown as T;
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(node as Record<string, unknown>))
      out[k] = optimizeImages((node as Record<string, unknown>)[k]);
    return out as T;
  }
  return node;
}

export function getDefaultContent(): SiteContent {
  return DEFAULT;
}

/**
 * The live content: default JSON with the Supabase override deep-merged on top.
 * Falls back to pure default when Supabase is unconfigured or the row is empty.
 * Never throws — the public site must always render.
 */
async function getMergedContent(): Promise<SiteContent> {
  const supa = getAdminSupabase();
  if (!supa) return DEFAULT;
  try {
    const { data, error } = await supa
      .from("site_content")
      .select("data")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data?.data) return DEFAULT;
    return deepMerge(DEFAULT, data.data);
  } catch {
    return DEFAULT;
  }
}

/** Contenu public : SEULES les images de réalisations sont resizées (elles étaient
 *  lourdes et ramaient). Le hero et le reste gardent leur résolution d'origine
 *  (déjà légers → les transformer les dégradait). */
export async function getContent(): Promise<SiteContent> {
  const c = await getMergedContent();
  const anyC = c as unknown as Record<string, unknown>;
  if (anyC && anyC.realisations) {
    return { ...(c as object), realisations: optimizeImages(anyC.realisations) } as SiteContent;
  }
  return c;
}

/** Contenu brut (admin) : URLs d'origine, pour ne jamais sauvegarder des URLs
 *  déjà transformées dans la base. */
export async function getRawContent(): Promise<SiteContent> {
  return getMergedContent();
}

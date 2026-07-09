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

export function getDefaultContent(): SiteContent {
  return DEFAULT;
}

/**
 * The live content: default JSON with the Supabase override deep-merged on top.
 * Falls back to pure default when Supabase is unconfigured or the row is empty.
 * Never throws — the public site must always render.
 */
export async function getContent(): Promise<SiteContent> {
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

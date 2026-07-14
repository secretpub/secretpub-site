import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Rate-limit best-effort en mémoire (par instance) : freine les rafales de spam.
// Pour une protection robuste multi-instances, brancher Upstash Ratelimit.
const HITS = new Map<string, number[]>();
function rateLimited(ip: string, max = 6, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 5000) HITS.clear(); // garde-fou mémoire
  return arr.length > max;
}

/**
 * Lead capture for the contact form (#cform) and the réseaux waitlist (#wlForm).
 * Stores into Supabase `leads`. If Supabase is not configured yet, it still
 * returns ok so the front-end confirmation UX works (lead is logged, not lost
 * silently in a way that breaks the page).
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limit" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Accept silently to not tip them off.
  if (body.company_hp) return NextResponse.json({ ok: true });

  const type = body.type === "waitlist" ? "waitlist" : "contact";
  const email = String(body.email || "").trim();
  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ ok: false, error: "email" }, { status: 400 });
  }

  const supa = getAdminSupabase();
  if (!supa) {
    console.warn("[leads] Supabase not configured — lead not persisted:", {
      type,
      email,
    });
    return NextResponse.json({ ok: true, stored: false });
  }

  // Fichier joint (base64) : on l'upload dans le bucket public et on ne garde
  // que l'URL dans le payload (jamais le base64). Un échec fichier ne fait pas
  // échouer la demande.
  const fichier = body.fichier as
    | { name?: string; type?: string; data?: string }
    | undefined;
  if (fichier && typeof fichier.data === "string" && fichier.data.length) {
    let fileUrl: string | null = null;
    try {
      const buf = Buffer.from(fichier.data, "base64");
      const safe = (fichier.name || "fichier")
        .replace(/[^\w.\-]+/g, "_")
        .slice(-70);
      const path = `lead-files/${Date.now()}-${safe}`;
      const up = await supa.storage
        .from("site-content")
        .upload(path, buf, {
          contentType: fichier.type || "application/octet-stream",
          upsert: false,
        });
      if (!up.error) {
        fileUrl = supa.storage.from("site-content").getPublicUrl(path)
          .data.publicUrl;
      }
    } catch {
      /* on n'échoue jamais la demande pour un fichier */
    }
    body.fichier = fileUrl
      ? { name: fichier.name, type: fichier.type, url: fileUrl }
      : { name: fichier.name, note: "upload échoué" };
  }

  // Plusieurs fichiers (nouveau formulaire) : on upload chacun, on garde les URL.
  const fichiers = body.fichiers as
    | Array<{ name?: string; type?: string; data?: string }>
    | undefined;
  if (Array.isArray(fichiers) && fichiers.length) {
    const out: Array<{ name?: string; type?: string; url?: string; note?: string }> = [];
    for (const fi of fichiers.slice(0, 8)) {
      if (!fi || typeof fi.data !== "string" || !fi.data.length) continue;
      let url: string | null = null;
      try {
        const buf = Buffer.from(fi.data, "base64");
        const safe = (fi.name || "fichier").replace(/[^\w.\-]+/g, "_").slice(-70);
        const path = `lead-files/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safe}`;
        const up = await supa.storage
          .from("site-content")
          .upload(path, buf, {
            contentType: fi.type || "application/octet-stream",
            upsert: false,
          });
        if (!up.error) {
          url = supa.storage.from("site-content").getPublicUrl(path).data.publicUrl;
        }
      } catch {
        /* on n'échoue jamais la demande pour un fichier */
      }
      out.push(url ? { name: fi.name, type: fi.type, url } : { name: fi.name, note: "upload échoué" });
    }
    body.fichiers = out;
  }

  const needsRaw = body.besoin;
  const needs = Array.isArray(needsRaw)
    ? needsRaw.map(String)
    : needsRaw
      ? [String(needsRaw)]
      : null;

  const { error } = await supa.from("leads").insert({
    type,
    email,
    name: (body.nom as string) || (body.name as string) || null,
    company: (body.societe as string) || null,
    phone: (body.tel as string) || null,
    needs,
    activity: (body.activite as string) || null,
    sites: (body.sites as string) || null,
    message: (body.message as string) || null,
    source_page: (body.source_page as string) || null,
    payload: body,
  });

  if (error) {
    console.error("[leads] insert error:", error.message);
    return NextResponse.json({ ok: false, error: "store" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, stored: true });
}

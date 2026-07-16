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

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Notifie contact@secretpub.fr (LEADS_NOTIFY_EMAIL) à CHAQUE nouvelle demande,
 * quel que soit le formulaire. Envoi via Resend (RESEND_API_KEY). Si l'email n'est
 * pas configuré, on saute silencieusement (la demande reste stockée dans `leads`).
 */
async function notifyByEmail(f: {
  type: string;
  source_page: string | null;
  email: string;
  nom?: string | null;
  prenom?: string | null;
  company?: string | null;
  phone?: string | null;
  needs?: string[] | null;
  activity?: string | null;
  sites?: string | null;
  message?: string | null;
  files?: Array<{ name?: string; url?: string }>;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = "contact@secretpub.fr"; // destinataire fixe des notifications de demande
  if (!key) {
    console.warn("[leads] email non envoyé (RESEND_API_KEY manquant)");
    return;
  }
  // Expéditeur DISTINCT de contact@ : évite l'auto-envoi (contact@ -> contact@) qui tombe
  // dans le dossier "axonaut", et améliore le classement en "Prioritaire". Le domaine
  // secretpub.fr étant validé dans Resend, on peut envoyer depuis demandes@secretpub.fr.
  const from = "SecretPub Demandes <demandes@secretpub.fr>";
  const fullName = [f.prenom, f.nom].filter(Boolean).join(" ");
  const who = f.company || fullName || f.email;
  const label = f.type === "waitlist" ? "Liste d'attente" : "Demande de contact";
  const subject = `📩 ${label} — ${who}${f.source_page ? ` (${f.source_page})` : ""}`;
  const row = (k: string, v?: string | null) =>
    v ? `<tr><td style="padding:5px 14px 5px 0;color:#6b7280;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:5px 0;color:#111">${esc(v)}</td></tr>` : "";
  const files = (f.files || [])
    .filter((x) => x && x.url)
    .map((x) => `<a href="${esc(x.url)}" style="color:#159a3a">${esc(x.name || "fichier")}</a>`)
    .join(" &middot; ");
  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#111;line-height:1.5">
    <div style="font-weight:800;font-size:16px;margin:0 0 12px">${esc(label)}</div>
    <table style="border-collapse:collapse">
      ${row("Nom", fullName || null)}
      ${row("Société", f.company)}
      ${row("Email", f.email)}
      ${row("Téléphone", f.phone)}
      ${row("Besoin", (f.needs || []).join(", ") || null)}
      ${row("Activité", f.activity)}
      ${row("Établissements", f.sites)}
      ${row("Origine (formulaire)", f.source_page)}
      ${f.message ? `<tr><td style="padding:5px 14px 5px 0;color:#6b7280;vertical-align:top">Message</td><td style="padding:5px 0;white-space:pre-wrap">${esc(f.message)}</td></tr>` : ""}
      ${files ? `<tr><td style="padding:5px 14px 5px 0;color:#6b7280">Fichiers</td><td style="padding:5px 0">${files}</td></tr>` : ""}
    </table>
    <div style="margin-top:14px;color:#9ca3af;font-size:12px">Répondez directement à cet email pour recontacter le prospect.</div>
  </div>`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [to], reply_to: f.email, subject, html,
        headers: { "X-Priority": "1", Importance: "high" },
      }),
    });
    if (!r.ok) console.error("[leads] resend error", r.status, await r.text());
  } catch (e) {
    console.error("[leads] email notify failed", e);
  }
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

  // Email de notification à contact@secretpub.fr, à CHAQUE demande (tout formulaire).
  const files: Array<{ name?: string; url?: string }> = [];
  if (Array.isArray(body.fichiers)) files.push(...(body.fichiers as Array<{ name?: string; url?: string }>));
  if (body.fichier && (body.fichier as { url?: string }).url) files.push(body.fichier as { name?: string; url?: string });
  await notifyByEmail({
    type,
    source_page: (body.source_page as string) || null,
    email,
    nom: (body.nom as string) || null,
    prenom: (body.prenom as string) || null,
    company: (body.societe as string) || null,
    phone: (body.tel as string) || null,
    needs,
    activity: (body.activite as string) || null,
    sites: (body.sites as string) || null,
    message: (body.message as string) || null,
    files,
  });

  return NextResponse.json({ ok: true, stored: true });
}

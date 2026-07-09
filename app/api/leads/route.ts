import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Lead capture for the contact form (#cform) and the réseaux waitlist (#wlForm).
 * Stores into Supabase `leads`. If Supabase is not configured yet, it still
 * returns ok so the front-end confirmation UX works (lead is logged, not lost
 * silently in a way that breaks the page).
 */
export async function POST(req: NextRequest) {
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

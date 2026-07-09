"use server";
import { revalidatePath } from "next/cache";
import { getServerSupabase, isAllowedAdmin } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { SiteContent } from "@/lib/content/schema";

async function assertAdmin(): Promise<string> {
  const supa = await getServerSupabase();
  if (!supa) throw new Error("Supabase non configuré.");
  const { data } = await supa.auth.getUser();
  if (!data.user || !isAllowedAdmin(data.user.email)) {
    throw new Error("Non autorisé.");
  }
  return data.user.email as string;
}

/** Persist the full edited content object and revalidate the public pages. */
export async function saveContent(
  content: SiteContent,
): Promise<{ ok: true }> {
  const email = await assertAdmin();
  const admin = getAdminSupabase();
  if (!admin) throw new Error("Service Supabase non configuré (service_role).");
  const { error } = await admin
    .from("site_content")
    .upsert({ id: 1, data: content, updated_by: email });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/espace-de-commande");
  revalidatePath("/reseaux-franchises");
  return { ok: true };
}

/** Upload an image to the public Storage bucket, return its public URL. */
export async function uploadImage(
  formData: FormData,
): Promise<{ url: string }> {
  await assertAdmin();
  const admin = getAdminSupabase();
  if (!admin) throw new Error("Service Supabase non configuré (service_role).");
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Aucun fichier reçu.");
  const safe = file.name.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  const key = `uploads/${Date.now()}-${safe}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage
    .from("site-content")
    .upload(key, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) throw new Error(error.message);
  const { data } = admin.storage.from("site-content").getPublicUrl(key);
  return { url: data.publicUrl };
}

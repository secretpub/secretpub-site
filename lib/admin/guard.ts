import "server-only";
import { redirect } from "next/navigation";
import { getServerSupabase, isAllowedAdmin } from "@/lib/supabase/server";

/** Redirects to the login page unless a signed-in, allow-listed admin. */
export async function requireAdmin(): Promise<{ email: string }> {
  const supa = await getServerSupabase();
  if (!supa) redirect("/admin/login?e=noconfig");
  const { data } = await supa.auth.getUser();
  const email = data.user?.email;
  if (!data.user || !isAllowedAdmin(email)) redirect("/admin/login");
  return { email: email as string };
}

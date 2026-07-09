"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function AdminNav({ email }: { email: string }) {
  const path = usePathname();
  const router = useRouter();
  async function signOut() {
    const s = getBrowserSupabase();
    if (s) await s.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <nav className="adm-nav">
      <span className="adm-brand">
        Secret<b>Pub</b> · Admin
      </span>
      <div className="adm-links">
        <Link href="/admin" className={path === "/admin" ? "on" : ""}>
          Contenu
        </Link>
        <Link
          href="/admin/leads"
          className={path.startsWith("/admin/leads") ? "on" : ""}
        >
          Demandes
        </Link>
        <a href="/" target="_blank" rel="noopener">
          Voir le site ↗
        </a>
      </div>
      <div className="adm-right">
        <span className="adm-email">{email}</span>
        <button className="adm-btn ghost sm" onClick={signOut}>
          Déconnexion
        </button>
      </div>
    </nav>
  );
}

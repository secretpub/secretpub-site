"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const supa = getBrowserSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!supa) {
      setErr("Supabase n'est pas encore configuré (variables d'environnement).");
      return;
    }
    setBusy(true);
    const { error } = await supa.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr("Identifiants invalides.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="adm-login">
      <form className="card" onSubmit={onSubmit}>
        <h1>Espace d'administration</h1>
        <p>Gestion du contenu de secretpub.fr</p>
        <label htmlFor="a-email">Email</label>
        <input
          id="a-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="a-pass">Mot de passe</label>
        <input
          id="a-pass"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err && <div className="adm-err">{err}</div>}
        <button className="adm-btn primary" type="submit" disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
        {!supa && (
          <div className="adm-note">
            Ajoutez les variables Supabase (NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) puis créez
            l'utilisateur admin dans Supabase → Authentication.
          </div>
        )}
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const KEY = "sp-consent";

/**
 * Bandeau de consentement cookies (CNIL) couplé au mode consentement Google.
 * Le tag gtag est chargé avec un consentement par défaut "denied" (voir
 * app/layout.tsx) ; ce bandeau le passe à "granted" seulement si l'utilisateur
 * accepte. Choix mémorisé dans localStorage, donc affiché une seule fois.
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let v: string | null = null;
    try {
      v = localStorage.getItem(KEY);
    } catch {
      /* localStorage indisponible : on affiche quand même le choix */
    }
    if (v !== "granted" && v !== "denied") setShow(true);
  }, []);

  function choose(granted: boolean) {
    try {
      localStorage.setItem(KEY, granted ? "granted" : "denied");
    } catch {
      /* ignore */
    }
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    if (typeof w.gtag === "function") {
      const state = granted ? "granted" : "denied";
      w.gtag("consent", "update", {
        ad_storage: state,
        analytics_storage: state,
        ad_user_data: state,
        ad_personalization: state,
      });
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="spc-wrap"
      role="dialog"
      aria-label="Consentement aux cookies"
      aria-live="polite"
    >
      <style>{`
        .spc-wrap{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;margin:0 auto;max-width:880px;background:var(--white,#fff);border:1px solid var(--line,#e3e1d9);border-radius:16px;box-shadow:0 14px 44px rgba(11,13,12,.18);padding:18px 20px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;animation:spc-in .42s cubic-bezier(.16,1,.3,1);font-family:'Hanken Grotesk',system-ui,sans-serif}
        @keyframes spc-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .spc-txt{flex:1 1 320px;min-width:250px;color:var(--ink,#0b0d0c);font-size:.94rem;line-height:1.55;margin:0}
        .spc-txt a{color:var(--green-deep,#137a3e);text-decoration:underline;text-underline-offset:2px}
        .spc-emoji{font-size:1.15rem;margin-right:4px}
        .spc-btns{display:flex;gap:10px;flex:0 0 auto;flex-wrap:wrap}
        .spc-btn{cursor:pointer;border-radius:999px;padding:11px 22px;font-size:.9rem;font-weight:700;font-family:'Plus Jakarta Sans',system-ui,sans-serif;border:1.5px solid transparent;transition:transform .12s ease,background .2s ease,border-color .2s ease,color .2s ease;white-space:nowrap}
        .spc-btn:active{transform:scale(.97)}
        .spc-refuse{background:transparent;border-color:var(--line,#e3e1d9);color:var(--muted,#5d645f)}
        .spc-refuse:hover{border-color:var(--ink,#0b0d0c);color:var(--ink,#0b0d0c)}
        .spc-accept{background:var(--green,#40ab3f);color:#fff}
        .spc-accept:hover{background:var(--green-deep,#137a3e)}
        @media(max-width:640px){.spc-wrap{padding:16px;gap:12px;left:12px;right:12px;bottom:12px}.spc-btns{width:100%}.spc-btn{flex:1 1 auto;text-align:center}}
      `}</style>
      <p className="spc-txt">
        <span className="spc-emoji" aria-hidden="true">
          🍪
        </span>
        On aimerait déposer quelques cookies pour mieux comprendre les visites
        et rendre le site plus agréable. À vous de voir, on respecte votre
        choix.{" "}
        <a href="/mentions-legales#confidentialite">En savoir plus</a>.
      </p>
      <div className="spc-btns">
        <button
          type="button"
          className="spc-btn spc-refuse"
          onClick={() => choose(false)}
        >
          Refuser
        </button>
        <button
          type="button"
          className="spc-btn spc-accept"
          onClick={() => choose(true)}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}

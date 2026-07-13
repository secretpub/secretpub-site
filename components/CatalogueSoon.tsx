"use client";
import { useState } from "react";

/**
 * Page « catalogue bientôt disponible ». Remplace tous les liens catalogue du
 * site tant que le catalogue n'est pas prêt (on continue de le travailler en
 * interne). Réactivation : voir la mémoire "catalogue masqué / coming soon".
 */
export default function CatalogueSoon() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      setState("err");
      return;
    }
    setState("sending");
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "waitlist",
          email,
          societe: "Waitlist catalogue",
          source_page: "/catalogue (bientôt)",
        }),
      });
      setState(r.ok ? "ok" : "err");
    } catch {
      setState("err");
    }
  }

  return (
    <main
      style={{
        minHeight: "100svh",
        position: "relative",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        padding: "48px 22px",
        fontFamily: "var(--body)",
        color: "#fff",
        background:
          "radial-gradient(80% 120% at 50% -10%, rgba(64,200,72,0.30) 0%, rgba(46,160,58,0.10) 40%, transparent 66%), radial-gradient(60% 90% at 88% 110%, rgba(46,200,64,0.18) 0%, transparent 60%), linear-gradient(165deg, #16241c 0%, #0c1310 52%, #070a08 100%)",
      }}
    >
      {/* grain subtil */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.14, mixBlendMode: "screen", pointerEvents: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='nb'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23nb)'/%3E%3C/svg%3E\")",
          backgroundSize: "130px 130px",
        }}
      />
      {/* liseré d'accent en haut */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, zIndex: 2, background: "linear-gradient(90deg, transparent, #2ec840, #1ea83a, #2ec840, transparent)" }} />
      <div style={{ width: "100%", maxWidth: 620, textAlign: "center", position: "relative", zIndex: 1 }}>
        <a href="/" aria-label="Accueil SecretPub" style={{ display: "inline-block", marginBottom: 30 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-full.png" alt="SecretPub" style={{ height: 40, width: "auto" }} />
        </a>

        <div
          style={{
            display: "inline-block", fontFamily: "var(--display)", fontWeight: 800, fontSize: 12,
            letterSpacing: "0.16em", textTransform: "uppercase", color: "#fff", marginBottom: 18,
            padding: "7px 15px", borderRadius: 999,
            background: "linear-gradient(135deg, #2ec840, #1ea83a)",
            boxShadow: "0 10px 24px -12px rgba(30,168,58,0.85)",
          }}
        >
          Catalogue en ligne
        </div>

        <h1
          style={{
            fontFamily: "var(--display)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05,
            fontSize: "clamp(34px, 6vw, 60px)", margin: "0 0 18px",
          }}
        >
          + de 1 000 produits<br />arrivent.
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.82)", fontSize: "clamp(15px, 1.7vw, 18px)", lineHeight: 1.6,
            maxWidth: "48ch", margin: "0 auto 30px",
          }}
        >
          Notre catalogue print, signalétique, textile, goodies et packaging est en
          préparation. Laissez votre email : on vous prévient dès l’ouverture.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 30 }}>
          {["Print", "Signalétique", "Textile", "Goodies", "Packaging"].map((c) => (
            <span
              key={c}
              style={{
                padding: "6px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                fontFamily: "var(--display)", color: "rgba(255,255,255,0.85)",
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              {c}
            </span>
          ))}
        </div>

        {state === "ok" ? (
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 22px", borderRadius: 14,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(84,194,79,0.5)",
              color: "#fff", fontWeight: 600, fontSize: 16,
            }}
          >
            ✅ Merci ! On vous prévient dès l’ouverture.
          </div>
        ) : (
          <form
            onSubmit={submit}
            style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 480, margin: "0 auto" }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (state === "err") setState("idle"); }}
              placeholder="votre@email.fr"
              aria-label="Votre email"
              style={{
                flex: "1 1 220px", minWidth: 0, padding: "14px 18px", borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)",
                color: "#fff", fontSize: 15, fontFamily: "var(--body)", outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={state === "sending"}
              style={{
                flex: "0 0 auto", padding: "14px 24px", borderRadius: 999, border: "none", cursor: "pointer",
                background: "#fff", color: "#0b0d0c", fontFamily: "var(--display)", fontWeight: 700, fontSize: 15,
                boxShadow: "0 14px 34px -18px rgba(255,255,255,0.5)",
              }}
            >
              {state === "sending" ? "Envoi…" : "Me prévenir →"}
            </button>
          </form>
        )}

        {state === "err" && (
          <p style={{ color: "#ffc9bd", fontSize: 14, marginTop: 14 }}>
            Vérifiez votre email, ou écrivez-nous à contact@secretpub.fr.
          </p>
        )}

        <div style={{ marginTop: 34 }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            ← Retour à l’accueil
          </a>
        </div>
      </div>
    </main>
  );
}

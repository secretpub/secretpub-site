import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "72vh",
        display: "grid",
        placeItems: "center",
        padding: "90px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 540 }}>
        {/* Fond clair : on compose l'icône + le texte en noir (le logo-full a le
            texte blanc, donc invisible ici). */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 11,
            marginBottom: 26,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-mark.png"
            alt=""
            style={{ height: 40, width: "auto", display: "block" }}
          />
          <span
            style={{
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#111",
              lineHeight: 1,
            }}
          >
            SecretPub
          </span>
        </div>
        <h1 style={{ fontSize: "clamp(30px, 4vw, 46px)" }}>Page introuvable</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 17,
            marginTop: 14,
            maxWidth: "42ch",
            marginInline: "auto",
          }}
        >
          Cette page n&apos;existe pas ou a été déplacée. Revenez à l&apos;accueil
          ou contactez-nous, on vous répond sous 24 h.
        </p>
        <div
          style={{
            marginTop: 30,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="btn btn-primary btn-lg">
            Retour à l&apos;accueil <span className="arr">→</span>
          </Link>
          <a href="tel:+33983809312" className="btn btn-ghost-dark btn-lg">
            09 83 80 93 12
          </a>
        </div>
      </div>
    </main>
  );
}

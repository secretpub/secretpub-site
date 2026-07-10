"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="adm-main">
      <h1 className="adm-h1">Une erreur est survenue</h1>
      <p className="adm-sub">
        {error?.message
          ? error.message
          : "Quelque chose n'a pas fonctionné. Réessaie — tes modifications non enregistrées peuvent avoir été perdues."}
      </p>
      <button className="adm-btn primary" onClick={() => reset()}>
        Réessayer
      </button>
    </main>
  );
}

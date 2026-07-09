"use client";
import { useCallback, useMemo, useState } from "react";
import type { SiteContent } from "@/lib/content/schema";
import { saveContent } from "@/app/admin/actions";
import { FieldEditor, type SetAt } from "./FieldEditor";

/* eslint-disable @typescript-eslint/no-explicit-any */

const SECTION_LABELS: Record<string, string> = {
  meta: "Général (SEO, coordonnées)",
  nav: "Navigation",
  headerCtaLabel: "Bouton en-tête",
  hero: "Carrousel d'accueil",
  trust: "Chiffres clés",
  clients: "Logos clients",
  metiersSocle: "Métiers socles (01)",
  metiersComplement: "Métiers complémentaires (02)",
  realisations: "Réalisations",
  secteurs: "Secteurs",
  pourqui: "Pour qui (cartes)",
  waitlist: "Liste d'attente réseaux",
  methode: "Méthode",
  france: "Couverture France",
  faq: "FAQ",
  contact: "Contact",
  footer: "Pied de page",
  espace: "Page : Espace de commande",
  reseaux: "Page : Réseaux (masquée)",
};
const SECTION_ORDER = Object.keys(SECTION_LABELS);

function setDeep(obj: any, path: (string | number)[], value: unknown): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const copy = obj.slice();
    copy[head as number] = setDeep(obj[head as number], rest, value);
    return copy;
  }
  return { ...obj, [head]: setDeep(obj ? obj[head] : undefined, rest, value) };
}

export default function ContentEditor({ initial }: { initial: SiteContent }) {
  const [content, setContent] = useState<any>(initial);
  const [sel, setSel] = useState<string>("meta");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{
    t: "idle" | "saving" | "ok" | "err";
    m?: string;
  }>({ t: "idle" });

  const setAt: SetAt = useCallback((path, value) => {
    setContent((c: any) => setDeep(c, path, value));
    setDirty(true);
    setStatus({ t: "idle" });
  }, []);

  const keys = useMemo(() => {
    const present = Object.keys(content);
    return [
      ...SECTION_ORDER.filter((s) => present.includes(s)),
      ...present.filter((s) => !SECTION_ORDER.includes(s)),
    ];
  }, [content]);

  async function onSave() {
    setStatus({ t: "saving" });
    try {
      await saveContent(content);
      setDirty(false);
      setStatus({ t: "ok", m: "Enregistré et publié sur le site." });
    } catch (e) {
      setStatus({ t: "err", m: e instanceof Error ? e.message : "Erreur" });
    }
  }

  const statusText =
    status.t === "saving"
      ? "Enregistrement…"
      : status.t === "ok"
        ? status.m
        : status.t === "err"
          ? "Erreur : " + status.m
          : dirty
            ? "Modifications non enregistrées"
            : "À jour";

  return (
    <div className="adm-wrap">
      <aside className="adm-side">
        <div className="adm-side-t">Sections</div>
        {keys.map((k) => (
          <button
            key={k}
            className={sel === k ? "on" : ""}
            onClick={() => setSel(k)}
          >
            {SECTION_LABELS[k] || k}
          </button>
        ))}
      </aside>
      <main className="adm-main">
        <h1 className="adm-h1">{SECTION_LABELS[sel] || sel}</h1>
        <p className="adm-sub">
          Modifiez le contenu ci-dessous. Les images se téléversent directement.
          « Enregistrer » publie sur le site en direct.
        </p>
        <FieldEditor k={sel} value={content[sel]} path={[sel]} setAt={setAt} top />
      </main>
      <div className="adm-savebar">
        <span
          className={
            "adm-status " +
            (status.t === "ok" ? "ok" : status.t === "err" ? "err" : "")
          }
        >
          {statusText}
        </span>
        <span className="sp" style={{ marginLeft: "auto" }} />
        <button
          className="adm-btn ghost"
          onClick={() => {
            setContent(initial);
            setDirty(false);
            setStatus({ t: "idle" });
          }}
          disabled={!dirty}
        >
          Annuler
        </button>
        <button
          className="adm-btn primary"
          onClick={onSave}
          disabled={status.t === "saving"}
        >
          Enregistrer et publier
        </button>
      </div>
    </div>
  );
}

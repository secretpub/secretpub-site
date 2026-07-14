"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SiteContent } from "@/lib/content/schema";
import { saveContent } from "@/app/admin/actions";
import { FieldEditor, ClientsContext, SubsContext, type SetAt } from "./FieldEditor";
import MobileEditor from "./MobileEditor";

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
  mobile: "📱 Mobile (responsive)",
};
const SECTION_ORDER = Object.keys(SECTION_LABELS);

// Libellés des pages métier (SEO) : chaque page devient une section éditable.
const METIER_PAGE_LABELS: Record<string, string> = {
  signaletique: "Page métier : Signalétique",
  imprimerie: "Page métier : Imprimerie",
  "textile-personnalise": "Page métier : Textile",
  "objets-publicitaires": "Page métier : Objets publicitaires",
  packaging: "Page métier : Packaging",
};

function getAt(obj: any, path: string[]): any {
  return path.reduce((o, k) => (o == null ? o : o[k]), obj);
}
function labelFor(key: string): string {
  if (key.startsWith("metierPages.")) {
    const slug = key.split(".")[1];
    return METIER_PAGE_LABELS[slug] || slug;
  }
  return SECTION_LABELS[key] || key;
}

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

  // Reste sur la même section après un rafraîchissement (mémorisée dans l'URL).
  useEffect(() => {
    const h = decodeURIComponent((window.location.hash || "").replace(/^#/, ""));
    if (h && getAt(content, h.split(".")) !== undefined) setSel(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      window.history.replaceState(null, "", "#" + encodeURIComponent(sel));
    } catch {
      /* noop */
    }
  }, [sel]);

  const keys = useMemo(() => {
    const present = Object.keys(content);
    const base = [
      ...SECTION_ORDER.filter((s) => present.includes(s)),
      ...present.filter(
        (s) => !SECTION_ORDER.includes(s) && s !== "metierPages",
      ),
    ];
    // Éclate metierPages en une section par page (édition simple).
    const metier = content.metierPages
      ? Object.keys(content.metierPages).map((slug) => "metierPages." + slug)
      : [];
    return [...base, ...metier];
  }, [content]);

  const selPath = useMemo(() => sel.split("."), [sel]);

  // Clients existants (Sociétés déjà saisies, projets ET photos) pour l'autocomplétion.
  const clients = useMemo(() => {
    const items = content?.realisations?.items;
    if (!Array.isArray(items)) return [] as string[];
    const set = new Set<string>();
    const add = (v: unknown) => {
      if (typeof v === "string" && v.trim()) set.add(v.trim());
    };
    items.forEach((it: any) => {
      if (!it) return;
      add(it.soc);
      if (it.mainPhoto) add(it.mainPhoto.soc);
      if (Array.isArray(it.extraPhotos)) it.extraPhotos.forEach((p: any) => p && add(p.soc));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [content]);

  // Mots-clés de sous-catégorie déjà saisis (projets + photos) : proposés partout.
  const subs = useMemo(() => {
    const items = content?.realisations?.items;
    if (!Array.isArray(items)) return [] as string[];
    const set = new Set<string>();
    const add = (v: unknown) => {
      if (typeof v === "string")
        v.split(",").forEach((x) => {
          const t = x.trim();
          if (t) set.add(t);
        });
    };
    items.forEach((it: any) => {
      if (!it) return;
      add(it.sub);
      if (it.mainPhoto) add(it.mainPhoto.sub);
      if (Array.isArray(it.extraPhotos)) it.extraPhotos.forEach((p: any) => p && add(p.sub));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
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
            {labelFor(k)}
          </button>
        ))}
      </aside>
      <main className="adm-main">
        <h1 className="adm-h1">{labelFor(sel)}</h1>
        <p className="adm-sub">
          Modifiez le contenu ci-dessous. Les images se téléversent directement.
          « Enregistrer » publie sur le site en direct.
        </p>
        <ClientsContext.Provider value={clients}>
          <SubsContext.Provider value={subs}>
            {sel === "mobile" ? (
              <MobileEditor
                value={content.mobile}
                onChange={(next) => setAt(["mobile"], next)}
              />
            ) : (
              <FieldEditor
                fieldKey={selPath[selPath.length - 1]}
                value={getAt(content, selPath)}
                path={selPath}
                setAt={setAt}
                top
              />
            )}
          </SubsContext.Provider>
        </ClientsContext.Provider>
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

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MOBILE_FIELDS, type MobileTokens } from "@/lib/content/mobile";

/* eslint-disable @next/next/no-img-element */

const GROUPS = Array.from(new Set(MOBILE_FIELDS.map((f) => f.group)));
const PAGES = [
  { label: "Accueil", href: "/" },
  { label: "Signalétique", href: "/signaletique" },
  { label: "Imprimerie", href: "/imprimerie" },
  { label: "Textile", href: "/textile-personnalise" },
  { label: "Espace de commande", href: "/espace-de-commande" },
];
const WIDTHS = [360, 390, 430];

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Number.isNaN(n) ? lo : n));
}

export default function MobileEditor({
  value,
  onChange,
}: {
  value: MobileTokens | undefined;
  onChange: (next: MobileTokens) => void;
}) {
  const m = value || {};
  const valOf = (key: string, def: number) =>
    typeof m[key] === "number" ? m[key] : def;

  const [page, setPage] = useState(PAGES[0].href);
  const [width, setWidth] = useState(390);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Injecte les réglages courants dans l'aperçu (rendu = vrai site, live).
  const injectLive = useCallback(() => {
    const ifr = iframeRef.current;
    if (!ifr) return;
    try {
      const doc = ifr.contentDocument;
      if (!doc || !doc.head) return;
      let style = doc.getElementById("mobile-live") as HTMLStyleElement | null;
      if (!style) {
        style = doc.createElement("style");
        style.id = "mobile-live";
        doc.head.appendChild(style);
      }
      const decls = MOBILE_FIELDS.map(
        (f) => `${f.varName}:${valOf(f.key, f.def)}${f.unit}`,
      ).join(";");
      style.textContent = `@media(max-width:640px){:root{${decls}}}`;
    } catch {
      /* même origine : ne devrait jamais échouer */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    injectLive();
  }, [injectLive]);

  const setKey = (key: string, num: number) =>
    onChange({ ...m, [key]: num });
  const resetKey = (key: string) => {
    const next = { ...m };
    delete next[key];
    onChange(next);
  };
  const resetAll = () => onChange({});

  const changedCount = MOBILE_FIELDS.filter(
    (f) => typeof m[f.key] === "number" && m[f.key] !== f.def,
  ).length;

  return (
    <div className="mob-editor">
      <div className="mob-controls">
        <div className="mob-controls-head">
          <p>
            Réglez le rendu <strong>mobile</strong> du site. L’aperçu à droite
            est le <strong>vrai site</strong> à la largeur d’un téléphone et se
            met à jour en direct. « Enregistrer et publier » applique en ligne.
          </p>
          <button
            type="button"
            className="mob-reset-all"
            onClick={resetAll}
            disabled={!changedCount}
          >
            Tout réinitialiser{changedCount ? ` (${changedCount})` : ""}
          </button>
        </div>

        {GROUPS.map((group) => (
          <fieldset key={group} className="mob-group">
            <legend>{group}</legend>
            {MOBILE_FIELDS.filter((f) => f.group === group).map((f) => {
              const v = valOf(f.key, f.def);
              const changed = typeof m[f.key] === "number" && m[f.key] !== f.def;
              return (
                <div className="mob-field" key={f.key}>
                  <div className="mob-field-top">
                    <label htmlFor={"mob-" + f.key}>{f.label}</label>
                    <span className="mob-valwrap">
                      <input
                        type="number"
                        className="mob-num"
                        value={v}
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        onChange={(e) =>
                          setKey(f.key, clamp(Number(e.target.value), f.min, f.max))
                        }
                      />
                      <span className="mob-unit">{f.unit}</span>
                      <button
                        type="button"
                        className="mob-reset"
                        title="Revenir à la valeur par défaut"
                        onClick={() => resetKey(f.key)}
                        style={{ visibility: changed ? "visible" : "hidden" }}
                      >
                        ↺
                      </button>
                    </span>
                  </div>
                  <input
                    id={"mob-" + f.key}
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={v}
                    className={changed ? "changed" : ""}
                    onChange={(e) => setKey(f.key, Number(e.target.value))}
                  />
                  {f.hint && <p className="mob-hint">{f.hint}</p>}
                </div>
              );
            })}
          </fieldset>
        ))}
      </div>

      <div className="mob-preview">
        <div className="mob-preview-bar">
          <select value={page} onChange={(e) => setPage(e.target.value)}>
            {PAGES.map((p) => (
              <option key={p.href} value={p.href}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="mob-widths">
            {WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                className={width === w ? "on" : ""}
                onClick={() => setWidth(w)}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
        <div className="mob-phone">
          <iframe
            ref={iframeRef}
            src={page}
            title="Aperçu mobile"
            onLoad={injectLive}
            style={{ width, height: 760, border: 0, display: "block" }}
          />
        </div>
        <p className="mob-note">
          Largeur simulée : {width}px · l’aperçu défile comme un vrai téléphone
        </p>
      </div>
    </div>
  );
}

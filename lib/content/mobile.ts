/**
 * Réglages responsive mobile pilotables depuis l'admin (section « Mobile »).
 *
 * Chaque réglage = une variable CSS consommée dans site.css sous
 * `@media (max-width: 640px)`, avec pour valeur de repli (2e argument de var())
 * exactement le rendu ACTUEL. Résultat : tant que l'admin ne pousse rien, rien
 * ne bouge ; dès qu'une valeur est enregistrée, elle est injectée en tête de
 * page via <style id="mobile-vars"> et prend le dessus.
 *
 * Le même tableau MOBILE_FIELDS sert au rendu (layout) ET à l'éditeur admin,
 * pour qu'ils ne divergent jamais.
 */

export type MobileTokens = Record<string, number>;

export interface MobileField {
  key: string; // clé stockée dans content.mobile
  varName: string; // variable CSS correspondante
  group: string; // regroupement dans l'UI
  label: string;
  hint?: string;
  min: number;
  max: number;
  step: number;
  def: number; // valeur par défaut = rendu actuel sur téléphone
  unit: "px";
}

export const MOBILE_FIELDS: MobileField[] = [
  // ── Espacements & largeur ─────────────────────────────
  { key: "gutter", varName: "--m-gutter", group: "Espacements & largeur", label: "Marges latérales", hint: "Espace vide à gauche et à droite du contenu.", min: 8, max: 40, step: 1, def: 20, unit: "px" },
  { key: "sectionY", varName: "--m-section-py", group: "Espacements & largeur", label: "Espacement des sections", hint: "Hauteur de respiration entre chaque bloc.", min: 24, max: 96, step: 2, def: 56, unit: "px" },
  { key: "heroY", varName: "--m-hero-py", group: "Espacements & largeur", label: "Hauteur du bandeau haut", hint: "Espace en haut des pages métier / espace de commande.", min: 48, max: 160, step: 2, def: 108, unit: "px" },
  { key: "gap", varName: "--m-gap", group: "Espacements & largeur", label: "Espace entre les cartes", min: 8, max: 32, step: 1, def: 16, unit: "px" },

  // ── Cartes ────────────────────────────────────────────
  { key: "cardPad", varName: "--m-card-pad", group: "Cartes", label: "Marge intérieure des cartes", min: 12, max: 34, step: 1, def: 24, unit: "px" },
  { key: "radius", varName: "--m-radius", group: "Cartes", label: "Arrondi des coins", min: 0, max: 28, step: 1, def: 16, unit: "px" },

  // ── Textes ────────────────────────────────────────────
  { key: "h1", varName: "--m-h1", group: "Textes", label: "Titre principal (H1)", min: 18, max: 44, step: 1, def: 21, unit: "px" },
  { key: "h2", varName: "--m-h2", group: "Textes", label: "Titres de section (H2)", min: 16, max: 38, step: 1, def: 22, unit: "px" },
  { key: "lead", varName: "--m-lead", group: "Textes", label: "Sous-titres et intros", min: 12, max: 22, step: 1, def: 15, unit: "px" },
  { key: "body", varName: "--m-body", group: "Textes", label: "Texte courant", min: 12, max: 18, step: 0.5, def: 14.5, unit: "px" },
];

export const MOBILE_DEFAULTS: MobileTokens = Object.fromEntries(
  MOBILE_FIELDS.map((f) => [f.key, f.def]),
);

/** CSS à injecter : uniquement les valeurs qui diffèrent du défaut. */
export function buildMobileCss(m?: MobileTokens | null): string {
  if (!m) return "";
  const decls = MOBILE_FIELDS.filter(
    (f) => typeof m[f.key] === "number" && m[f.key] !== f.def,
  )
    .map((f) => `${f.varName}:${m[f.key]}${f.unit}`)
    .join(";");
  return decls ? `@media (max-width:640px){:root{${decls}}}` : "";
}

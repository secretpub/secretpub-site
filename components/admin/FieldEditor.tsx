"use client";
import { useRef, useState } from "react";
import { uploadImage } from "@/app/admin/actions";

export type SetAt = (path: (string | number)[], value: unknown) => void;

/* eslint-disable @typescript-eslint/no-explicit-any */

function isPlainObject(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function isImageKey(k: string) {
  return /^(src|image|img|imgsrc|shotsrc|ogimage|logo|photo)$/i.test(k);
}
function looksLikeImage(v: string) {
  return (
    /^\/assets\//.test(v) ||
    /^https?:\/\/.+\.(png|jpe?g|webp|avif|svg)(\?|$)/i.test(v) ||
    /\.(png|jpe?g|webp|avif)$/i.test(v)
  );
}
function isHtmlKey(k: string) {
  return /html$/i.test(k);
}
function labelize(k: string | number): string {
  return String(k)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

// ── Libellés lisibles + explications (le cœur de l'amélioration UX) ──
type Descr = { label: string; hint?: string };
const D = (label: string, hint?: string): Descr => ({ label, hint });

// Champs purement techniques : masqués (leur valeur est conservée à l'enregistrement).
const HIDDEN = new Set(["slideClass", "i"]);

// Clé "parent.clé" prioritaire, sinon "clé", sinon joli libellé auto.
const DESCR: Record<string, Descr> = {
  // génériques
  eyebrow: D("Sur-titre", "Petit texte au-dessus du titre."),
  title: D("Titre"),
  titleHtml: D("Titre", 'Peut contenir du HTML (ex. <span class="mark">mot</span> pour le surlignage vert).'),
  heading2: D("Deuxième titre"),
  sub: D("Sous-titre"),
  desc: D("Description"),
  descHtml: D("Description", "Peut contenir du HTML."),
  tagHtml: D("Accroche", "Peut contenir du HTML (ex. <b>mot</b>)."),
  lead: D("Chapô", "Paragraphe d'introduction."),
  body: D("Texte"),
  note: D("Note"),
  label: D("Texte affiché"),
  href: D("Lien", "URL complète, ancre #section, tel: ou mailto:."),
  alt: D("Texte alternatif", "Décrit l'image (SEO et accessibilité)."),
  src: D("Image"),
  image: D("Image"),
  img: D("Image"),
  value: D("Valeur"),
  caption: D("Légende"),
  iconHtml: D("Icône (SVG)", "Code de l'icône — technique, à ne modifier qu'en connaissance de cause."),
  starsHtml: D("Étoiles", "Technique (les ★)."),
  headerCtaLabel: D("Bouton en-tête", "Texte du bouton vert en haut (ex. Demander un devis)."),
  // meta
  "meta.siteName": D("Nom du site"),
  "meta.title": D("Titre SEO", "Affiché dans l'onglet du navigateur et sur Google."),
  "meta.description": D("Description SEO", "Résumé affiché sous le titre sur Google (~150 caractères)."),
  "meta.ogImage": D("Image de partage", "Image affichée quand on partage le lien sur les réseaux."),
  "meta.catalogueUrl": D("Lien du catalogue"),
  "meta.phoneDisplay": D("Téléphone affiché"),
  "meta.phoneHref": D("Téléphone (lien)", "Format tel:+33… pour le clic-pour-appeler."),
  "meta.email": D("Email"),
  "meta.addressLine": D("Adresse"),
  "meta.googleReviewUrl": D("Lien avis Google"),
  // hero
  "slides.sub": D("Accroche", "Le paragraphe sous le grand titre."),
  "slides.priority": D("Chargement prioritaire", "À cocher pour la 1re diapositive uniquement."),
  "actions.class": D("Style du bouton", "Technique (classe CSS)."),
  "actions.arrow": D("Flèche →", "Afficher la petite flèche sur le bouton."),
  // trust (chiffres)
  "items.value": D("Chiffre", "Ex. 10, 3000, 24…"),
  "items.unit": D("Unité", "Ex. ans, h… (vide si aucune)."),
  "items.valuePrefix": D("Préfixe", "Ex. « + » devant le chiffre (vide si aucun)."),
  "items.from": D("Départ du compteur", "Laisse 0 pour l'animation de 0 à la valeur."),
  "items.stars": D("Afficher les étoiles"),
  // réalisations
  "items.cat": D("Catégorie (filtre)", "signa, print, textile, goodies ou packaging — sert au filtre du site."),
  "items.sub": D("Sous-catégorie", "Clé de sous-filtre (ex. brochures, enseignes)."),
  "items.cap": D("Titre affiché", "Le titre visible sur la vignette."),
  "items.catLabel": D("Libellé catégorie", "Texte affiché (ex. Print, Signalétique)."),
  "items.dotClass": D("Couleur de la pastille", "signa / print / textile / goodies / packaging."),
  "items.soc": D("Société (client)"),
  "items.desc": D("Description"),
  "items.extra": D("Masqué au départ", "Visible seulement après « voir plus »."),
  mainPhoto: D("Photo principale"),
  extraPhotos: D("Photos supplémentaires"),
  // secteurs
  "items.n": D("Numéro", "Ex. 01, 02…"),
  "items.detailsHtml": D("Détails", "Liste séparée par « · »."),
  // pour qui
  "cards.featured": D("Carte mise en avant"),
  "cards.badge": D("Badge", "Ex. « Le plus demandé » (vide si aucun)."),
  "cards.chipLabel": D("Étiquette"),
  "cards.chipLabelHtml": D("Étiquette"),
  "cards.chipIconHtml": D("Icône étiquette (SVG)", "Technique."),
  "cards.list": D("Points clés"),
  "ctas.type": D("Style", "primary (vert plein) ou ghost (contour)."),
  // méthode
  "steps.n": D("Numéro", "Ex. 1, 2, 3, 4."),
  // france
  "stats.n": D("Chiffre"),
  // waitlist
  "waitlist.titleHtml": D("Titre", "Peut contenir du HTML."),
  "waitlist.count": D("Nombre d'inscrits affiché"),
  "waitlist.promoValue": D("Réduction", "Ex. -20%."),
  "waitlist.scarcityWidth": D("Remplissage de la jauge", "En %, ex. 40%."),
  "waitlist.emailPlaceholder": D("Texte du champ email"),
  "waitlist.submitLabel": D("Texte du bouton"),
  "waitlist.confirm": D("Message de confirmation"),
  "waitlist.fine": D("Mention (petit texte)"),
  "waitlist.perks": D("Avantages"),
  // contact
  "contact.needOptions": D("Options « Votre besoin »"),
  "contact.activityOptions": D("Options « Type d'activité »"),
  "contact.sitesOptions": D("Options « Nombre d'établissements »"),
  "contact.deepLinkLabel": D("Lien secondaire"),
  "contact.submitLabel": D("Texte du bouton d'envoi"),
  "contact.okMessage": D("Message après envoi"),
  "contact.callTitle": D("Titre bloc téléphone"),
  "contact.callSub": D("Sous-texte téléphone"),
  "contact.officeValue": D("Adresse (bureaux)"),
  "contact.zoneValue": D("Zone d'intervention"),
  // footer
  "footer.about": D("Texte de présentation"),
  "footer.copyright": D("Mention copyright"),
};

// Libellés des tableaux (groupe) et de leurs éléments (singulier), par "parent.clé".
const GROUP: Record<string, string> = {
  nav: "Liens du menu",
  "hero.slides": "Diapositives du carrousel",
  "trust.items": "Chiffres clés",
  "clients.logos": "Logos clients",
  "realisations.filters": "Filtres",
  "realisations.items": "Réalisations",
  "realisations.testimonials": "Témoignages",
  "secteurs.items": "Secteurs",
  "pourqui.cards": "Cartes",
  "methode.steps": "Étapes",
  "france.services": "Services",
  "france.stats": "Statistiques",
  "faq.items": "Questions",
  "footer.columns": "Colonnes de liens",
  "footer.socials": "Réseaux sociaux",
  "metiersSocle.items": "Métiers",
  "metiersComplement.items": "Métiers",
};
const ITEM: Record<string, string> = {
  nav: "Lien",
  "hero.slides": "Diapositive",
  "trust.items": "Chiffre",
  "clients.logos": "Logo",
  "realisations.filters": "Filtre",
  "realisations.items": "Réalisation",
  "realisations.testimonials": "Témoignage",
  "secteurs.items": "Secteur",
  "pourqui.cards": "Carte",
  "methode.steps": "Étape",
  "france.services": "Service",
  "france.stats": "Statistique",
  "faq.items": "Question",
  "footer.columns": "Colonne",
  "footer.socials": "Réseau",
  "metiersSocle.items": "Métier",
  "metiersComplement.items": "Métier",
  list: "Point",
  perks: "Avantage",
  needOptions: "Option",
  activityOptions: "Option",
  sitesOptions: "Option",
  actions: "Bouton",
  ctas: "Bouton",
};

function parentOf(path: (string | number)[]): string {
  for (let i = path.length - 2; i >= 0; i--) {
    if (typeof path[i] === "string") return path[i] as string;
  }
  return "";
}
function describe(key: string, path: (string | number)[]): Descr {
  const p = parentOf(path);
  return DESCR[`${p}.${key}`] || DESCR[key] || { label: labelize(key) };
}
function groupLabel(key: string, path: (string | number)[]): string {
  const p = parentOf(path);
  return GROUP[`${p}.${key}`] || GROUP[key] || labelize(key);
}
function itemLabel(key: string, path: (string | number)[]): string {
  const p = parentOf(path);
  return ITEM[`${p}.${key}`] || ITEM[key] || labelize(key).replace(/s$/, "");
}

function blankLike(v: unknown): unknown {
  if (Array.isArray(v)) return [];
  if (isPlainObject(v)) {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(v)) o[k] = blankLike(v[k]);
    return o;
  }
  if (typeof v === "number") return 0;
  if (typeof v === "boolean") return false;
  return "";
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
function trunc(s: string, n = 48) {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}
// Aperçu texte d'un élément (pour le résumé fermé).
function previewOf(item: any): string {
  if (typeof item === "string") return trunc(stripHtml(item));
  if (!isPlainObject(item)) return "";
  const pick = [
    "cap", "title", "titleHtml", "name", "q", "label", "value",
    "chipLabel", "chipLabelHtml", "alt", "desc", "eyebrow",
  ];
  for (const k of pick) {
    const v = item[k];
    if (typeof v === "string" && v.trim()) return trunc(stripHtml(v));
  }
  for (const k of Object.keys(item)) {
    const v = item[k];
    if (typeof v === "string" && v.trim()) return trunc(stripHtml(v));
  }
  return "";
}
// Miniature d'un élément (logo, réalisation…).
function firstImageOf(item: any): string {
  if (!isPlainObject(item)) return "";
  for (const k of ["src", "image", "img", "logo", "photo"]) {
    if (typeof item[k] === "string" && looksLikeImage(item[k])) return item[k];
  }
  if (isPlainObject(item.mainPhoto) && typeof item.mainPhoto.src === "string")
    return item.mainPhoto.src;
  return "";
}

// Carte repliable : fermée par défaut, on clique l'en-tête pour l'ouvrir.
function CollapsibleItem({
  title,
  preview,
  thumb,
  controls,
  children,
}: {
  title: string;
  preview: string;
  thumb: string;
  controls: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"fe-item" + (open ? " open" : "")}>
      <div className="fe-item-head" onClick={() => setOpen((o) => !o)}>
        <span className="fe-caret">{open ? "▾" : "▸"}</span>
        {thumb ? (
          <span className="fe-item-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt="" />
          </span>
        ) : null}
        <span className="fe-item-t">{title}</span>
        {preview ? <span className="fe-item-prev">— {preview}</span> : null}
        <span style={{ marginLeft: "auto" }} />
        <div className="fe-item-ctl" onClick={(e) => e.stopPropagation()}>
          {controls}
        </div>
      </div>
      {open && <div className="fe-item-body">{children}</div>}
    </div>
  );
}

// Redimensionne (≤1920px) et convertit en WebP léger avant l'envoi. Les SVG/GIF
// passent tels quels. Évite de dépasser la limite d'upload et allège le site.
async function prepareUpload(file: File): Promise<{ blob: Blob; name: string }> {
  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  if (!/^image\/(png|jpe?g|webp|avif)$/i.test(file.type)) {
    return { blob: file, name: file.name || base };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const MAX = 1920;
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { blob: file, name: file.name };
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), "image/webp", 0.85),
    );
    bitmap.close?.();
    return blob ? { blob, name: `${base}.webp` } : { blob: file, name: file.name };
  } catch {
    return { blob: file, name: file.name };
  }
}

function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setErr(null);
    try {
      const { blob, name } = await prepareUpload(f);
      const fd = new FormData();
      fd.append("file", blob, name);
      const { url } = await uploadImage(fd);
      onChange(url);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Échec de l'envoi");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }
  return (
    <div className="fe-img">
      <div className="fe-thumb">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" />
        ) : (
          "vide"
        )}
      </div>
      <div className="fe-img-ctl">
        <input
          className="fe-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/assets/… ou URL"
        />
        <div>
          <button
            type="button"
            className="adm-btn sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? "Envoi…" : "Téléverser une image"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onFile}
          />
        </div>
        {err && <div className="adm-status err">{err}</div>}
      </div>
    </div>
  );
}

function ScalarField({
  fieldKey,
  value,
  path,
  setAt,
  hideLabel,
}: {
  fieldKey: string | number;
  value: unknown;
  path: (string | number)[];
  setAt: SetAt;
  hideLabel?: boolean;
}) {
  const key = String(fieldKey);
  const { label, hint } = describe(key, path);
  if (typeof value === "boolean") {
    return (
      <div className="fe-row">
        <label className="fe-check">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => setAt(path, e.target.checked)}
          />
          {label}
        </label>
        {hint && <div className="fe-hint">{hint}</div>}
      </div>
    );
  }
  if (typeof value === "number") {
    return (
      <div className="fe-row">
        {!hideLabel && <label className="fe-label">{label}</label>}
        {!hideLabel && hint && <div className="fe-hint">{hint}</div>}
        <input
          className="fe-input"
          type="number"
          value={value}
          onChange={(e) => setAt(path, Number(e.target.value))}
        />
      </div>
    );
  }
  const str = value == null ? "" : String(value);
  const isImg = isImageKey(key) || looksLikeImage(str);
  const isHtml = isHtmlKey(key);
  const isLong = str.length > 70 || str.includes("\n") || isHtml;
  return (
    <div className="fe-row">
      {!hideLabel && <label className="fe-label">{label}</label>}
      {!hideLabel && hint && <div className="fe-hint">{hint}</div>}
      {isImg ? (
        <ImageField value={str} onChange={(v) => setAt(path, v)} />
      ) : isLong ? (
        <textarea
          className={"fe-textarea" + (isHtml ? " mono" : "")}
          value={str}
          onChange={(e) => setAt(path, e.target.value)}
        />
      ) : (
        <input
          className="fe-input"
          type="text"
          value={str}
          onChange={(e) => setAt(path, e.target.value)}
        />
      )}
    </div>
  );
}

// Photo principale d'une réalisation : aperçu recadré (comme la vignette du site)
// avec point focal déplaçable → pilote object-position.
function PhotoObjectField({
  value,
  path,
  setAt,
}: {
  value: Record<string, any>;
  path: (string | number)[];
  setAt: SetAt;
}) {
  const photo = value || {};
  const src: string = photo.src || "";
  const pos: string = photo.pos || "50% 50%";
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  function setPosFromEvent(e: React.PointerEvent) {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
    setAt([...path, "pos"], `${Math.round(x)}% ${Math.round(y)}%`);
  }
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const { blob, name } = await prepareUpload(f);
      const fd = new FormData();
      fd.append("file", blob, name);
      const { url } = await uploadImage(fd);
      setAt([...path, "src"], url);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }
  const m = /(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/.exec(pos);
  const fx = m ? m[1] : "50";
  const fy = m ? m[2] : "50";

  return (
    <div className="fe-subgroup">
      <div className="fe-subhead">Photo principale (aperçu de la vignette)</div>
      <div className="fe-photo">
        <div
          className="fe-photo-box"
          ref={boxRef}
          style={{ cursor: src ? "crosshair" : "default" }}
          onPointerDown={(e) => {
            if (!src) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            setDrag(true);
            setPosFromEvent(e);
          }}
          onPointerMove={(e) => {
            if (drag) setPosFromEvent(e);
          }}
          onPointerUp={(e) => {
            setDrag(false);
            try {
              e.currentTarget.releasePointerCapture(e.pointerId);
            } catch {
              /* noop */
            }
          }}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" style={{ objectPosition: pos }} />
          ) : (
            <div className="fe-photo-empty">Aucune photo</div>
          )}
          {src && (
            <span className="fe-focal" style={{ left: fx + "%", top: fy + "%" }} />
          )}
        </div>
        <div className="fe-photo-ctl">
          <div className="fe-hint">
            Glisse sur l&apos;image pour repositionner l&apos;aperçu (le point
            vert = centre affiché sur la vignette du site).
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="adm-btn sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? "Envoi…" : src ? "Remplacer la photo" : "Téléverser une photo"}
            </button>
            {src && (
              <button
                type="button"
                className="adm-btn sm ghost"
                onClick={() => setAt([...path, "pos"], "50% 50%")}
              >
                Recentrer
              </button>
            )}
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
          </div>
          <ScalarField
            fieldKey="alt"
            value={photo.alt || ""}
            path={[...path, "alt"]}
            setAt={setAt}
          />
        </div>
      </div>
    </div>
  );
}

function objectKeys(v: Record<string, any>) {
  return Object.keys(v).filter((k) => !HIDDEN.has(k));
}

function ObjectEditor({
  fieldKey,
  value,
  path,
  setAt,
  top,
}: {
  fieldKey: string | number;
  value: Record<string, any>;
  path: (string | number)[];
  setAt: SetAt;
  top?: boolean;
}) {
  const keys = objectKeys(value);
  const body = keys.map((ck) => (
    <FieldEditor
      key={ck}
      fieldKey={ck}
      value={value[ck]}
      path={[...path, ck]}
      setAt={setAt}
    />
  ));
  if (top) return <>{body}</>;
  return (
    <div className="fe-subgroup">
      <div className="fe-subhead">{describe(String(fieldKey), path).label}</div>
      {body}
    </div>
  );
}

function ArrayEditor({
  fieldKey,
  value,
  path,
  setAt,
  top,
}: {
  fieldKey: string | number;
  value: any[];
  path: (string | number)[];
  setAt: SetAt;
  top?: boolean;
}) {
  const arr = value;
  const key = String(fieldKey);
  const scalar =
    arr.length > 0 && !isPlainObject(arr[0]) && !Array.isArray(arr[0]);
  const itemName = itemLabel(key, path);
  const set = (a: unknown[]) => setAt(path, a);
  const add = () =>
    set([...arr, arr.length ? blankLike(arr[arr.length - 1]) : ""]);
  const removeAt = (i: number) => set(arr.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    const c = arr.slice();
    [c[i], c[j]] = [c[j], c[i]];
    set(c);
  };
  const ctl = (i: number) => (
    <>
      <button className="adm-btn sm ghost" type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Monter">↑</button>
      <button className="adm-btn sm ghost" type="button" onClick={() => move(i, 1)} disabled={i === arr.length - 1} title="Descendre">↓</button>
      <button className="adm-btn sm danger" type="button" onClick={() => removeAt(i)} title="Supprimer">✕</button>
    </>
  );
  const list = (
    <div className="fe-array">
      {arr.map((item, i) =>
        scalar ? (
          <div key={i} className="fe-scalar-row">
            <div style={{ flex: 1 }}>
              <ScalarField fieldKey={i} value={item} path={[...path, i]} setAt={setAt} hideLabel />
            </div>
            {ctl(i)}
          </div>
        ) : (
          <CollapsibleItem
            key={i}
            title={`${itemName} #${i + 1}`}
            preview={previewOf(item)}
            thumb={firstImageOf(item)}
            controls={ctl(i)}
          >
            {isPlainObject(item)
              ? objectKeys(item).map((ck) => (
                  <FieldEditor key={ck} fieldKey={ck} value={item[ck]} path={[...path, i, ck]} setAt={setAt} />
                ))
              : <ScalarField fieldKey={i} value={item} path={[...path, i]} setAt={setAt} hideLabel />}
          </CollapsibleItem>
        ),
      )}
      <button className="adm-btn sm fe-add" type="button" onClick={add}>
        + Ajouter {itemName.toLowerCase()}
      </button>
    </div>
  );
  if (top) return list;
  return (
    <div className="fe-subgroup">
      <div className="fe-subhead">
        {groupLabel(key, path)}
        <span className="fe-count">{arr.length} élément{arr.length > 1 ? "s" : ""}</span>
      </div>
      {list}
    </div>
  );
}

export function FieldEditor({
  fieldKey,
  value,
  path,
  setAt,
  top,
}: {
  fieldKey: string | number;
  value: unknown;
  path: (string | number)[];
  setAt: SetAt;
  top?: boolean;
}) {
  if (HIDDEN.has(String(fieldKey))) return null;
  if (String(fieldKey) === "mainPhoto" && isPlainObject(value))
    return <PhotoObjectField value={value} path={path} setAt={setAt} />;
  if (Array.isArray(value))
    return <ArrayEditor fieldKey={fieldKey} value={value} path={path} setAt={setAt} top={top} />;
  if (isPlainObject(value))
    return <ObjectEditor fieldKey={fieldKey} value={value} path={path} setAt={setAt} top={top} />;
  return <ScalarField fieldKey={fieldKey} value={value} path={path} setAt={setAt} />;
}

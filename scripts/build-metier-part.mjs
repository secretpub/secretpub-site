// Transforme la sortie du workflow en content/parts/metierPages.json
// + rattache le maillage (related) + garantit ZÉRO tiret long + contrôle fournisseurs.
import { readFileSync, writeFileSync } from "node:fs";

const OUT = process.argv[2];
let raw = JSON.parse(readFileSync(OUT, "utf8"));
if (typeof raw === "string") raw = JSON.parse(raw);
const data = raw.result || raw; // le fichier tâche encapsule dans .result
const { pages, cohesion } = data;

const ORDER = ["signaletique", "imprimerie", "textile-personnalise", "objets-publicitaires", "packaging"];
const NAV = {
  signaletique: "Signalétique",
  imprimerie: "Imprimerie",
  "textile-personnalise": "Textile personnalisé",
  "objets-publicitaires": "Objets publicitaires",
  packaging: "Packaging",
};

// --- garde-fous ---
const DASH = /[—–―]/g; // — – ―
const SUPPLIERS = /helloprint|realisaprint|réalisaprint|exaprint|pixart|vistaprint|123imprim|flyeralarm|print24|onlineprinters|saxoprint/i;
let dashHits = 0;
const supplierHits = [];

function clean(v) {
  if (typeof v === "string") {
    if (SUPPLIERS.test(v)) supplierHits.push(v.slice(0, 60));
    if (DASH.test(v)) {
      dashHits += (v.match(DASH) || []).length;
      // remplace « mot — mot » par « mot, mot », et tiret isolé par virgule
      v = v.replace(/\s*[—–―]\s*/g, ", ").replace(DASH, ",");
    }
    return v;
  }
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v)) o[k] = clean(v[k]);
    return o;
  }
  return v;
}

// map related depuis cohesion
const relatedBySlug = {};
for (const r of cohesion?.related || []) relatedBySlug[r.slug] = r.links;
// metaTweaks éventuels
const tweakBySlug = {};
for (const t of cohesion?.metaTweaks || []) tweakBySlug[t.slug] = t;

const metierPages = {};
for (const slug of ORDER) {
  let p = pages.find((x) => x.slug === slug);
  if (!p) {
    console.error("MANQUE la page:", slug);
    continue;
  }
  p = clean(p);
  // meta tweak (dé-cannibalisation)
  const tw = tweakBySlug[slug];
  if (tw?.title) p.meta.title = clean(tw.title);
  if (tw?.description) p.meta.description = clean(tw.description);
  // maillage interne
  const rel = (relatedBySlug[slug] || [])
    .filter((l) => l.href && l.href !== `/${slug}`)
    .map((l) => ({ label: clean(l.label), href: l.href }));
  p.related = rel.length
    ? rel
    : ORDER.filter((s) => s !== slug).slice(0, 3).map((s) => ({ label: NAV[s], href: `/${s}` }));
  metierPages[slug] = p;
}

writeFileSync(
  "content/parts/metierPages.json",
  JSON.stringify({ metierPages }, null, 2) + "\n",
);

// rapport
console.log("Pages écrites:", Object.keys(metierPages).join(", "));
console.log("Tirets longs nettoyés:", dashHits);
console.log("Occurrences fournisseur détectées:", supplierHits.length, supplierHits);
for (const slug of ORDER) {
  const p = metierPages[slug];
  if (!p) continue;
  const tLen = p.meta.title.length, dLen = p.meta.description.length;
  console.log(
    `  ${slug.padEnd(20)} title ${tLen}c ${tLen <= 60 ? "ok" : "TROP LONG"} | desc ${dLen}c ${dLen <= 160 ? "ok" : "TROP LONG"} | prestations ${p.prestations.items.length} | faq ${p.faq.items.length} | related ${p.related.length}`,
  );
}
console.log("\nISSUES cohésion:", JSON.stringify(cohesion?.issues || [], null, 1));

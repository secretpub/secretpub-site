import { readFileSync, writeFileSync } from "node:fs";

const OUT = process.argv[2];
let raw = JSON.parse(readFileSync(OUT, "utf8"));
if (typeof raw === "string") raw = JSON.parse(raw);
const data = raw.result || raw;
const revised = data.pages || {};

const cur = JSON.parse(readFileSync("content/parts/metierPages.json", "utf8")).metierPages;
const ORDER = ["signaletique", "imprimerie", "textile-personnalise", "objets-publicitaires", "packaging"];

const DASH = /[—–―]/g;
const FORBID = /\b(covering|véhicule|vehicule|flotte)\b|lettrage (adhésif |)de véhicule/i;
const BAT24 = /(BAT|bon à tirer|devis)\s+(sous\s+)?24\s?h|24\s?h\s+après validation|BAT\s+24/i;
let dash = 0;
const problems = [];

function clean(v) {
  if (typeof v === "string") {
    if (DASH.test(v)) { dash += (v.match(DASH) || []).length; v = v.replace(/\s*[—–―]\s*/g, ", ").replace(DASH, ","); }
    return v;
  }
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === "object") { const o = {}; for (const k of Object.keys(v)) o[k] = clean(v[k]); return o; }
  return v;
}

const metierPages = {};
for (const slug of ORDER) {
  let p = revised[slug];
  if (!p) { console.error("MANQUE", slug, "(on garde l'ancienne version)"); metierPages[slug] = cur[slug]; continue; }
  p = clean(p);
  p.related = cur[slug].related; // préserve le maillage existant
  const blob = JSON.stringify(p);
  if (FORBID.test(blob)) problems.push(`${slug}: mention covering/véhicule/flotte restante`);
  if (BAT24.test(blob)) problems.push(`${slug}: promesse BAT/devis sous 24h restante`);
  if (slug === "imprimerie") {
    if (!/stock|réassort/i.test(blob)) problems.push("imprimerie: gestion des stocks absente");
    if (!/conditionn/i.test(blob)) problems.push("imprimerie: conditionnement absent");
    if (!/distribu/i.test(blob)) problems.push("imprimerie: distribution absente");
    if (/dix exemplaires|10 pièces|dix mille/i.test(blob)) problems.push("imprimerie: petite quantité encore citée");
  }
  metierPages[slug] = p;
}

writeFileSync("content/parts/metierPages.json", JSON.stringify({ metierPages }, null, 2) + "\n");

console.log("Pages:", Object.keys(metierPages).join(", "));
console.log("Tirets longs nettoyés:", dash);
console.log(problems.length ? "PROBLÈMES:\n - " + problems.join("\n - ") : "Contrôles OK (0 covering/BAT24h, imprimerie enrichie) ✓");
for (const slug of ORDER) {
  const p = metierPages[slug];
  console.log(`  ${slug.padEnd(20)} title ${p.meta.title.length}c | desc ${p.meta.description.length}c | prestations ${p.prestations.items.length} | related ${(p.related||[]).length}`);
}
// aperçu imprimerie
const imp = metierPages.imprimerie;
console.log("\nImprimerie prestations:", imp.prestations.items.map(i => i.title).join(" · "));
console.log("Imprimerie avantages:", imp.avantages.items.map(i => i.title).join(" · "));

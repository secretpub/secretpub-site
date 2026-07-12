// Convertit les images lourdes en WebP (même dossier, même nom de base),
// puis remplace les références .png/.jpg -> .webp dans les sources.
// Ne supprime l'original que si le WebP est réellement plus léger.
import sharp from "sharp";
import { readFileSync, writeFileSync, statSync, readdirSync, unlinkSync } from "node:fs";
import { join, extname, basename, dirname } from "node:path";

const ROOT = process.cwd();
const ASSETS = join(ROOT, "public/assets");

// Cible : tout fichier image > 150 Ko (hors logos/leaves, gérés séparément).
const SKIP = new Set(["logo-full.png", "logo-mark.png", "leaf-top.png", "leaf-mid.png", "leaf-bot.png"]);
const IMG_RE = /\.(png|jpe?g)$/i;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(p));
    else if (IMG_RE.test(name.name)) out.push(p);
  }
  return out;
}

const all = walk(ASSETS);
const targets = all.filter((p) => {
  if (SKIP.has(basename(p))) return false;
  if (/[\\/]logos[\\/]/.test(p)) return false; // logos clients : petits, transparence -> on garde
  return statSync(p).size > 150 * 1024;
});

console.log(`${targets.length} fichiers à convertir\n`);

const renamed = []; // { fromRel, toRel }
let saved = 0;

for (const src of targets) {
  const ext = extname(src);
  const isPng = /png/i.test(ext);
  const dest = src.slice(0, -ext.length) + ".webp";
  const before = statSync(src).size;
  let img = sharp(src);
  // WebP lossy avec alpha préservé pour les PNG, qualité un cran plus haut pour les montages.
  img = img.webp({ quality: isPng ? 84 : 80, effort: 6, alphaQuality: 90 });
  const buf = await img.toBuffer();
  if (buf.length >= before) {
    console.log(`= ${basename(src)} : WebP pas plus léger (${(before/1024|0)}Ko), on garde l'original`);
    continue;
  }
  writeFileSync(dest, buf);
  unlinkSync(src);
  const after = buf.length;
  saved += before - after;
  const rel = (p) => "/" + p.slice(ROOT.length + "/public/".length);
  renamed.push({ fromRel: rel(src), toRel: rel(dest) });
  console.log(`✓ ${basename(src)} ${(before/1024|0)}Ko -> ${(after/1024|0)}Ko  (-${(100*(before-after)/before|0)}%)`);
}

console.log(`\nGain total : ${(saved/1024/1024).toFixed(2)} Mo\n`);

// --- Mise à jour des références dans les sources texte ---
const SRC_DIRS = ["content", "templates", "lib", "app"];
const SRC_FILES = ["public/site.css", "public/site.js"];
function collectSrc(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...collectSrc(p));
    else if (/\.(json|html|tsx?|css|js)$/.test(name.name)) out.push(p);
  }
  return out;
}
let srcFiles = [];
for (const d of SRC_DIRS) { try { srcFiles.push(...collectSrc(join(ROOT, d))); } catch {} }
for (const f of SRC_FILES) srcFiles.push(join(ROOT, f));

let edits = 0;
for (const f of srcFiles) {
  let txt;
  try { txt = readFileSync(f, "utf8"); } catch { continue; }
  let next = txt;
  for (const { fromRel, toRel } of renamed) {
    if (next.includes(fromRel)) next = next.split(fromRel).join(toRel);
  }
  if (next !== txt) { writeFileSync(f, next); edits++; console.log(`maj refs: ${f.slice(ROOT.length+1)}`); }
}
console.log(`\n${edits} fichiers source mis à jour.`);

// Export du mapping pour la mise à jour de l'override Supabase.
writeFileSync(join(ROOT, "scripts/.webp-map.json"), JSON.stringify(renamed, null, 2));

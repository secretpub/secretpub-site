import fs from 'node:fs';
import path from 'node:path';
function walk(dir){ let out=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){ const p=path.join(dir,e.name); if(e.isDirectory()) out=out.concat(walk(p)); else out.push(p);} return out; }
const targets = [...walk('templates'), ...walk('content/parts')].filter(f => /\.(html|json)$/.test(f));
let changed = 0;
for (const f of targets) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  s = s.replace(/index\.html#/g, '/#')
       .replace(/href="index\.html"/g, 'href="/"')
       .replace(/"index\.html"/g, '"/"')
       .replace(/espace-de-commande\.html/g, '/espace-de-commande')
       .replace(/reseaux-franchises\.html/g, '/reseaux-franchises');
  // collapse accidental double slashes in our routes (e.g. //espace)
  s = s.replace(/"\/\/espace-de-commande/g, '"/espace-de-commande')
       .replace(/"\/\/reseaux-franchises/g, '"/reseaux-franchises');
  if (s !== before) { fs.writeFileSync(f, s); changed++; }
}
console.log('Rewrote internal links in', changed, 'files');

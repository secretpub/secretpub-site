import fs from 'node:fs';
import path from 'node:path';
import Mustache from 'mustache';
Mustache.escape = (t) => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const content = JSON.parse(fs.readFileSync('content/default.json','utf8'));
function partials(name){ const dir=path.join('templates',name); const o={}; if(fs.existsSync(dir)) for(const f of fs.readdirSync(dir)) if(f.endsWith('.html')) o[f.replace(/\.html$/,'')]=fs.readFileSync(path.join(dir,f),'utf8'); return o; }
function render(name){ const tpl=fs.readFileSync(path.join('templates',name+'.html'),'utf8'); return Mustache.render(tpl, content, partials(name)); }
for (const page of ['index','espace-de-commande','reseaux-franchises']) {
  let html;
  try { html = render(page); } catch(e){ console.log('❌', page, 'RENDER ERROR:', e.message); continue; }
  const leftover = (html.match(/\{\{[^}]/g)||[]).length;
  const slots = (html.match(/image-slot/g)||[]).length;
  const escSlash = (html.match(/&#x2F;/g)||[]).length;
  const relAssets = (html.match(/(src|href)="assets\//g)||[]).length;
  const imgs = (html.match(/<img/g)||[]).length;
  const sections = (html.match(/<section/g)||[]).length;
  fs.writeFileSync('scripts/out-'+page+'.html', html);
  console.log(`${leftover||slots||escSlash||relAssets?'⚠️ ':'✅'} ${page}: bytes=${html.length} imgs=${imgs} sections=${sections} | leftover{{=${leftover} image-slot=${slots} &#x2F;=${escSlash} relAssets=${relAssets}`);
}

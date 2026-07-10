import fs from 'node:fs';
// Ordre canonique + soc/desc toujours présents (vides si inconnus)
function normItem(r){
  const o={};
  o.cat=r.cat; o.sub=r.sub; o.cap=r.cap; o.catLabel=r.catLabel; o.dotClass=r.dotClass;
  o.soc = ('soc' in r && r.soc!=null) ? r.soc : '';
  o.desc = ('desc' in r && r.desc!=null) ? r.desc : '';
  if ('extra' in r) o.extra = r.extra;
  o.mainPhoto = r.mainPhoto || { src:'', alt: r.cap || '' };
  o.extraPhotos = r.extraPhotos || [];
  for (const k of Object.keys(r)) if (!(k in o)) o[k]=r[k];
  return o;
}
function normReal(real){ if(real && Array.isArray(real.items)) real.items = real.items.map(normItem); return real; }

// 1) default.json
const dj = JSON.parse(fs.readFileSync('content/default.json','utf8'));
normReal(dj.realisations);
fs.writeFileSync('content/default.json', JSON.stringify(dj,null,2)+'\n');
console.log('default.json: 18 réalisations normalisées (soc+desc présents partout)');

// 2) content/parts/realisations.json (provenance)
try{
  const pj = JSON.parse(fs.readFileSync('content/parts/realisations.json','utf8'));
  normReal(pj.realisations);
  fs.writeFileSync('content/parts/realisations.json', JSON.stringify(pj,null,2)+'\n');
  console.log('parts/realisations.json: normalisé');
}catch(e){ console.log('parts: skip', e.message); }

// 3) Supabase override (ce qui est réellement affiché en ligne)
import('@supabase/supabase-js').then(async ({createClient})=>{
  const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
  const {data}=await s.from('site_content').select('data').eq('id',1).maybeSingle();
  const d = (data && data.data) || {};
  if (d.realisations && Array.isArray(d.realisations.items)) {
    normReal(d.realisations);
    const {error}=await s.from('site_content').upsert({id:1, data:d, updated_by:'fix-soc'});
    console.log('Supabase override:', error? ('ERREUR '+error.message) : 'realisations normalisées + enregistrées');
    console.log('  items sans soc après fix:', d.realisations.items.filter(r=>!('soc'in r)).length);
  } else {
    console.log('Supabase override: pas de realisations (rien à faire)');
  }
});

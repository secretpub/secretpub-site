import fs from 'node:fs';
function normItem(r){
  const o={};
  o.cat=r.cat; o.sub=r.sub; o.cap=r.cap; o.catLabel=r.catLabel; o.dotClass=r.dotClass;
  o.soc = ('soc' in r && r.soc!=null)?r.soc:'';
  o.desc = ('desc' in r && r.desc!=null)?r.desc:'';
  o.mergeClient = ('mergeClient' in r) ? !!r.mergeClient : false;
  if ('extra' in r) o.extra=r.extra;
  o.mainPhoto = r.mainPhoto || {src:'',alt:r.cap||''};
  o.extraPhotos = r.extraPhotos || [];
  for (const k of Object.keys(r)) if (!(k in o)) o[k]=r[k];
  return o;
}
function norm(real){ if(real&&Array.isArray(real.items)) real.items=real.items.map(normItem); return real; }
const dj=JSON.parse(fs.readFileSync('content/default.json','utf8')); norm(dj.realisations);
fs.writeFileSync('content/default.json', JSON.stringify(dj,null,2)+'\n');
try{ const pj=JSON.parse(fs.readFileSync('content/parts/realisations.json','utf8')); norm(pj.realisations); fs.writeFileSync('content/parts/realisations.json', JSON.stringify(pj,null,2)+'\n'); }catch(e){}
console.log('default.json + parts: mergeClient ajouté');
import('@supabase/supabase-js').then(async({createClient})=>{
  const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
  const {data}=await s.from('site_content').select('data').eq('id',1).maybeSingle();
  const d=(data&&data.data)||{};
  if(d.realisations&&Array.isArray(d.realisations.items)){
    norm(d.realisations);
    const {error}=await s.from('site_content').upsert({id:1,data:d,updated_by:'fix-merge'});
    console.log('Supabase override:', error?('ERREUR '+error.message):'mergeClient ajouté ('+d.realisations.items.length+' items)');
  } else console.log('Supabase: pas de realisations');
});

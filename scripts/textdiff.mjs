import fs from 'node:fs';
function textOf(html){
  // body only
  let s = html;
  const b = s.indexOf('<body'); if (b>=0){ s = s.slice(s.indexOf('>',b)+1); }
  const e = s.indexOf('</body>'); if (e>=0) s = s.slice(0,e);
  return s
    .replace(/<script[\s\S]*?<\/script>/g,' ')
    .replace(/<svg[\s\S]*?<\/svg>/g,' ')
    .replace(/<!--[\s\S]*?-->/g,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/&nbsp;/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
function words(t){ return t.split(' ').filter(Boolean); }
function multiset(arr){ const m=new Map(); for(const w of arr) m.set(w,(m.get(w)||0)+1); return m; }
const orig = textOf(fs.readFileSync('reference/index.html','utf8'));
const rend = textOf(fs.readFileSync('scripts/out-index.html','utf8'));
const mo = multiset(words(orig)), mr = multiset(words(rend));
const missing=[], added=[];
for(const [w,c] of mo){ const d=c-(mr.get(w)||0); if(d>0) missing.push(w+(d>1?'×'+d:'')); }
for(const [w,c] of mr){ const d=c-(mo.get(w)||0); if(d>0) added.push(w+(d>1?'×'+d:'')); }
console.log('orig words:', words(orig).length, '| rendered words:', words(rend).length);
console.log('\nIn ORIGINAL but not rendered ('+missing.length+'):');
console.log(missing.length? missing.join('  ') : '  (none)');
console.log('\nIn RENDERED but not original ('+added.length+'):');
console.log(added.length? added.join('  ') : '  (none)');

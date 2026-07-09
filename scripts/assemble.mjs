import fs from 'node:fs';
import path from 'node:path';
const partsDir = 'content/parts';
const files = fs.readdirSync(partsDir).filter(f => f.endsWith('.json')).sort();
const merged = {};
let bad = 0;
for (const f of files) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(partsDir, f), 'utf8'));
    for (const k of Object.keys(j)) {
      if (merged[k]) console.warn('  ! key collision:', k, 'in', f);
      merged[k] = j[k];
    }
  } catch (e) {
    console.error('  BAD JSON:', f, '-', e.message);
    bad++;
  }
}
fs.writeFileSync('content/default.json', JSON.stringify(merged, null, 2) + '\n');
console.log('Merged', files.length, 'parts. Top-level keys:', Object.keys(merged).sort().join(', '));
console.log('Bad JSON files:', bad);

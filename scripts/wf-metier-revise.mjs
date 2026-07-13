export const meta = {
  name: 'metier-pages-revise',
  description: 'Corrige les 5 pages métier : logique délais (1re réponse 24h seulement), retrait covering/véhicule, et enrichissement imprimerie (gros volumes, stock, conditionnement, distribution multi-sites)',
  phases: [{ title: 'Réécriture' }, { title: 'Contrôle' }, { title: 'Révision' }],
}

const FILE = '/Users/imac/secretpub-site/content/parts/metierPages.json'

const RULES = `
RÈGLES DE CORRECTION (à appliquer STRICTEMENT, sans toucher au reste) :

1) LOGIQUE DES DÉLAIS (corrige partout). La SEULE promesse de délai autorisée est : « on vous répond une première fois sous 24 h ». Après cette première réponse, TOUT autre délai (devis détaillé, bon à tirer, production, livraison) DÉPEND DU PROJET et ne doit JAMAIS être promis « sous 24 h ». Donc :
   - Supprime toute promesse chiffrée « BAT sous 24 h », « bon à tirer sous 24 h », « devis sous 24 h », « devis 24 h », « BAT 24 h ».
   - Le bon à tirer (BAT) reste mentionné mais SANS délai chiffré : formule du type « on vous envoie un bon à tirer à valider avant production ».
   - Dans les étapes et la FAQ, reformule ainsi : « on vous répond une première fois sous 24 h ; ensuite les délais (devis, BAT, production) dépendent du projet : support, quantité, finitions ».
   - Tu PEUX garder « première réponse sous 24 h », « on vous recontacte sous 24 h », « réponse sous 24 h » (c'est vrai). Mais précise que c'est la PREMIÈRE réponse, pas le devis final ni le BAT.

2) COVERING / VÉHICULE : supprime TOUTE mention de covering, d'habillage de véhicule, de marquage ou lettrage de véhicule, et de « flotte ». (Attention : « habillage de vitrine » et « habillage complet d'un réseau » sont OK, ce ne sont pas des véhicules, garde-les.) Remplace les prestations/cibles/textes concernés par une alternative signalétique pertinente et concrète (ex. enseignes lumineuses, adhésifs et stickers, signalétique intérieure et directionnelle, drapeaux et oriflammes, plaques). Le résultat doit rester cohérent et complet (même nombre d'items).

3) PRÉSERVE tout le reste au plus près : même voix SecretPub, mêmes longueurs, même structure et mêmes clés. Ne réécris QUE ce qu'imposent les règles (et l'enrichissement imprimerie ci-dessous s'il s'agit de cette page).

4) INTERDITS ABSOLUS : aucun tiret long — – ― (utilise virgule/point/parenthèses/deux-points) ; aucun nom de fournisseur tiers ; faits verrouillés (adresse 31 Rue Jean Jullien Davin 26000 Valence, tél 09 83 80 93 12, email contact@secretpub.fr, note 5,0/5 sur 44 avis, catalogue https://secretpub-catalogue.vercel.app/catalogue). Vouvoiement. Français impeccable.
`.trim()

const IMPRIMERIE_EXTRA = `
ENRICHISSEMENT SPÉCIFIQUE À LA PAGE IMPRIMERIE (slug "imprimerie") :
- Accentue FORTEMENT la capacité à gérer les GROS VOLUMES d'impression (grandes séries, tirages importants, campagnes nationales).
- NE DONNE JAMAIS d'exemple de petite quantité (bannis « dix exemplaires », « 10 pièces », « à partir de 1 », « même pour quelques unités »). On ne se positionne plus sur le tout petit.
- Mets un vrai POINT D'HONNEUR sur la logistique : GESTION DES STOCKS (stockage et réassort), CONDITIONNEMENT (mise sous pli, colisage, kits par point de vente), et DISTRIBUTION vers plusieurs points de vente OU un site unique, partout en France.
- Fais transparaître l'angle : « on imprime en volume, on stocke pour vous, on conditionne, et on distribue à tous vos points de vente (ou à un seul) dans toute la France ». Ajoute/renomme des prestations et des avantages autour de ça (par ex. « Stockage et réassort », « Conditionnement sur mesure », « Distribution multi-sites »). Adapte aussi le hero, l'intro, les secteurs et la FAQ pour refléter cette force logistique et gros volumes.
`.trim()

const STR = { type: 'string' }
const kv = (req, props) => ({ type: 'object', required: req, properties: props })
const ARR = (items) => ({ type: 'array', items })
const PAGE_SCHEMA = kv(
  ['slug', 'cat', 'navLabel', 'meta', 'hero', 'intro', 'prestations', 'secteurs', 'process', 'avantages', 'faq', 'cta'],
  {
    slug: STR, cat: STR, navLabel: STR,
    meta: kv(['title', 'description'], { title: STR, description: STR }),
    hero: kv(['crumb', 'eyebrow', 'h1Html', 'sub'], { crumb: STR, eyebrow: STR, h1Html: STR, sub: STR }),
    intro: kv(['eyebrow', 'title', 'leadHtml', 'bodyHtml'], { eyebrow: STR, title: STR, leadHtml: STR, bodyHtml: STR }),
    prestations: kv(['eyebrow', 'title', 'intro', 'items'], { eyebrow: STR, title: STR, intro: STR, items: ARR(kv(['title', 'desc'], { title: STR, desc: STR })) }),
    secteurs: kv(['title', 'intro', 'items'], { title: STR, intro: STR, items: ARR(kv(['title', 'desc'], { title: STR, desc: STR })) }),
    process: kv(['eyebrow', 'title', 'intro', 'steps'], { eyebrow: STR, title: STR, intro: STR, steps: ARR(kv(['n', 'title', 'desc'], { n: STR, title: STR, desc: STR })) }),
    avantages: kv(['title', 'items'], { title: STR, items: ARR(kv(['title', 'desc'], { title: STR, desc: STR })) }),
    faq: kv(['title', 'items'], { title: STR, items: ARR(kv(['q', 'a'], { q: STR, a: STR })) }),
    cta: kv(['title', 'body', 'primaryLabel'], { title: STR, body: STR, primaryLabel: STR }),
    related: ARR(kv(['label', 'href'], { label: STR, href: STR })),
  },
)
const VERDICT_SCHEMA = kv(['pass', 'issues'], {
  pass: { type: 'boolean' }, score: { type: 'number' },
  issues: ARR(kv(['severity', 'field', 'problem', 'fix'], { severity: STR, field: STR, problem: STR, fix: STR })),
  notes: STR,
})

const METIERS = [
  { slug: 'signaletique', nav: 'Signalétique' },
  { slug: 'imprimerie', nav: 'Imprimerie' },
  { slug: 'textile-personnalise', nav: 'Textile personnalisé' },
  { slug: 'objets-publicitaires', nav: 'Objets publicitaires' },
  { slug: 'packaging', nav: 'Packaging' },
]

phase('Réécriture')
const result = await pipeline(
  METIERS,
  (m) => agent(
    `Tu corriges une page métier du site secretpub.fr.
Lis le fichier ${FILE} (JSON). Prends l'objet situé à metierPages["${m.slug}"] (page « ${m.nav} »).
Applique les règles de correction ci-dessous et renvoie la page COMPLÈTE corrigée (toutes les clés, structure identique), rien d'autre.

${RULES}
${m.slug === 'imprimerie' ? '\n' + IMPRIMERIE_EXTRA : ''}

Ne renvoie PAS le champ related (il est géré ailleurs). Renvoie l'objet page structuré.`,
    { schema: PAGE_SCHEMA, label: `corrige:${m.slug}`, phase: 'Réécriture', effort: 'high', agentType: 'general-purpose' },
  ),
  async (draft, m) => {
    if (!draft) return null
    const v = await agent(
      `Contrôle SANS PITIÉ cette page métier corrigée (« ${m.nav} »). Vérifie :
1) DÉLAIS : AUCUNE promesse « BAT sous 24 h / bon à tirer sous 24 h / devis sous 24 h / devis 24 h / BAT 24 h ». Seule « première réponse sous 24 h » est tolérée. Toute promesse chiffrée sur BAT/devis/production = pass:false, severity high.
2) COVERING/VÉHICULE : aucun mot « covering », « véhicule », « habillage de véhicule », « lettrage » de véhicule, « flotte ». (habillage de vitrine / de réseau = OK.) Sinon high.
3) TIRETS LONGS — – ― : aucun. Sinon high.
4) ${m.slug === 'imprimerie' ? 'IMPRIMERIE : la page met bien en avant gros volumes + gestion des stocks + conditionnement + distribution multi-sites/mono-site en France, et NE cite AUCUNE petite quantité (pas de « dix exemplaires », « 10 pièces »). Sinon medium/high.' : 'Cohérence générale, complétude, voix SecretPub.'}
5) Fournisseurs tiers interdits ; faits (adresse, tél, note 5,0/44) exacts.
Renvoie pass, score, issues[] (field+problem+fix), notes.

PAGE (JSON) :
${JSON.stringify(draft)}`,
      { schema: VERDICT_SCHEMA, label: `contrôle:${m.slug}`, phase: 'Contrôle', effort: 'medium', agentType: 'general-purpose' },
    )
    return { draft, verdict: v }
  },
  async (prev, m) => {
    if (!prev) return null
    if (prev.verdict && prev.verdict.pass && (prev.verdict.issues || []).every((i) => i.severity !== 'high')) {
      return prev.draft
    }
    const fixed = await agent(
      `Voici une page métier corrigée (« ${m.nav} ») et le rapport du contrôleur. Produis la VERSION FINALE en appliquant tous les correctifs, en respectant les règles.

${RULES}
${m.slug === 'imprimerie' ? '\n' + IMPRIMERIE_EXTRA : ''}

PAGE (JSON) :
${JSON.stringify(prev.draft)}

RAPPORT (JSON) :
${JSON.stringify(prev.verdict)}

Renvoie l'objet page final complet.`,
      { schema: PAGE_SCHEMA, label: `final:${m.slug}`, phase: 'Révision', effort: 'high', agentType: 'general-purpose' },
    )
    return fixed || prev.draft
  },
)

const pages = {}
METIERS.forEach((m, i) => { if (result[i]) pages[m.slug] = result[i] })
return { pages }

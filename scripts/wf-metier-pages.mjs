export const meta = {
  name: 'metier-pages-secretpub',
  description: 'Rédige le contenu SEO des 5 pages métier SecretPub (stratégie mots-clés, écriture, contrôle adversarial multi-lentilles, harmonisation anti-cannibalisation)',
  phases: [
    { title: 'Stratégie SEO' },
    { title: 'Rédaction' },
    { title: 'Contrôle' },
    { title: 'Révision' },
    { title: 'Cohésion' },
  ],
}

/* ============================ CONTEXTE PARTAGÉ ============================ */
const SHARED = `
ENTREPRISE — SecretPub (marque de la SARL NOSTILE FACTORY), agence de communication physique basée au 31 Rue Jean Jullien Davin, 26000 Valence (Drôme, Auvergne-Rhône-Alpes).
POSITIONNEMENT : un seul partenaire qui CONÇOIT, PRODUIT et POSE toute la communication physique d'une entreprise. Production maîtrisée de bout en bout. Local (Valence, Drôme, Auvergne-Rhône-Alpes) ET partout en France.
CIBLE B2B : commerçants, restaurateurs, artisans, PME, promoteurs immobiliers, BTP, clubs de sport, instituts beauté, ET surtout franchises / réseaux multi-sites.
FORCES DISTINCTIVES : (1) un seul interlocuteur pour signalétique + imprimerie + textile + objets publicitaires + packaging ; (2) espace de commande en ligne à la charte du client (les points de vente commandent, le siège pilote) idéal réseaux/franchises ; (3) BAT (bon à tirer) sous 24 h ; (4) réponses sous 24 h ; (5) pose et installation incluses ; (6) note Google 5,0/5 sur 44 avis.
LES 5 MÉTIERS DE LA FAMILLE (à cross-linker entre eux, jamais à confondre) :
  - Signalétique (enseignes, totems, vitrophanie, covering)  -> /signaletique
  - Imprimerie / print (cartes, flyers, brochures, affiches, PLV, grand format) -> /imprimerie
  - Textile personnalisé (broderie, flocage, sérigraphie, vêtements pro) -> /textile-personnalise
  - Objets publicitaires / goodies (tote bags, mugs, gourdes, cadeaux d'affaires) -> /objets-publicitaires
  - Packaging personnalisé (boîtes, étuis, sacs, emballages food) -> /packaging

COORDONNÉES VERROUILLÉES (n'invente rien d'autre) :
  Adresse : 31 Rue Jean Jullien Davin, 26000 Valence
  Téléphone : 09 83 80 93 12
  Email : contact@secretpub.fr
  Catalogue en ligne : https://secretpub-catalogue.vercel.app/catalogue
  Note : 5,0/5 sur 44 avis Google

VOIX / TON (voix d'Isaac, le fondateur) : direct, concret, chaleureux mais professionnel, orienté bénéfice client, vouvoiement, phrases courtes et lisibles, zéro superlatif creux, zéro jargon technique gratuit. On parle au client (« vous »), on vend de la tranquillité et du résultat, pas des specs.

RÈGLES ABSOLUES (une seule violation = travail rejeté) :
  1. INTERDICTION TOTALE des tirets longs / cadratins : les caractères — (U+2014), – (U+2013) et ― sont BANNIS partout (titres, textes, méta, FAQ). Utilise à la place : virgule, point, deux-points, parenthèses, ou « et ». C'est une exigence stricte du client (il déteste les « signaux trait long IA »).
  2. AUCUN nom de fournisseur / sous-traitant / imprimeur tiers (jamais helloprint, realisaprint, exaprint, pixartprinting, vistaprint, 123imprim, flyeralarm, print24, etc.). SecretPub se présente comme le producteur.
  3. AUCUNE fausse allégation : pas de certification inventée (ISO...), pas de chiffre client inventé, pas de « leader », pas de « n°1 ». Reste sur des promesses défendables (local, pose incluse, un seul partenaire, production maîtrisée, BAT 24 h, multi-sites, note 5,0/44 avis).
  4. Français impeccable, apostrophes typographiques ' correctes.
  5. Écris pour l'humain d'abord : pas de bourrage de mots-clés, ça doit se lire naturellement et donner envie de demander un devis.
`.trim()

/* ============================ LES 5 MÉTIERS ============================ */
const METIERS = [
  {
    slug: 'signaletique', cat: 'signa', nav: 'Signalétique',
    primaryKw: 'signalétique et enseignes à Valence',
    scope: "enseignes (lettres découpées, lumineuses, drapeau, bandeau), totems, oriflammes et drapeaux, vitrophanie et habillage de vitrine, covering de véhicule et flocage voiture, panneaux de chantier, plaques professionnelles, PLV et grand format extérieur, kakémonos et stands, bâches. Étude, fabrication et POSE incluses. Matériaux garantis extérieur (dibond, PVC, aluminium, adhésifs, vinyle).",
  },
  {
    slug: 'imprimerie', cat: 'print', nav: 'Imprimerie',
    primaryKw: 'imprimerie à Valence',
    scope: "cartes de visite, flyers et dépliants, brochures et catalogues, affiches, PLV carton, kakémonos et roll-up, papeterie (papier en-tête, enveloppes, blocs), menus et cartes de restaurant, stickers et étiquettes, impression grand format. Couleurs calibrées, BAT sous 24 h, petites comme grandes séries, finitions soignées (pelliculage, vernis sélectif, dorure).",
  },
  {
    slug: 'textile-personnalise', cat: 'textile', nav: 'Textile',
    primaryKw: 'textile personnalisé à Valence',
    scope: "t-shirts, polos, sweats, softshells et vestes, casquettes et bonnets, vêtements de travail et EPI haute visibilité, tabliers, maillots de sport, tote bags. Techniques : broderie, flocage, sérigraphie, impression numérique (DTF). Textiles pros qui tiennent au lavage. Tenues d'équipe et habillage complet d'un réseau.",
  },
  {
    slug: 'objets-publicitaires', cat: 'goodies', nav: 'Objets publicitaires',
    primaryKw: 'objets publicitaires à Valence',
    scope: "tote bags, mugs, gourdes et bouteilles, stylos, clés USB, carnets, porte-clés, magnets, désodorisants voiture, tapis d'entrée, cadeaux d'affaires, coffrets d'accueil et welcome packs. Objets utiles donc gardés et vus longtemps, qui font circuler la marque.",
  },
  {
    slug: 'packaging', cat: 'packaging', nav: 'Packaging',
    primaryKw: 'packaging personnalisé à Valence',
    scope: "boîtes et étuis sur-mesure, sacs papier et kraft, gobelets et emballages food, papier de soie, étiquettes et sleeves, coffrets premium. Du kraft simple au premium. Idéal restauration, e-commerce, retail : soigner le premier contact avec le produit.",
  },
]
const FAMILY = METIERS.map(m => `${m.nav} (/${m.slug})`).join(', ')

/* ============================ SCHÉMAS ============================ */
const S = (obj) => ({ type: 'object', ...obj })
const STR = { type: 'string' }
const ARR = (items) => ({ type: 'array', items })
const kv = (req, props) => ({ type: 'object', required: req, properties: props })

const PAGE_SCHEMA = kv(
  ['slug', 'cat', 'navLabel', 'meta', 'hero', 'intro', 'prestations', 'secteurs', 'process', 'avantages', 'faq', 'cta'],
  {
    slug: STR, cat: STR, navLabel: STR,
    meta: kv(['title', 'description'], { title: STR, description: STR }),
    hero: kv(['crumb', 'eyebrow', 'h1Html', 'sub'], { crumb: STR, eyebrow: STR, h1Html: STR, sub: STR }),
    intro: kv(['eyebrow', 'title', 'leadHtml', 'bodyHtml'], { eyebrow: STR, title: STR, leadHtml: STR, bodyHtml: STR }),
    prestations: kv(['eyebrow', 'title', 'intro', 'items'], {
      eyebrow: STR, title: STR, intro: STR,
      items: ARR(kv(['title', 'desc'], { title: STR, desc: STR })),
    }),
    secteurs: kv(['title', 'intro', 'items'], {
      title: STR, intro: STR, items: ARR(kv(['title', 'desc'], { title: STR, desc: STR })),
    }),
    process: kv(['eyebrow', 'title', 'intro', 'steps'], {
      eyebrow: STR, title: STR, intro: STR,
      steps: ARR(kv(['n', 'title', 'desc'], { n: STR, title: STR, desc: STR })),
    }),
    avantages: kv(['title', 'items'], {
      title: STR, items: ARR(kv(['title', 'desc'], { title: STR, desc: STR })),
    }),
    faq: kv(['title', 'items'], { title: STR, items: ARR(kv(['q', 'a'], { q: STR, a: STR })) }),
    cta: kv(['title', 'body', 'primaryLabel'], { title: STR, body: STR, primaryLabel: STR }),
  },
)

const STRATEGY_SCHEMA = kv(['pages'], {
  pages: ARR(kv(['slug', 'primaryKeyword', 'longTail', 'distinctAngle', 'prestationIdeas', 'secteursTargets'], {
    slug: STR, primaryKeyword: STR,
    longTail: ARR(STR), distinctAngle: STR,
    prestationIdeas: ARR(STR), secteursTargets: ARR(STR),
  })),
})

const VERDICT_SCHEMA = kv(['pass', 'issues'], {
  pass: { type: 'boolean' },
  score: { type: 'number' },
  issues: ARR(kv(['severity', 'field', 'problem', 'fix'], {
    severity: { type: 'string', enum: ['high', 'medium', 'low'] },
    field: STR, problem: STR, fix: STR,
  })),
  notes: STR,
})

const COHESION_SCHEMA = kv(['related', 'issues'], {
  related: ARR(kv(['slug', 'links'], {
    slug: STR, links: ARR(kv(['label', 'href'], { label: STR, href: STR })),
  })),
  metaTweaks: ARR(kv(['slug'], { slug: STR, title: STR, description: STR })),
  issues: ARR(kv(['slug', 'severity', 'note'], { slug: STR, severity: STR, note: STR })),
})

/* ============================ PHASE 1 — STRATÉGIE ============================ */
phase('Stratégie SEO')
const strategy = await agent(
  `${SHARED}

MISSION : tu es stratège SEO local B2B. Pour CHACUN des 5 métiers ci-dessous, définis un ciblage distinct pour éviter que les pages se cannibalisent entre elles sur Google. Chaque page vise un intitulé principal différent et des requêtes longue traîne propres.

Les 5 métiers :
${METIERS.map(m => `- slug "${m.slug}" (${m.nav}) : mot-clé principal « ${m.primaryKw} ». Périmètre : ${m.scope}`).join('\n')}

Pour chaque page renvoie :
- slug
- primaryKeyword : la requête principale visée (inclut le métier + Valence/Drôme)
- longTail : 6 à 10 requêtes longue traîne réalistes que tape un pro (ex. « enseigne lumineuse restaurant Valence », « flyers pas cher Drôme », « broderie logo vêtement de travail »...). Varie les intentions (local, produit précis, secteur, urgence).
- distinctAngle : en une phrase, l'angle éditorial propre à cette page pour ne PAS recouper les autres.
- prestationIdeas : 7 à 9 sous-prestations concrètes à mettre en avant (deviennent des blocs de la page).
- secteursTargets : 4 à 6 secteurs/cibles pour qui ce métier est clé.

Renvoie l'objet structuré.`,
  { schema: STRATEGY_SCHEMA, label: 'stratégie-mots-clés', phase: 'Stratégie SEO' },
)
const stratOf = (slug) => (strategy?.pages || []).find(p => p.slug === slug) || {}
log(`Stratégie prête pour ${(strategy?.pages || []).length} pages`)

/* ============================ PROMPTS ÉCRITURE / CONTRÔLE / RÉVISION ============================ */
function writePrompt(m) {
  const st = stratOf(m.slug)
  return `${SHARED}

MISSION : rédige le CONTENU COMPLET de la page métier « ${m.nav} » (URL /${m.slug}) du site secretpub.fr. Objectif : page d'atterrissage SEO qui RANK sur « ${m.primaryKw} » et convertit en demande de devis. Contenu unique, riche, concret, 600 à 900 mots au total.

PÉRIMÈTRE DU MÉTIER : ${m.scope}

CIBLAGE SEO (issu de la stratégie) :
- mot-clé principal : ${st.primaryKeyword || m.primaryKw}
- longue traîne à couvrir naturellement : ${(st.longTail || []).join(' ; ') || '(voir périmètre)'}
- angle distinctif de CETTE page (ne recoupe pas les autres) : ${st.distinctAngle || ''}
- sous-prestations à détailler : ${(st.prestationIdeas || []).join(', ') || m.scope}
- secteurs cibles : ${(st.secteursTargets || []).join(', ')}

Famille de pages à cross-linker (pour la cohérence, tu ne remplis PAS related, c'est fait ailleurs) : ${FAMILY}

FORMAT ATTENDU (respecte les longueurs, c'est un design réel) :
- slug = "${m.slug}", cat = "${m.cat}", navLabel = "${m.nav}"
- meta.title : 50 à 60 caractères MAX, contient le métier + Valence, accrocheur. Finit idéalement par « | SecretPub ».
- meta.description : 140 à 155 caractères MAX, bénéfice + appel à l'action implicite, contient le mot-clé.
- hero.crumb : "${m.nav}"
- hero.eyebrow : 2 à 4 mots (ex. « Signalétique & enseignes »)
- hero.h1Html : le H1, contient le mot-clé principal, avec le terme fort entouré de <span class="mark">…</span>. Pas de tiret long.
- hero.sub : 1 à 2 phrases (20 à 35 mots), promesse claire + Valence/France.
- intro.eyebrow, intro.title, intro.leadHtml (1 phrase forte, tu peux mettre <b>…</b>), intro.bodyHtml (EXACTEMENT 2 paragraphes <p>…</p>, présente l'offre, l'ancrage local et le « un seul partenaire »).
- prestations : eyebrow, title, intro (1 phrase). items = 6 à 8 sous-prestations, chacune {title court (2 à 4 mots), desc (12 à 22 mots, concret)}.
- secteurs : title, intro (1 phrase). items = 4 à 6 {title (le secteur), desc (12 à 20 mots : ce qu'on fait pour lui dans CE métier)}.
- process : eyebrow, title, intro. steps = 3 à 4 étapes {n ("01".."04"), title, desc (12 à 22 mots)}. Mets en valeur BAT 24 h, production maîtrisée, pose/livraison.
- avantages : title. items = 3 à 4 {title (2 à 4 mots), desc (12 à 20 mots)} : pourquoi SecretPub sur ce métier (local, un seul partenaire, multi-sites, note 5,0/44 avis, réponses 24 h).
- faq : title. items = 4 à 5 {q, a}. Vraies questions que pose un pro sur CE métier (délais, quantités mini, matériaux, pose, fichiers, tarifs). Réponses concrètes de 2 à 4 phrases. C'est du SEO « People Also Ask », soigne-le.
- cta : title (accroche), body (1 à 2 phrases), primaryLabel (ex. « Demander un devis »).

RAPPEL RÈGLES ABSOLUES : aucun tiret long — – ― nulle part ; aucun nom de fournisseur ; aucune fausse allégation ; vouvoiement ; français impeccable. Renvoie l'objet JSON structuré.`
}

function verifyPrompt(page, lens, m) {
  const P = JSON.stringify(page)
  const lenses = {
    regles: `LENTILLE « RÈGLES & MARQUE ». Contrôle SANS PITIÉ le contenu de la page « ${m.nav} » ci-dessous :
1. TIRETS LONGS : cherche TOUT caractère — (U+2014), – (U+2013) ou ― dans N'IMPORTE quel champ. Une seule occurrence = pass:false, severity high, indique le champ exact et la correction (remplacer par virgule/point/parenthèses).
2. FOURNISSEURS : tout nom d'imprimeur/sous-traitant tiers = high.
3. FAITS : adresse (31 Rue Jean Jullien Davin, 26000 Valence), tél (09 83 80 93 12), email (contact@secretpub.fr), note (5,0/5, 44 avis), catalogue URL. Toute coordonnée FAUSSE ou inventée = high. Toute allégation invérifiable (certif, « leader », chiffre client inventé) = high.
4. TON : vouvoiement constant, voix SecretPub, pas de superlatif creux = medium si dérive.
Renvoie pass (true seulement si ZÉRO issue high), score /100, issues[], notes.`,
    seo: `LENTILLE « SEO ». Évalue la page « ${m.nav} » (cible « ${m.primaryKw} ») :
1. meta.title : <= 60 caractères ET contient le métier + Valence. Trop long ou mot-clé absent = high.
2. meta.description : <= 155 caractères, incitative, contient le mot-clé = sinon medium/high.
3. hero.h1Html : présent, unique, mot-clé principal en début, un seul <h1> logique = sinon high.
4. Couverture longue traîne, hiérarchie des titres, richesse (>= 550 mots utiles), pas de bourrage de mots-clés.
5. FAQ exploitable en rich snippet.
Renvoie pass, score /100, issues[] (champ + problème + fix concret), notes.`,
    qualite: `LENTILLE « QUALITÉ & DIFFÉRENCIATION ». Juge la page « ${m.nav} » :
1. Le contenu est-il CONCRET et spécifique au métier, ou générique/creux ? (générique = medium/high avec exemple).
2. Se différencie-t-il bien des autres métiers de la famille (${FAMILY}) pour éviter la cannibalisation ?
3. Français, fluidité, pouvoir de conviction B2B, cohérence des longueurs avec le design.
4. La FAQ répond-elle à de VRAIES questions de pro ?
Renvoie pass, score /100, issues[] avec fix concret, notes.`,
  }
  return `${SHARED}\n\n${lenses[lens]}\n\nPAGE À CONTRÔLER (JSON) :\n${P}`
}

function revisePrompt(page, verdicts, m) {
  return `${SHARED}

MISSION : voici le brouillon de la page métier « ${m.nav} » et les rapports de 3 contrôleurs (règles, SEO, qualité). Produis la VERSION FINALE CORRIGÉE, en appliquant TOUS les correctifs signalés, sans rien casser de bon.

IMPÉRATIFS À GARANTIR dans ta sortie :
- ZÉRO tiret long — – ― (relis chaque champ).
- meta.title <= 60 caractères, meta.description <= 155 caractères.
- Tous les champs requis présents et bien remplis, longueurs respectées.
- Aucun fournisseur, aucune fausse allégation, faits verrouillés exacts.
Si un rapport est vide ou « pass », garde le contenu tel quel en le nettoyant quand même des éventuels tirets longs.

BROUILLON (JSON) :
${JSON.stringify(page)}

RAPPORTS DES CONTRÔLEURS (JSON) :
${JSON.stringify(verdicts)}

Renvoie l'objet page FINAL complet, structuré.`
}

/* ============================ PHASES 2-4 — PIPELINE write -> verify -> revise ============================ */
phase('Rédaction')
const finalPages = await pipeline(
  METIERS,
  // Stage 1 : écriture
  (m) => agent(writePrompt(m), { schema: PAGE_SCHEMA, label: `écrit:${m.slug}`, phase: 'Rédaction', effort: 'high' }),
  // Stage 2 : contrôle 3 lentilles en parallèle
  async (draft, m) => {
    if (!draft) return null
    const [regles, seo, qualite] = await parallel([
      () => agent(verifyPrompt(draft, 'regles', m), { schema: VERDICT_SCHEMA, label: `règles:${m.slug}`, phase: 'Contrôle', effort: 'medium' }),
      () => agent(verifyPrompt(draft, 'seo', m), { schema: VERDICT_SCHEMA, label: `seo:${m.slug}`, phase: 'Contrôle', effort: 'medium' }),
      () => agent(verifyPrompt(draft, 'qualite', m), { schema: VERDICT_SCHEMA, label: `qualité:${m.slug}`, phase: 'Contrôle', effort: 'medium' }),
    ])
    return { draft, verdicts: { regles, seo, qualite } }
  },
  // Stage 3 : révision finale
  async (prev, m) => {
    if (!prev) return null
    const clean = await agent(revisePrompt(prev.draft, prev.verdicts, m), { schema: PAGE_SCHEMA, label: `final:${m.slug}`, phase: 'Révision', effort: 'high' })
    return clean || prev.draft
  },
)

const pages = finalPages.filter(Boolean)
log(`${pages.length}/5 pages rédigées et révisées`)

/* ============================ PHASE 5 — COHÉSION (barrière) ============================ */
phase('Cohésion')
const cohesion = await agent(
  `${SHARED}

MISSION : tu reçois les 5 pages métier finales. Assure la COHÉSION de la famille et le MAILLAGE INTERNE.
1. related : pour CHAQUE slug, propose 2 à 3 liens vers les métiers SŒURS les plus pertinents à mettre en bas de page. href = "/autre-slug", label = nom du métier (ex. {label:"Imprimerie", href:"/imprimerie"}). Choisis les paires qui ont du sens commercial (ex. signalétique <-> textile pour habiller un point de vente et son équipe).
2. metaTweaks : si deux pages ont des meta.title trop proches (risque de cannibalisation), propose un title/description ajusté et distinct pour la/les page(s) concernée(s). Sinon laisse vide.
3. issues : signale toute redite forte de contenu entre pages, tout tiret long — – ― repéré, ou toute incohérence. severity high/medium/low.

Les 5 slugs disponibles : ${METIERS.map(m => m.slug).join(', ')}.

PAGES (JSON) :
${JSON.stringify(pages.map(p => ({ slug: p.slug, navLabel: p.navLabel, meta: p.meta, h1: p.hero?.h1Html })))}

Renvoie l'objet structuré { related, metaTweaks, issues }.`,
  { schema: COHESION_SCHEMA, label: 'cohésion-famille', phase: 'Cohésion', effort: 'high' },
)

/* ============================ SORTIE ============================ */
return { pages, cohesion, strategy }

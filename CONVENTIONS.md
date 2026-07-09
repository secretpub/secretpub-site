# Conventions de build — secretpub.fr (Next.js + Supabase CMS)

Ces règles sont **contractuelles** : tout code généré doit s'y conformer pour rester cohérent.

## Architecture
- Site public = Next.js App Router, **rendu serveur** (SSG/ISR). Le HTML complet (avec tout le
  contenu) est produit côté serveur → SEO parfait + navigation instantanée.
- Le design pixel-perfect est **conservé tel quel** : on réutilise `public/site.css` et
  `public/site.js` (les vraies feuilles/scripts du handoff, nettoyés). On ne réécrit PAS le CSS/JS.
- Chaque page rend un **template Mustache** (`templates/*.html`) interpolé avec un objet `content`.
  Rendu via `Mustache.render(template, content)` injecté en `dangerouslySetInnerHTML`.
- Le contenu vient de Supabase (table `site_content`, une ligne JSON) **fusionné par-dessus le
  contenu par défaut** (`content/default.json`). **Sans Supabase configuré → contenu par défaut**,
  le site marche à 100 %.

## Images
- **Jamais de `<image-slot>` en production.** Le web component `image-slot.js` est design-time only.
- Toute image de contenu = `<img class="ph" src="/assets/..." alt="..." loading="lazy" />`.
  - Hero (1re image) : pas de `loading="lazy"` (chargement immédiat) + `fetchpriority="high"`.
  - Classe `ph` = « placeholder/photo » : reçoit le dimensionnement des anciens `image-slot`.
- Réalisations : la photo principale est `<img class="ph ri-main" ...>`. Les photos
  supplémentaires vivent dans `<div class="ri-extra" hidden> <img class="ph" ...> … </div>`.
- Pas de bouton `pq-photo-edit` (« Changer la photo ») en production : les photos se gèrent via /admin.
- Les URLs d'images sont **root-absolues** : `/assets/...` (ou une URL Supabase Storage complète).

## Mustache
- `{{text}}` → texte échappé (titres simples, descriptions, labels).
- `{{{html}}}` → fragment HTML **non échappé** (ex. titres avec `<span class="mark">…</span>`,
  `<b>…</b>`). Suffixe `Html` sur la clé pour signaler ce cas (ex. `titleHtml`, `tagHtml`).
- Listes : `{{#hero.slides}} … {{/hero.slides}}`, `{{#realisations.items}} … {{/realisations.items}}`.
- Conditionnel : `{{#ctaSecondaryLabel}} … {{/ctaSecondaryLabel}}`.
- Le template **préserve exactement** les `id`, classes et structure DOM attendus par `site.js`.

## Espace de noms du contenu (`content/default.json`)
`meta, nav, hero, trust, clients, metiersSocle, metiersComplement, realisations, secteurs,
pourqui, waitlist, methode, france, faq, contact, footer`. Voir `lib/content/schema.ts`.

## Textes — règles de marque (impératives)
- Solution de commande = **« votre espace de commande SecretPub »**. Jamais « Plug&Print ».
- Vert d'action `#40AB3F`. Pas de dégradé rose/violet/bleu visible.
- Pas de tiret cadratin, pas d'esperluette dans le texte visible (écrire « et »).
- Pas de vocabulaire interne (orchestrateur, sous-traitance, réseau de partenaires),
  jamais « fabriqué dans nos ateliers ». Formule : « production maîtrisée de bout en bout,
  contrôle qualité interne ».
- Deux versions : « version point de vente » / « version réseau » (jamais lite/premium).

## SEO à conserver
Title + meta description uniques par page, Open Graph + Twitter, JSON-LD
(LocalBusiness + Service + FAQPage + BreadcrumbList), un seul H1/page, alt descriptifs,
liste de villes, contenu indexable dans le HTML rendu.

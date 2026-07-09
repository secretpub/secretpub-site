# Handoff : Site vitrine SecretPub (3 pages)

## Vue d'ensemble
Site B2B de SecretPub, partenaire unique de communication physique (signalétique, print, textile, goodies, packaging) basé à Valence, intervenant partout en France. Objectif : machine à leads (devis, démos de l'espace de commande, liste d'attente réseaux), avec un SEO technique complet.

## À propos de ces fichiers
Les fichiers de ce dossier sont des **références de design réalisées en HTML/CSS/JS vanilla** — des prototypes montrant l'apparence et le comportement voulus, pas du code de production à copier tel quel. La mission est de **recréer ces designs dans l'environnement du projet cible** (Next.js, Astro, ou autre framework choisi) en respectant ses conventions. Si aucun environnement n'existe encore, choisir le framework le plus adapté (recommandation : un framework à rendu statique/SSR pour le SEO — Next.js ou Astro — car tout le contenu doit être indexable dans le HTML rendu).

Le site est néanmoins **fonctionnel tel quel** (HTML statique + CSS + JS sans dépendance) : il peut être déployé directement en attendant la réécriture.

## Fidélité
**Haute fidélité (hifi).** Couleurs, typographies, espacements, copies et interactions sont finaux et validés par le client. Recréer au pixel près.

## Pages

### 1. `index.html` — Accueil (one-page)
Sections dans l'ordre :
1. **Header fixe** : pill « liquid glass » (fond `rgba(20,24,21,0.5)` + `backdrop-filter: blur(38px) saturate(1.5)`, bordure `rgba(255,255,255,0.22)`, rayon 999px). Nav : Métiers · Réalisations · Méthode · Contact (ancres) + bouton Catalogue (lien externe `https://secretpub-catalogue.vercel.app/catalogue`) + CTA vert « Demander un devis ». Burger + drawer latéral sous 1180px. IMPORTANT : ne jamais laisser de `transform` résiduel sur le header (ça casse le backdrop-filter).
2. **Hero carrousel** (3 slides, plein écran, sombre) : photo de fond + dégradé gauche `rgba(11,13,12,0.94→0.08)`, flèches liquid glass latérales, points de pagination. Slide 1 : « Toute votre communication physique. Un seul partenaire. » (souligné marqueur vert animé sur « communication physique »). Slide 2 (espace de commande, accent vert) : CTA vers `espace-de-commande.html`. Slide 3 (logistique). Auto-défilement 6,5 s, pause au survol, position persistée.
3. **Bandeau preuve** (fond blanc) : 4 chiffres qui comptent à l'apparition (+10 ans d'expérience · 3000+ projets livrés · note Google 5,0 ★ cliquable vers `https://share.google/icRvqS7HRzNh8U7oh` · 24 h délai de réponse). Vert vif, texte encre.
4. **« Ils nous font confiance »** : marquee de 13 logos clients (ordre exact : H&H, Glastint, Leclerc, Avia, Chamas Tacos, Auchan, Stressless, Cuisinella, Aviva, 0 €uro Pare-Brise, Manhattan Hot Dog, Big M, Ikami), défilement 72 s/tour, pause au survol, masque fondu latéral. Tailles par classe : `.lchip` (48px), `.sq` (68px), `.lg` (64px), `.xl` (108px).
5. **Nos métiers socles (01)** : bandeau titre vert texturé (grain SVG + dégradés), 3 vignettes photo (Signalétique, Print, Textile) avec rail lumineux vert qui suit le scroll (ligne + voyant néon), montages produits PNG transparents à droite, hover lift. **Complémentaires (02)** : même système inversé pour Goodies et Packaging (« La touche finale »).
6. **Secteurs** (fond sombre, sticky scroll) : « Quel que soit votre métier » — 6 secteurs (Restauration, Promoteur immobilier, BTP et rénovation, Automobile, Clubs et associations, Beauté et esthétique). Menu de gauche cliquable (saut direct), grande photo paysage à droite qui change au fil du scroll (plateau de visibilité ±0.45, fondu doux), jauge de progression verticale avec voyant pulsant. Sur mobile : empilé, hauteur 300vh.
7. **Pour qui** (fond sombre + halo vert) : titre centré « À chaque profil, sa solution. », 2 cartes blanches (Commerçant/PME → #contact ; Franchise/réseau → #liste-attente, badge « Le plus demandé ») avec photo 16/9.5 (image-slot remplaçable, bouton « Changer la photo » au survol), pastille verre dépoli, liste de ✓, 2 CTA par carte (vert plein + contour « Voir le catalogue »).
8. **Liste d'attente réseaux** (`#liste-attente`, bandeau vert `#46ad3d→#2f8a2a` + grain, carte blanche) : « L'offre réseaux ouvre bientôt. Réservez votre place. », mockup console (PNG transparent), formulaire email + bouton « Rejoindre la liste » (confirmation front-only), 4 avatars verts qui se chevauchent + 5ᵉ rond pointillé tournant avec flèche + « Vous ? » (souligné animé), compteur « 4 réseaux déjà inscrits », jauge 6 places restantes (10 au total), « -20% » avec reflet lumineux balayant, liste d'avantages.
9. **Méthode** (`#methode`, blanc) : titre centré « 4 étapes, zéro surprise. », 4 cartes numérotées (Étude / Proposition et BAT / Production maîtrisée / Pose et contrôle) + note de réassurance.
10. **Réalisations** (`#realisations`, section noire) : titre néon « La preuve par le travail livré. » allumé par un voyant vert descendant lié au scroll (grille néon en filigrane), témoignages défilants à droite (flèches liquid glass, auto 6 s). Filtres pastilles (Tout · Signalétique · Print · Textile · Goodies · Packaging) + **sous-filtres dynamiques** qui apparaissent au clic d'une catégorie (construits depuis `data-sub`). Grille 3×3 paginée (drag horizontal pour changer de page), vignettes 4/3 : titre + point de couleur catégorie au survol, **navigation multi-photos sur la vignette** (flèches + compteur si plusieurs photos), visionneuse plein écran (photo non recadrée `object-fit: contain`, vignettes, flèches, titre/société/catégorie/description à droite). Projets réels câblés : Pickup La Poste (3 photos), Boufi (3), NS Store, Ameliora, Batiman, Istanbul Kebab. CTA « Encore plus de réalisations » avec halo.
11. **Couverture nationale** (sombre) : carte de France SVG animée (routes qui se tracent, points pulsants, HQ Valence), 4 services (Envois, Conditionnement, Distribution, Pose), stats, **liste SEO de ~40 villes** (Valence, Lyon, Paris, Marseille…) en pastilles discrètes.
12. **FAQ** (blanc) : accordéons natifs `<details>`, logo 3 feuilles en parallaxe scroll (apparition couche par couche, spring, flottement continu une fois posé).
13. **Contact** (`#contact`, sombre + grain) : formulaire (Nom, Société, Email, Téléphone, **Votre besoin en pastilles à choix multiples** : Signalétique/Print/Textile/Goodies/Packaging/Pose/Prestation graphique, Type d'activité (select 11 options), Nombre d'établissements, Message) + lien « J'ai un projet plus précis » (`mailto`), carte info (téléphone 09 83 80 93 12, bureaux 31 Rue Jean Jullien Davin 26000 Valence, email contact@secretpub.fr en 18,5px). Soumission front-only (confirmation visuelle) — **à brancher sur un vrai backend/CRM**.
14. **Footer** (sombre) : logo, tagline, colonnes Métiers/Société/Contact, réseaux sociaux (Instagram `_secretpub`, LinkedIn `secret-pub`, Facebook `agencesecretpub`), copyright.

### 2. `espace-de-commande.html` — Page produit (hors menu)
Hero clair, fil d'Ariane, « Votre espace de commande SecretPub. La commande de vos supports, enfin simple. », 4 captures (image-slots à remplir), bloc **deux versions** (Version point de vente en premier, Version réseau `featured` verte), CTA bandeau vert « Activez votre espace de commande. ». Accessible depuis la slide 2 du hero.

### 3. `reseaux-franchises.html` — Page réseaux (CACHÉE pour l'instant)
`noindex, nofollow`, retirée du menu. À réactiver plus tard : structure douleur → solution → bénéfices → preuve → CTA démo.

## Règles de marque (impératives)
- Le site est **clair par défaut** ; le sombre (#0B0D0C) est réservé au header, hero carrousel, secteurs, pour-qui, réalisations, carte de France, contact, footer.
- **Vert vif #40AB3F** = couleur d'action (CTA, soulignés, chiffres, hovers). Visible dès le premier écran.
- La solution de commande s'appelle publiquement **« votre espace de commande SecretPub »** — ne JAMAIS afficher « Plug&Print » (nom interne), aucun dégradé rose/violet/bleu.
- Copie : pas de tiret cadratin, pas d'esperluette dans le texte visible (écrire « et »), jamais de vocabulaire interne (orchestrateur, sous-traitance, réseau de partenaires) ni « fabriqué dans nos ateliers ». Formule : « production maîtrisée de bout en bout, contrôle qualité interne ».
- Deux versions de l'espace : « version point de vente » et « version réseau » — jamais « lite »/« premium ».

## Design tokens
- **Couleurs** : encre `#0B0D0C` / `--ink-2 #16181a` ; crème `#F7F6F2` (`--paper`) ; blanc ; vert vif `#40AB3F` (`--green`) ; vert profond `#137A3E` (`--green-deep`) ; vert pâle `#E3F4E9` (`--green-soft`) ; sauge `#9FD8B4` (`--sage`) ; muted `#5c6660`.
- **Typographies** : Plus Jakarta Sans (display, 600-800) pour titres/boutons ; Hanken Grotesk (400-600) pour le texte. Google Fonts, `display=swap`.
- **Conteneur** : max-width 1200px, gutter `clamp(20px, 5vw, 72px)`. Sections : `padding-block: clamp(56px, 7vw, 96px)`.
- **Rayons** : boutons/pastilles 999px ; cartes 16-28px. **Ombres** : douces, teintées vert pour les éléments verts (`0 14px 30px -12px rgba(64,171,63,0.65)`).
- **Boutons** : micro-interactions 200 ms (flèche +4px, lift -2px). Texte des boutons verts en **blanc**.
- **Grain** : SVG feTurbulence en overlay `soft-light` sur les bandeaux verts/sombres (classe `grainy`).

## Interactions clés (voir `nouveau-site/site.js`, commenté)
- Reveal fade-up 20px une seule fois (IntersectionObserver, `.reveal`/`.armed`).
- Compteurs `[data-count]` : 0 → valeur à l'apparition.
- Carrousels hero/témoignages : auto + flèches + points, position hero persistée dans `localStorage`.
- Secteurs sticky : progression = scroll dans une zone de 320vh (plateau ±0.45), menu cliquable (scrollTo calculé).
- Réalisations : filtres/sous-filtres, pagination 9/page, drag-to-paginate (seuil 90px), visionneuse (Échap/flèches clavier), nav multi-photos par vignette.
- Fusion néon : voyant vert lié au scroll qui « allume » le titre Réalisations (variables CSS `--p1`, `--ign`).
- Parallaxe feuilles FAQ : 3 couches PNG, easing spring, `settled` → flottement infini (désactivé si `prefers-reduced-motion`).
- **`nouveau-site/image-slot.js`** : web component `<image-slot>` (drag-and-drop d'images par le client, persistance locale). En production, remplacer par de vraies balises `<img>` gérées par un CMS.

## SEO (à conserver absolument)
- Title + meta description uniques par page, Open Graph + Twitter Card, JSON-LD (`LocalBusiness` avec adresse Valence, `Service`, `FAQPage`, `BreadcrumbList`), un seul H1/page, hiérarchie Hn propre, alt descriptifs avec mots-clés métier+ville, liste de villes pour le référencement local, contenu indexable dans le HTML rendu (pas de client-only rendering).
- Mots-clés : imprimerie Valence, signalétique Valence, enseigne Drôme, textile personnalisé professionnel, communication multi-site, plateforme commande franchise.

## Performance (déjà optimisée, à maintenir)
- Toutes les photos lourdes converties en JPEG ≤ 1920px (suffixe `-opt`) : total images ~4 Mo (contre ~20 Mo avant). PNG conservé uniquement quand la transparence est nécessaire (logos, montages produits, mockup console, feuilles).
- `loading="lazy"` sur toutes les images sous la ligne de flottaison. Hero slide 1 en chargement immédiat.
- En production : servir en WebP/AVIF avec fallback, ajouter `srcset`, précharger la police display et la première image hero.

## Responsive
Breakpoints principaux : 1180px (nav→burger), 880/820px (grilles→1 colonne, carte France empilée, hero simplifié), 760px, 600px, 560px (CTA header masqué), 480/440/400px (ajustements fins). Anti-débordement global (`img/svg max-width:100%`, `* { min-width: 0 }`). Cibles tactiles ≥ 44px. À re-tester après portage.

## Reste à faire côté développement
1. Brancher le formulaire contact + liste d'attente sur un backend (email/CRM) avec anti-spam.
2. Remplacer les `<image-slot>` restants (12 emplacements réalisations vides + 4 captures espace de commande) par de vraies images.
3. Page « Réseaux et franchises » : réactiver quand le client le demande (retirer noindex, remettre les liens).
4. Mentions légales (lien présent dans le footer, page à créer).
5. Favicon multi-tailles + manifest.

## Fichiers
- `index.html` — accueil one-page (~1050 lignes)
- `espace-de-commande.html` — page produit
- `reseaux-franchises.html` — page réseaux (cachée)
- `nouveau-site/site.css` — tout le style (~2000 lignes, sections commentées)
- `nouveau-site/site.js` — toutes les interactions (vanilla, ~750 lignes, commenté)
- `nouveau-site/image-slot.js` — web component emplacements photos (design-time uniquement)
- `assets/` — toutes les images utilisées (héros, secteurs, montages produits, réalisations, logos clients, logo SecretPub)

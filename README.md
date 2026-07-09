# secretpub.fr — site vitrine + back-office

Site public de SecretPub (signalétique, print, textile, goodies, packaging) **et** un
back-office `/admin` pour gérer tout le contenu (textes, titres, descriptions, photos,
réalisations, coordonnées…) sans toucher au code.

- **Stack** : Next.js 16 (App Router) + Supabase + Vercel.
- **Rapidité** : pages rendues **statiquement** (SSG/ISR) → HTML complet servi instantanément,
  SEO parfait. Les animations (carrousels, scrollytelling, carte de France…) sont le JS
  d'origine, conservé tel quel.
- **Le site marche sans Supabase** : hors ligne / sans base, il affiche le **contenu par défaut**
  (`content/default.json`). Supabase n'est nécessaire que pour le CMS `/admin` et la capture de
  demandes.

---

## 1. Démarrer en local

```bash
npm install
npm run dev        # http://localhost:3000  (contenu par défaut, sans Supabase)
npm run build      # build de production
```

Tout le site fonctionne immédiatement. Pour activer `/admin` en local, crée un `.env.local`
(voir `.env.example`) avec les clés Supabase.

---

## 2. Mettre en ligne (quand tu es prêt)

> Rien n'est publié pour l'instant. Ces étapes préparent la mise en ligne sur **secretpub.fr**.

### a) Pousser le code sur GitHub
```bash
# depuis /Users/imac/secretpub-site (déjà un dépôt git avec un 1er commit)
gh repo create secretpub/secretpub-site --private --source=. --push
# ou : créer le repo à la main puis
#   git remote add origin git@github.com:secretpub/secretpub-site.git
#   git push -u origin main
```

### b) Créer le projet Supabase **dédié** (séparé du dashboard)
1. Nouveau projet sur supabase.com.
2. **SQL Editor** → colle et exécute `supabase/schema.sql` (crée `site_content`, `leads`,
   le bucket d'images `site-content`, la RLS).
3. **Authentication → Users → Add user** : ton email (ex. `contact@secretpub.fr`) + mot de passe.
4. **Project Settings → API** : note `Project URL`, clé `anon`, clé `service_role`.

### c) Créer le projet Vercel
1. Vercel → **New Project** → importe le repo `secretpub-site`.
2. **Environment Variables** (Production + Preview) :
   ```
   NEXT_PUBLIC_SUPABASE_URL        = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ… (anon)
   SUPABASE_SERVICE_ROLE_KEY       = eyJ… (service_role — secret serveur)
   ADMIN_ALLOWED_EMAILS            = contact@secretpub.fr
   REVALIDATE_SECRET               = (une longue chaîne aléatoire)
   NEXT_PUBLIC_SITE_URL            = https://secretpub.fr
   LEADS_NOTIFY_EMAIL              = contact@secretpub.fr
   ```
3. **Deploy**. Vérifie le site sur l'URL `*.vercel.app`, connecte-toi sur `/admin`.

### d) Brancher le domaine secretpub.fr
Vercel → Project → **Settings → Domains** → ajoute `secretpub.fr` (+ `www`) et suis les
enregistrements DNS indiqués chez ton registrar. **C'est cette étape qui bascule le trafic
sur le nouveau site** — à faire uniquement quand tu valides.

---

## 3. Le back-office `/admin`

- **Se connecter** : `secretpub.fr/admin` → email + mot de passe (utilisateur créé à l'étape 2b).
  Seuls les emails de `ADMIN_ALLOWED_EMAILS` sont acceptés.
- **Contenu** : chaque section du site (accueil, chiffres, métiers, réalisations, secteurs,
  pour qui, liste d'attente, méthode, FAQ, contact, pied de page, pages annexes) est éditable
  champ par champ. Listes = ajouter / supprimer / réordonner (ex. une réalisation, un logo client).
- **Photos** : bouton « Téléverser une image » sur chaque champ image → envoi direct dans le
  bucket Supabase, l'URL est remplie automatiquement. On peut aussi coller une URL / un chemin
  `/assets/...`.
- **Publier** : bouton **« Enregistrer et publier »** → écrit en base **et régénère les pages
  publiques immédiatement** (pas besoin de redéployer).
- **Demandes** : onglet `/admin/leads` → toutes les demandes de contact et inscriptions à la
  liste d'attente.

Le contenu édité est fusionné **par-dessus** `content/default.json`. Pour repartir des valeurs
d'origine d'une section, vide-la puis réédite, ou remets `{}` dans la ligne `site_content` (SQL).

---

## 4. Publier une modification

| Type de modif | Comment |
|---|---|
| Texte, titre, description, photo, réalisation… | Via **/admin** → « Enregistrer et publier » (instantané). |
| Design, structure, code | `git push` → Vercel redéploie automatiquement. |

---

## 5. Architecture (fichiers clés)

```
app/                     routes Next
  layout.tsx             <head> (fonts, site.css), charge site.js
  page.tsx               accueil (rend le template + JSON-LD)
  espace-de-commande/    page produit
  reseaux-franchises/    page réseaux (noindex, masquée)
  admin/                 back-office (login, éditeur, demandes)
  api/leads              capture des formulaires → Supabase
  api/revalidate         régénération à la demande
templates/               templates Mustache (index = partials par section)
content/default.json     contenu par défaut (source de vérité hors CMS)
lib/content/             schéma, chargement (Supabase + défaut), rendu Mustache
lib/supabase/            clients Supabase (admin service-role / serveur / navigateur)
public/site.css          design (nettoyé, image-slot → <img>)
public/site.js           interactions (carrousels, scroll, lightbox…)
public/assets/           images
supabase/schema.sql      schéma base + bucket + RLS
reference/               fichiers HTML d'origine (référence, non servis)
```

## 6. Optionnel / à faire plus tard
- Photos de réalisations manquantes (12 emplacements vides) : à ajouter via /admin quand dispo.
- Notification email des demandes (brancher un fournisseur type Resend dans `app/api/leads`).
- Ré-activer la page « Réseaux et franchises » (retirer `noindex` dans
  `app/reseaux-franchises/page.tsx`) quand souhaité.
- Page Mentions légales (lien présent dans le footer).
- Envoi des leads « hot » vers Axonaut (réutiliser les MCP existants).
```

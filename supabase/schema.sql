-- ============================================================
-- secretpub.fr — schéma Supabase (projet DÉDIÉ au site public)
-- À exécuter dans le SQL Editor du NOUVEAU projet Supabase.
-- Sûr à ré-exécuter (idempotent).
-- ============================================================

-- 1) CONTENU DU SITE ------------------------------------------------
-- Une seule ligne (id = 1) : les overrides édités dans /admin, fusionnés
-- par-dessus content/default.json au rendu. Lu/écrit UNIQUEMENT via la
-- clé service_role (serveur) → RLS verrouillé, aucun accès anon.
create table if not exists public.site_content (
  id          smallint primary key default 1,
  data        jsonb    not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  text,
  constraint site_content_single_row check (id = 1)
);

insert into public.site_content (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_content enable row level security;
-- Pas de policy anon/authenticated : seul service_role (qui bypass la RLS)
-- lit et écrit. Le site public lit via service_role côté serveur.

-- 2) LEADS (contact + liste d'attente) ------------------------------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  type        text not null default 'contact',      -- contact | waitlist
  email       text not null,
  name        text,
  company     text,
  phone       text,
  needs       text[],
  activity    text,
  sites       text,
  message     text,
  source_page text,
  payload     jsonb,
  handled     boolean not null default false
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_type_idx on public.leads (type);

alter table public.leads enable row level security;
-- Insertion via /api/leads (service_role). Lecture dans /admin via
-- service_role. Aucun accès anon direct.

-- 3) STOCKAGE DES IMAGES --------------------------------------------
-- Bucket public : les <img> du site pointent dessus. Écriture via
-- service_role (upload depuis /admin). Lecture publique.
insert into storage.buckets (id, name, public)
values ('site-content', 'site-content', true)
on conflict (id) do nothing;

drop policy if exists "site-content public read" on storage.objects;
create policy "site-content public read"
  on storage.objects for select
  using (bucket_id = 'site-content');
-- Uploads/updates/deletes : via service_role uniquement (bypass RLS).

-- 4) trigger updated_at ---------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before update on public.site_content
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Après ça : créer l'utilisateur admin dans Authentication → Users
-- (email = contact@secretpub.fr) + mot de passe, et l'ajouter à
-- ADMIN_ALLOWED_EMAILS dans les variables d'environnement Vercel.
-- ============================================================

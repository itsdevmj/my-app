-- ===========================================================================
-- Capture Studio — initial schema
-- ---------------------------------------------------------------------------
-- Run this once against your Supabase project. Either paste it into the SQL
-- Editor in the dashboard, or use the CLI:
--
--     supabase link --project-ref <your-ref>
--     supabase db push
--
-- SECURITY MODEL
-- Every table has RLS enabled and NO policies. That is intentional, not an
-- oversight. The app only ever reaches Supabase from the server using the
-- secret key, which bypasses RLS. With no policies, the publishable/anon key
-- can read and write nothing, so leaking it exposes no data.
--
-- If you later add browser-side reads, add explicit `for select using (true)`
-- policies to the tables that should be public — and only those.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- settings — a single row of studio details
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  -- `id` is constrained to true, which permits exactly one row.
  id          boolean     primary key default true check (id),
  name        text        not null,
  email       text        not null,
  phone       text        not null default '',
  address     text        not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.settings enable row level security;

insert into public.settings (id, name, email, phone, address)
values (
  true,
  'Capture Studio',
  'hello@capturestudio.co',
  '+1 (416) 555-1234',
  '123 Artistic Lane, Suite 302, New York, NY 10013'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- projects — featured work on the homepage, ordered by `position`
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null check (length(trim(title)) > 0),
  client      text        not null default '',
  tag         text        not null default '',
  year        text        not null default '',
  image       text        not null check (length(trim(image)) > 0),
  position    integer     not null default 0,
  updated_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

create index if not exists projects_position_idx on public.projects (position);

-- Seed with the defaults that ship in app/lib/site.ts, so an empty table
-- genuinely means "the operator deleted everything" rather than "not set up".
insert into public.projects (title, client, tag, year, image, position)
select * from (values
  ('Green Waves',     'Eco-Warriors', 'Brand film',  '2026', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80', 0),
  ('Mystic Horizons', 'Mode Elite',   'Campaign',    '2025', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',  1),
  ('Pixel Fusion',    'Techno',       'Commercial',  '2025', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',  2),
  ('Urban Uplift',    'MetroScape',   'Documentary', '2024', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80',  3),
  ('Golden Hour',     'Solaris',      'Brand film',  '2024', 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80',  4)
) as seed(title, client, tag, year, image, position)
where not exists (select 1 from public.projects);

-- ---------------------------------------------------------------------------
-- product_overrides — legacy sparse edits from the first admin implementation.
-- The application reads these once when seeding `products`, then all future
-- reads and writes use the complete product rows below.
-- ---------------------------------------------------------------------------
create table if not exists public.product_overrides (
  handle            text        primary key,
  name              text,
  tagline           text,
  description       text,
  cents             integer     check (cents is null or (cents >= 0 and cents <= 10000000)),
  compare_at_cents  integer     check (compare_at_cents is null or compare_at_cents >= 0),
  badge             text,
  in_stock          boolean,
  images            text[],
  updated_at        timestamptz not null default now()
);

alter table public.product_overrides enable row level security;

-- ---------------------------------------------------------------------------
-- products — complete storefront catalogue, ordered by `position`
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  handle                  text        primary key,
  name                    text        not null check (length(trim(name)) > 0),
  tagline                 text        not null default '',
  category                text        not null check (length(trim(category)) > 0),
  price_naira             integer     not null check (
    price_naira >= 0 and price_naira <= 100000000
  ),
  compare_at_price_naira  integer     check (
    compare_at_price_naira is null or compare_at_price_naira > price_naira
  ),
  badge                   text,
  digital                 boolean     not null default false,
  images                  text[]      not null check (cardinality(images) > 0),
  description             text        not null default '',
  includes                text[]      not null default '{}',
  option_label            text        not null default 'Option',
  options                 text[]      not null default '{}',
  in_stock                boolean     not null default true,
  position                integer     not null default 0,
  updated_at              timestamptz not null default now()
);

alter table public.products enable row level security;

create index if not exists products_position_idx on public.products (position);

-- Product defaults are seeded by app/lib/content-store.ts on the first read.
-- This keeps the TypeScript fallback and the initial database rows identical,
-- while making Supabase the canonical source after that first request.

-- ---------------------------------------------------------------------------
-- shop_categories — admin-managed storefront filters and navigation
-- ---------------------------------------------------------------------------
create table if not exists public.shop_categories (
  name        text        primary key check (
    length(trim(name)) > 0 and lower(trim(name)) <> 'all'
  ),
  position    integer     not null default 0,
  updated_at  timestamptz not null default now()
);

alter table public.shop_categories enable row level security;

create unique index if not exists shop_categories_name_ci_idx
  on public.shop_categories (lower(name));

create index if not exists shop_categories_position_idx
  on public.shop_categories (position);

-- Category defaults are seeded by app/lib/content-store.ts on first read.

-- ---------------------------------------------------------------------------
-- No storage bucket is created here on purpose. Images go to Cloudinary
-- (see app/lib/cloudinary.ts); Supabase is used for Postgres only.
-- ---------------------------------------------------------------------------

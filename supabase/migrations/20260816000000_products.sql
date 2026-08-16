-- Upgrade existing Supabase projects from sparse product overrides to complete
-- catalogue rows. The application seeds these rows on the first product read.

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

-- Older versions constrained category names to the original five values.
alter table public.products drop constraint if exists products_category_check;
alter table public.products add constraint products_category_check
  check (length(trim(category)) > 0);

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

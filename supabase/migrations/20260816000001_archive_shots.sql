-- Archive stills, managed from /admin/archive. The app seeds the existing
-- TypeScript archive on first read, then Supabase is the source of truth.

create table if not exists public.archive_shots (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null check (length(trim(title)) > 0),
  project     text        not null default '',
  category    text        not null check (category in ('On set', 'Location', 'Portrait', 'Post')),
  ratio       text        not null default '3 / 2' check (ratio in ('3 / 2', '2 / 3', '1 / 1')),
  image       text        not null check (length(trim(image)) > 0),
  position    integer     not null default 0,
  updated_at  timestamptz not null default now()
);

alter table public.archive_shots enable row level security;

create index if not exists archive_shots_position_idx on public.archive_shots (position);

create unique index if not exists archive_shots_identity_idx
  on public.archive_shots (title, project, image);

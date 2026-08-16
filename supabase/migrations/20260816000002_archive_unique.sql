-- Repair archive tables created before the identity index was added. Keep the
-- earliest row in each exact title/project/image group, then prevent first-read
-- seed races from creating duplicates again.

delete from public.archive_shots
where id in (
  select id
  from (
    select
      id,
      row_number() over (
        partition by title, project, image
        order by position asc, updated_at asc, id asc
      ) as duplicate_number
    from public.archive_shots
  ) ranked
  where duplicate_number > 1
);

create unique index if not exists archive_shots_identity_idx
  on public.archive_shots (title, project, image);

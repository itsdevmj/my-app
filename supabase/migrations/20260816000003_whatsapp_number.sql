-- Dedicated destination for storefront WhatsApp orders. This remains separate
-- from the public studio phone number shown in the site footer.

alter table public.settings
  add column if not exists whatsapp_number text not null default '';

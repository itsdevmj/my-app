# Capture Studio

Capture Studio is a Next.js 16 site with a public portfolio, storefront, and
password-protected admin area. Content is read server-side; Supabase is the
production source of truth for studio settings, featured work, and products.

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Copy `.env.example` to
`.env.local`, then set `ADMIN_PASSWORD` and `ADMIN_SECRET` to use `/admin`.

## Supabase

Set these server-only variables locally and in the deployment:

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=<secret-key>
```

Apply every SQL file in `supabase/migrations/` to the linked project. With the
Supabase CLI this is normally:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

On the first product read, the app seeds the full catalogue into
`public.products`. From then on, storefront and admin product reads come from
Supabase. Product prices are stored as whole Nigerian naira and displayed as
`₦` amounts.

Without Supabase credentials, the application falls back to local JSON storage
for development only.

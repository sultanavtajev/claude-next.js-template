---
name: supabase-migrations
description: Endre Supabase-database-schema og kjøre migrations trygt via Supabase CLI. Bruk når brukeren ber om å legge til/endre/slette tabeller, kolonner, policies eller RLS-regler.
---

# Supabase Migrations

Supabase CLI gir migrasjonsflyt som ligner Prisma/Rails — SQL-filer versjoneres og kjøres mot hosted Postgres.

## Arbeidsflyt

```bash
# 1. Opprett ny migrasjonsfil
npx supabase migration new <beskrivende_navn>

# 2. Rediger supabase/migrations/<timestamp>_<navn>.sql
#    NB: Claude Code-hook auto-regenererer snapshoten etter denne editen

# 3. Push til hosted database
npx supabase db push

# 4. Regenerer TypeScript-typer + snapshot
pnpm db:types      # src/lib/supabase/database.types.ts
pnpm db:snapshot   # teknisk/dokumentasjon/supabase-snapshot.md
```

**Før du lager en ny migrasjon**: les `teknisk/dokumentasjon/supabase-snapshot.md` for å forstå eksisterende tabellstruktur, RLS-policies, triggers og functions. Dette hindrer duplikasjon og inkonsistenser.

## Legge til tabell med RLS

```sql
-- supabase/migrations/20260414120000_add_posts.sql
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.posts enable row level security;

create policy "Brukere leser egne posts"
  on public.posts for select
  using (auth.uid() = author_id);

create policy "Brukere skriver egne posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Brukere oppdaterer egne posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Brukere sletter egne posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Auto-oppdater updated_at
create trigger set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();
```

**Husk**: uten RLS er data tilgjengelig for alle med publishable key. Aktiver det alltid på tabeller med brukerdata.

## Legge til felt

```sql
alter table public.posts add column slug text;
-- Hvis NOT NULL, må du også gi default eller backfille eksisterende rader først:
update public.posts set slug = lower(regexp_replace(title, '\s+', '-', 'g')) where slug is null;
alter table public.posts alter column slug set not null;
alter table public.posts add constraint posts_slug_unique unique (slug);
```

## Renaming

```sql
alter table public.posts rename column body to content;
```

Dette bevarer data. Ikke gjør drop + add for rename.

## Policies — vanlige mønstre

### Offentlig lesing, egen skriving
```sql
create policy "Alle kan lese" on public.posts for select using (true);
create policy "Egen skriving" on public.posts for insert with check (auth.uid() = author_id);
```

### Admin-rolle via user-metadata
```sql
create policy "Admins gjør alt" on public.posts for all
  using ((auth.jwt() ->> 'role') = 'admin');
```

### Join-basert policy
```sql
-- Bare team-medlemmer ser team-posts
create policy "Team-medlemmer leser" on public.team_posts for select
  using (
    exists (
      select 1 from public.team_members
      where team_id = team_posts.team_id and user_id = auth.uid()
    )
  );
```

## Nullstille lokalt (destruktivt)

```bash
npx supabase db reset
```

Dette sletter ALT og kjører alle migrations fra scratch. Kun for lokal utvikling — aldri mot produksjon.

## Produksjonsmigrering

`supabase db push` kjører mot *linked* prosjekt (det du koblet til med `supabase link`). For safe deploy:

1. Kjør migrasjon mot staging/dev-prosjekt først.
2. Bekreft alt virker.
3. Deretter `supabase link --project-ref <prod-ref>` og `db push`.

Vercel/CI: `supabase db push` i deploy-script, eller kjør manuelt før deploy.

## Helper-funksjoner

Vanlig `set_updated_at()`-trigger:

```sql
-- Legg til i en tidlig migrasjon
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

## TypeScript-typer

Etter hver migrasjon:
```bash
pnpm db:types
```

Genererer `src/lib/supabase/database.types.ts`. Bruk typen i kall:

```typescript
import type { Database } from "@/lib/supabase/database.types";

const supabase = createClient<Database>(...);
const { data } = await supabase.from("posts").select("*");
// data er typet som Database["public"]["Tables"]["posts"]["Row"][]
```

## Anti-patterns

- ❌ Redigere eksisterende migrasjoner som allerede er kjørt i produksjon — lag ny migrasjon.
- ❌ Bruke `supabase db push` uten å linke prosjekt først.
- ❌ Committe tabeller uten RLS — data eksponeres.
- ❌ Bruke `SUPABASE_SERVICE_ROLE_KEY` for å omgå RLS i UI-kode — bruk riktig policy i stedet.

# Steg 09 — Environment

## Pre-flight: sjekk docs

Hent `https://env.t3.gg/docs/nextjs` og bekreft:
- At `@t3-oss/env-nextjs` fortsatt er anbefalt pakke.
- Gjeldende `createEnv`-API (kan ha endret skjema-struktur).

Hent også `https://supabase.com/docs/guides/getting-started/quickstarts/nextjs` for å verifisere at env-nøkkelnavnene (publishable key vs anon key) fortsatt er som under.

## Mål

Opprett `.env.example` med alle Supabase-nøkler dokumentert, en typesafe `src/env.ts` som validerer env-variabler med Zod, og installer `dotenv-cli` slik at `.env.local` blir single source of truth for *all* CLI-tooling (Supabase CLI, custom scripts, Vercel-env-push i steg 13).

## Sjekkliste

- [ ] Pre-flight docs-sjekk kjørt
- [ ] `@t3-oss/env-nextjs` og `zod` installert
- [ ] `dotenv-cli` installert som dev-dependency
- [ ] `.env.example` opprettet med Supabase + (valgfri) Resend-nøkler
- [ ] `src/env.ts` opprettet med typesikker `createEnv`-oppsett (server + client + runtimeEnv)
- [ ] `.env.local` verifisert: finnes lokalt og er ignorert av git (nøkler ble skrevet inn i steg 07 for Supabase)
- [ ] Verifisert at importstien `@/env` fungerer — ingen `process.env` direkte utenfor `src/env.ts`

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 09 i `oppstart/CHECKLIST.md` og gå til steg 10.

## Kommandoer

```bash
pnpm add @t3-oss/env-nextjs zod
pnpm add -D dotenv-cli
```

### Hvorfor `dotenv-cli`?

Next.js auto-laster `.env.local` for `pnpm dev`/`build`/`start` (server + client + Server Actions + Route Handlers). Men:
- **Supabase CLI** (`supabase db push`, `gen types`, `migration new`) leser ikke `.env.local` — den trenger `SUPABASE_ACCESS_TOKEN` fra system-env.
- **Custom scripts** (f.eks. `scripts/supabase-snapshot.ts`) som spawner andre CLI-er har samme problem.
- **Bash-eksempler i steg 13** (Vercel env-push, Supabase Auth API curl) trenger både `SUPABASE_ACCESS_TOKEN` og verdier fra `.env.local`.

`dotenv-cli` løser dette: prefix kommandoen med `dotenv -e .env.local --` så lastes `.env.local` inn i prosessens env før kommandoen kjører. Cross-platform (fungerer i bash, PowerShell, cmd) — i motsetning til `source .env.local` som bare er bash. Resultat: `.env.local` er den **eneste** stedet faktiske verdier ligger.

## Filer

### `.env.example`

```bash
# Supabase (fra dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="" # tidligere anon key — trygg å eksponere
SUPABASE_SERVICE_ROLE_KEY=""            # SERVER-ONLY — gir full DB-tilgang, ALDRI eksponer

# Supabase Management API (kun for Claude — brukes i steg 13 for å sette Auth URLs)
# Hent fra https://supabase.com/dashboard/account/tokens
SUPABASE_ACCESS_TOKEN=""

# (Valgfritt) Resend for e-post
RESEND_API_KEY=""
```

### `src/env.ts`

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
});
```

### `.env.local` (lokal, ikke committes)

Kopier `.env.example` → `.env.local` og fyll inn faktiske verdier. Brukeren må:
- Hente `NEXT_PUBLIC_SUPABASE_URL` og publishable key fra Supabase dashboard.
- Hente service role key samme sted.
- **ALDRI** committe `.env.local` — den er allerede i `.gitignore`.

### `package.json` scripts — wrap CLI-tooling med `dotenv -e .env.local --`

Oppdater `scripts`-blokken i `package.json` slik at alle scripts som spawner CLI-er utenfor Next.js-runtime går gjennom `dotenv-cli`. Eksempel (full liste finnes i steg 07 Del 4 for db-scripts):

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:types": "dotenv -e .env.local -- supabase gen types typescript --linked > src/lib/supabase/database.types.ts",
    "db:push": "dotenv -e .env.local -- supabase db push",
    "db:new": "dotenv -e .env.local -- supabase migration new",
    "db:snapshot": "dotenv -e .env.local -- tsx scripts/supabase-snapshot.ts"
  }
}
```

Next-scripts (`dev`, `build`, `start`, `lint`) trenger **ikke** dotenv-prefix — Next.js auto-laster.

### Bruk `dotenv-cli` i ad-hoc bash-kommandoer

For kommandoer du kjører i terminalen (utenom package.json), bruk samme mønster:

```bash
# Riktig (cross-platform, konsistent)
dotenv -e .env.local -- supabase db push
dotenv -e .env.local -- bash -c 'curl -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" ...'

# Unngå (bash-only, brekker på Windows PowerShell/cmd)
source .env.local && supabase db push
export $(cat .env.local | xargs) && curl ...
```

## Sikkerhet

- **`SUPABASE_SERVICE_ROLE_KEY`** gir full tilgang til databasen (bypass RLS). Bruk kun i server-kode (Route Handlers, Server Actions, Edge Functions) som absolutt trenger å omgå RLS (f.eks. admin-oppgaver, webhooks). Aldri importer den i komponenter.
- **Publishable key (tidligere anon key)** er trygg å eksponere i browser — tilgang styres av RLS-policies.
- **Rotér service role key** umiddelbart hvis den lekker: Supabase dashboard → Project Settings → API → "Reset service_role key".

## Forventet resultat

- `.env.example` committes (dokumentasjon).
- `.env.local` eksisterer lokalt (ignoreres av git) og er **eneste** kilde til faktiske env-verdier.
- `src/env.ts` eksporterer typesikker `env`.
- Import `env` fra `@/env` — aldri `process.env` direkte utenfor env-fil.
- `dotenv-cli` i devDependencies, og alle CLI-scripts i `package.json` som ikke er Next.js bruker `dotenv -e .env.local --`-prefix.

## Feilsøking

- **Build feiler pga manglende variabler**: fyll ut `.env.local` eller legg `.default("")` midlertidig.
- **Client-komponenter kan ikke importere env-feltet**: bekreft at feltet er under `client:`-seksjonen og har `NEXT_PUBLIC_`-prefiks.
- **`dotenv: command not found`**: kjør `pnpm add -D dotenv-cli` på nytt og verifiser at den havnet i `package.json` devDependencies.
- **`pnpm db:push` feiler med `Error: Access token not provided`**: scriptet mangler `dotenv -e .env.local --`-prefix, eller `SUPABASE_ACCESS_TOKEN` mangler i `.env.local`.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 09 i `oppstart/CHECKLIST.md`.

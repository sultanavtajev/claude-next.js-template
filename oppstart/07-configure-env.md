# Steg 07 — Environment

## Pre-flight: sjekk docs

Hent `https://env.t3.gg/docs/nextjs` og bekreft:
- At `@t3-oss/env-nextjs` fortsatt er anbefalt pakke.
- Gjeldende `createEnv`-API (kan ha endret skjema-struktur).

Hent også `https://supabase.com/docs/guides/getting-started/quickstarts/nextjs` for å verifisere at env-nøkkelnavnene (publishable key vs anon key) fortsatt er som under.

## Mål

Opprett `.env.example` med alle Supabase-nøkler dokumentert, og en typesafe `src/env.ts` som validerer env-variabler med Zod.

## Kommandoer

```bash
pnpm add @t3-oss/env-nextjs zod
```

## Filer

### `.env.example`

```bash
# Supabase (fra dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="" # tidligere anon key — trygg å eksponere
SUPABASE_SERVICE_ROLE_KEY=""            # SERVER-ONLY — gir full DB-tilgang, ALDRI eksponer

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

## Sikkerhet

- **`SUPABASE_SERVICE_ROLE_KEY`** gir full tilgang til databasen (bypass RLS). Bruk kun i server-kode (Route Handlers, Server Actions, Edge Functions) som absolutt trenger å omgå RLS (f.eks. admin-oppgaver, webhooks). Aldri importer den i komponenter.
- **Publishable key (tidligere anon key)** er trygg å eksponere i browser — tilgang styres av RLS-policies.
- **Rotér service role key** umiddelbart hvis den lekker: Supabase dashboard → Project Settings → API → "Reset service_role key".

## Forventet resultat

- `.env.example` committes (dokumentasjon).
- `.env.local` eksisterer lokalt (ignoreres av git).
- `src/env.ts` eksporterer typesikker `env`.
- Import `env` fra `@/env` — aldri `process.env` direkte utenfor env-fil.

## Feilsøking

- **Build feiler pga manglende variabler**: fyll ut `.env.local` eller legg `.default("")` midlertidig.
- **Client-komponenter kan ikke importere env-feltet**: bekreft at feltet er under `client:`-seksjonen og har `NEXT_PUBLIC_`-prefiks.

## Avkrysning

Kryss av steg 07 i `oppstart/CHECKLIST.md` når ferdig.

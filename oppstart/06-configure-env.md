# Steg 06 — Environment

## Pre-flight: sjekk docs

Hent `https://env.t3.gg/docs/nextjs` og bekreft:
- At `@t3-oss/env-nextjs` fortsatt er anbefalt pakke.
- Gjeldende `createEnv`-API (kan ha endret skjema-struktur).

Sjekk også om Resend/Supabase krever nye env-nøkler ved å hente:
- `https://resend.com/docs/send-with-nextjs`
- `https://supabase.com/docs/guides/getting-started/quickstarts/nextjs`

## Mål

Opprett `.env.example` med alle nødvendige nøkler dokumentert, og en typesafe `src/env.ts` som validerer env-variabler med Zod.

## Kommandoer

```bash
pnpm add @t3-oss/env-nextjs zod
```

## Filer

### `.env.example`

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# Auth.js
AUTH_SECRET="" # kjør: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# GitHub OAuth (hvis GitHub-provider brukes)
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
```

### `src/env.ts`

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    AUTH_URL: z.string().url(),
    AUTH_GITHUB_ID: z.string().min(1),
    AUTH_GITHUB_SECRET: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
  },
});
```

### `.env.local` (lokal, ikke committes)

Kopier `.env.example` → `.env.local` og fyll inn faktiske verdier. Brukeren må selv:
- Lage en lokal Postgres-database (eller peke på en skytjeneste)
- Generere `AUTH_SECRET` med `openssl rand -base64 32`
- Registrere en GitHub OAuth-app og lime inn ID/secret

## Forventet resultat

- `.env.example` committes (dokumentasjon).
- `.env.local` eksisterer lokalt (ignoreres av git).
- `src/env.ts` eksporterer typesikker `env`.
- Importer `env` fra `@/env` i stedet for `process.env` videre i kodebasen.

## Feilsøking

- **`src/env.ts` feiler ved build fordi variabler mangler**: det er meningen. Fyll inn `.env.local`, eller legg midlertidig `.default("")` på felter som ikke er klare.

## Avkrysning

Kryss av steg 06 i `oppstart/CHECKLIST.md` når ferdig.

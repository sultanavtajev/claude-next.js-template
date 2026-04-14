# Steg 04 — Prisma

## Pre-flight: sjekk docs

Hent `https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql` og bekreft:
- Anbefalt init-kommando (`prisma init --datasource-provider postgresql` er nåværende).
- At `@prisma/client` fortsatt er riktig klientpakke.
- Singleton-mønsteret for `src/lib/db.ts` (kan ha fått ny offisiell template).
- Nye features (f.eks. Prisma Accelerate, Prisma Postgres) som kan være relevante.

## Mål

Installer Prisma, generer et minimalt schema, sett opp singleton-klient.

## Kommandoer

```bash
pnpm add -D prisma
pnpm add @prisma/client
npx prisma init --datasource-provider postgresql
```

## Konfigurasjon

### `prisma/schema.prisma`

Legg til en enkel `User`-modell som starter (utvides av Auth.js i steg 05):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### `src/lib/db.ts`

Singleton-klient (hindrer mange instanser i dev):

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

### `package.json`-scripts

Legg til:

```json
"db:migrate": "prisma migrate dev",
"db:studio": "prisma studio",
"db:generate": "prisma generate",
"postinstall": "prisma generate"
```

## Forventet resultat

- `prisma/schema.prisma` opprettet med `User`-modell.
- `.env` har `DATABASE_URL="..."` placeholder (ikke committes — se steg 06).
- `src/lib/db.ts` eksporterer `db`.
- `pnpm db:generate` kjører uten feil.

## Feilsøking

- **`prisma init` feiler**: sjekk at `pnpm add -D prisma` gikk OK.
- **Ingen lokal database tilgjengelig**: greit å hoppe over `db:migrate` nå — det gjøres manuelt av brukeren når de har en DB. Schema og klient er uansett på plass.

## Avkrysning

Kryss av steg 04 i `oppstart/CHECKLIST.md` når ferdig.

---
name: prisma-migration
description: Endre Prisma-schema og kjøre migrations trygt. Bruk når brukeren ber om å legge til/endre/slette databasemodeller eller felter.
---

# Prisma Migration

## Arbeidsflyt

1. Rediger `prisma/schema.prisma`
2. Kjør `pnpm prisma migrate dev --name <beskrivende-navn>`
3. Prisma genererer SQL-migrasjon i `prisma/migrations/<timestamp>_<navn>/migration.sql`
4. Kjøres mot lokal database + oppdaterer klienten

## Legge til nytt felt

```prisma
model User {
  id    String  @id @default(cuid())
  email String  @unique
  bio   String? // nytt felt — nullable for eksisterende rader
}
```

```bash
pnpm prisma migrate dev --name add_user_bio
```

**Viktig**: hvis feltet ikke er nullable (`bio String` uten `?`), må du gi en default eller seede verdier før migrasjon — ellers feiler den på eksisterende rader.

```prisma
bio String @default("")
```

## Legge til relasjoner

```prisma
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

Velg `onDelete`:
- `Cascade` — slett barn når foreldre slettes (vanlig for eier-relasjoner)
- `SetNull` — sett FK til null (barnet overlever)
- `Restrict` — blokker sletting hvis barn finnes

## Renaming

Prisma migrate **oppdager ikke rename** automatisk — den ser det som drop + create, noe som tømmer data.

Løsning: rediger den genererte `migration.sql` manuelt:

```sql
-- Erstatt:
ALTER TABLE "User" DROP COLUMN "name";
ALTER TABLE "User" ADD COLUMN "fullName" TEXT;

-- Med:
ALTER TABLE "User" RENAME COLUMN "name" TO "fullName";
```

Kjør deretter `pnpm prisma migrate dev` igjen med `--create-only` for å skippe auto-apply, rediger, og `pnpm prisma migrate dev` på ordentlig.

## Produksjonsmigrering

**Ikke `migrate dev` i produksjon** — det er en utviklings-kommando.

```bash
pnpm prisma migrate deploy
```

Kjør dette i CI/deploy-pipeline før appen starter. Deploy feiler hvis migrasjoner er i en ugyldig tilstand.

## Vanlige feil

| Feil | Årsak | Fiks |
|------|-------|------|
| `The column ... contains null values` | NOT NULL lagt til uten default | Legg til default eller gjør kolonnen nullable først, seed data, så NOT NULL |
| Migrasjon feiler halvveis | Foreldet shadow-DB eller låst migrasjon | `pnpm prisma migrate reset` (sletter data — kun lokalt) |
| Client ut av synk | Glemte `prisma generate` | `pnpm prisma generate` eller reinstaller |

## Seed

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  await db.user.create({ data: { email: "test@example.com" } });
}

main().finally(() => db.$disconnect());
```

I `package.json`:

```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

Kjør: `pnpm prisma db seed`.

## Anti-patterns

- ❌ Committe lokalt genererte migrasjoner som inkluderer test-data.
- ❌ Redigere eldre migrasjoner som allerede er kjørt i produksjon — lag en ny migrasjon i stedet.
- ❌ `db push` i produksjon — det er kun for prototyping.

# Steg 05 — Auth.js (NextAuth v5)

## Mål

Installer Auth.js v5 med Prisma-adapter og én provider (GitHub som default — brukeren kan bytte).

## Kommandoer

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

## Konfigurasjon

### Utvid `prisma/schema.prisma`

Legg til Auth.js-modellene ved siden av `User`:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

Oppdater `User`-modellen:
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### `src/lib/auth.ts`

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [GitHub],
  session: { strategy: "database" },
});
```

### `src/app/api/auth/[...nextauth]/route.ts`

```typescript
export { GET, POST } from "@/lib/auth";

// Handlers re-eksporteres fra auth.ts
```

Faktisk — fiks dette: `auth.ts` eksporterer `handlers`, så:

```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

### `src/middleware.ts`

```typescript
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## Forventet resultat

- `next-auth@beta` og `@auth/prisma-adapter` i dependencies.
- `prisma/schema.prisma` har Auth.js-modeller.
- `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts` opprettet.

## Feilsøking

- **`next-auth@beta` versjonsfeil**: bruk `pnpm add next-auth@latest` og sjekk at versjon er 5.x.
- **Bruker vil ha annen provider**: erstatt `GitHub` i `auth.ts` med f.eks. `Google`, `Credentials`, osv.

## Avkrysning

Kryss av steg 05 i `oppstart/CHECKLIST.md` når ferdig.

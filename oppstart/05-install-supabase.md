# Steg 05 — Supabase (database + klienter)

## Pre-flight: sjekk docs

Hent `https://supabase.com/docs/guides/getting-started/quickstarts/nextjs` og `https://supabase.com/docs/guides/auth/server-side/nextjs` og bekreft:
- Nøyaktige pakkenavn (`@supabase/supabase-js`, `@supabase/ssr`).
- Navn på publishable key (har endret seg fra `ANON_KEY` til `PUBLISHABLE_KEY`).
- Gjeldende `createBrowserClient` / `createServerClient` API.
- Hvilken fil-konvensjon som brukes (`middleware.ts` eller `proxy.ts`) for session-refresh.
- Om `supabase.auth.getClaims()` fortsatt er anbefalt over `getSession()`.

## Mål

Installer Supabase-klienter og sett opp server/browser/proxy-utilities. Selve databasen og auth-brukere bor på Supabase — ingen lokal Postgres.

## Forutsetninger

- Bruker har opprettet et Supabase-prosjekt og har tilgang til:
  - Project URL
  - Publishable key (tidligere `anon key`)
  - Service role key (server-only, må ikke commits)

## Kommandoer

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

## Filer

### `src/lib/supabase/client.ts` — Browser-klient (Client Components)

```typescript
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/env";

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
```

### `src/lib/supabase/server.ts` — Server-klient (Server Components, Actions, Route Handlers)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components kan ikke sette cookies — proxy håndterer det
          }
        },
      },
    }
  );
}
```

### `src/lib/supabase/proxy.ts` — Session-refresh (kalt fra proxy.ts i roten)

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Validér JWT serverside (aldri stol på getSession() i server-kontekst)
  await supabase.auth.getClaims();

  return response;
}
```

### `src/proxy.ts` — Next.js 16+ proxy (roten av `src/`)

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## Migrations (valgfritt, men anbefalt)

Installer Supabase CLI for lokale migrasjoner:

```bash
pnpm add -D supabase
npx supabase init
npx supabase link --project-ref {{SUPABASE_PROJECT_REF}}
```

Opprett migrasjon:
```bash
npx supabase migration new <navn>
# rediger generert .sql-fil i supabase/migrations/
npx supabase db push
```

Generer TypeScript-typer fra schema:
```bash
npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

Legg til i `package.json`:
```json
"db:types": "supabase gen types typescript --linked > src/lib/supabase/database.types.ts",
"db:push": "supabase db push",
"db:new": "supabase migration new"
```

## Forventet resultat

- `@supabase/supabase-js` og `@supabase/ssr` i dependencies.
- `src/lib/supabase/` har `client.ts`, `server.ts`, `proxy.ts`.
- `src/proxy.ts` refresher session på hver request.
- (Valgfritt) `supabase/`-mappe med migrations, lenket til prosjekt.

## Feilsøking

- **`cookies()` feiler i Server Components**: bekreft at du bruker `await cookies()` (Next 15+).
- **Session forsvinner mellom requests**: sjekk at `src/proxy.ts` kjører for ruten (matcher dekker).
- **TypeScript-feil på Supabase-kall**: kjør `pnpm db:types` hvis du har generert types.

## Avkrysning

Kryss av steg 05 i `oppstart/CHECKLIST.md` når ferdig.

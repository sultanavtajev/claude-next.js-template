# Steg 05 — Supabase (database + klienter)

## Pre-flight: sjekk docs

Hent `https://supabase.com/docs/guides/getting-started/quickstarts/nextjs` og `https://supabase.com/docs/guides/auth/server-side/nextjs` og bekreft:
- Nøyaktige pakkenavn (`@supabase/supabase-js`, `@supabase/ssr`).
- Navn på publishable key (har endret seg fra `ANON_KEY` til `PUBLISHABLE_KEY`).
- Gjeldende `createBrowserClient` / `createServerClient` API.
- Hvilken fil-konvensjon som brukes (`middleware.ts` eller `proxy.ts`) for session-refresh.
- Om `supabase.auth.getClaims()` fortsatt er anbefalt over `getSession()`.

## Mål

Gjennomgå Supabase-prosjekt med brukeren (opprett hvis nødvendig), fyll inn `{{SUPABASE_PROJECT_REF}}`-placeholderen, og sett opp klienter (server/browser/proxy).

## Del 1 — Supabase-prosjekt-gjennomgang

### 1. Spør om bruker allerede har Supabase-prosjekt

Bruk `AskUserQuestion`:

| Spørsmål | Header | Valg |
|----------|--------|------|
| Har du allerede et Supabase-prosjekt klart for denne appen? | Supabase-prosjekt | Ja, har project ref klar · Nei, må opprette nå · Hopp over Supabase for nå |

### 2. Hvis "må opprette nå"

Guide brukeren:

1. Si: "Gå til https://supabase.com/dashboard/new og opprett et nytt prosjekt. Velg region nær brukerne (for Norge: Frankfurt/EU West), og lagre database-passordet et sikkert sted."
2. Vent til brukeren bekrefter at prosjektet er klart.
3. Si: "Gå til Project Settings → Data API → kopier **Project URL** og **Publishable key** (tidligere anon key). Project ref-en er delen før `.supabase.co` i URLen."
4. Fortsett til steg 3.

### 3. Samle inn nøkler via AskUserQuestion

Bruk "Other"-opsjonen for fritekst:

| Spørsmål | Header |
|----------|--------|
| Hva er Supabase project ref? (f.eks. `abcdefghijklmnop`) | Project ref |
| Oppgi `NEXT_PUBLIC_SUPABASE_URL` (full URL) | Supabase URL |
| Oppgi `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key |
| Oppgi `SUPABASE_SERVICE_ROLE_KEY` (kopier fra dashboard) | Service role key |

### 4. Fyll inn placeholders og skriv til `.env.local`

Søk-og-erstatt `{{SUPABASE_PROJECT_REF}}` i:
- `CLAUDE.md`
- `.claude/mcp-servers.json`

Skriv nøklene til `.env.local` (opprett filen hvis den ikke finnes — den er allerede i `.gitignore`):

```
NEXT_PUBLIC_SUPABASE_URL=<verdi fra spørsmål 3>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<verdi fra spørsmål 3>
SUPABASE_SERVICE_ROLE_KEY=<verdi fra spørsmål 3>
```

### 5. Hvis "hopp over"

Behold `{{SUPABASE_PROJECT_REF}}`-placeholderen, hopp over resten av steget, og hopp også over steg 06 (Supabase Auth). Informér brukeren om at de må kjøre disse manuelt senere.

## Del 2 — Installer klienter

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

## Del 3 — Migrations (valgfritt, men anbefalt)

Installer Supabase CLI for lokale migrasjoner og link til prosjektet:

```bash
pnpm add -D supabase
npx supabase init
npx supabase link --project-ref <project-ref fra Del 1>
```

Når du kjører `link`, bruk den faktiske project ref brukeren oppga (ikke placeholder).

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

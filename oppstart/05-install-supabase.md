# Steg 05 — Supabase (prosjekt, klienter, auth)

## Pre-flight: sjekk docs

Hent `https://supabase.com/docs/guides/getting-started/quickstarts/nextjs` og `https://supabase.com/docs/guides/auth/server-side/nextjs` og bekreft:
- Nøyaktige pakkenavn (`@supabase/supabase-js`, `@supabase/ssr`).
- Navn på publishable key (har endret seg fra `ANON_KEY` til `PUBLISHABLE_KEY`).
- Gjeldende `createBrowserClient` / `createServerClient` API.
- Hvilken fil-konvensjon som brukes (`middleware.ts` eller `proxy.ts`) for session-refresh.
- Om `supabase.auth.getClaims()` fortsatt er anbefalt over `getSession()`.

## Mål

Ett samlet steg for alt Supabase-arbeid:
1. Gjennomgå Supabase-prosjekt med brukeren (opprett hvis nødvendig) og samle inn nøkler
2. Installer og sett opp klienter (server/browser/proxy)
3. Sett opp Supabase Auth (login/signup-sider + RLS-retningslinjer)
4. (Valgfritt) Installer Supabase CLI for migrations

## Sjekkliste

### Del 1 — Prosjekt
- [ ] Pre-flight docs-sjekk kjørt
- [ ] `AskUserQuestion` stilt: har-prosjekt / må-opprette / hopp-over
- [ ] (Hvis må-opprette) bruker har bekreftet at prosjekt er klart i Supabase dashboard
- [ ] Project ref, URL, publishable key, service role key samlet via `AskUserQuestion`
- [ ] `{{SUPABASE_PROJECT_REF}}` erstattet i `CLAUDE.md` og `.claude/mcp-servers.json`
- [ ] Nøkler skrevet til `.env.local`

### Del 2 — Klienter
- [ ] `@supabase/supabase-js` og `@supabase/ssr` installert via `pnpm add`
- [ ] `src/lib/supabase/client.ts` opprettet (browser-klient)
- [ ] `src/lib/supabase/server.ts` opprettet (server-klient med cookies)
- [ ] `src/lib/supabase/proxy.ts` opprettet (session-refresh-helper)
- [ ] `src/proxy.ts` opprettet (Next.js 16+ proxy-fil)

### Del 3 — Auth
- [ ] `src/app/login/page.tsx` opprettet (Server Component med form)
- [ ] `src/app/login/actions.ts` opprettet (login/signup/logout Server Actions)
- [ ] RLS-retningslinje dokumentert (skal brukes for alle brukerdata-tabeller)

### Del 4 — Migrations (valgfri)
- [ ] `supabase`-CLI installert som dev-dependency
- [ ] `npx supabase init` kjørt
- [ ] `npx supabase link --project-ref <ref>` kjørt
- [ ] `db:types`, `db:push`, `db:new`-scripts lagt til i `package.json`

Kryss av hver `[ ]` → `[x]` fortløpende mens du jobber. Når alle relevante bokser er `[x]` (Del 4 er valgfri), marker steg 05 i `oppstart/CHECKLIST.md` og gå til steg 06. Hvis bruker valgte "hopp-over" i Del 1, hoppes Del 2–4 over også.

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

Behold `{{SUPABASE_PROJECT_REF}}`-placeholderen og hopp over resten av dette steget. Informér brukeren om at klienter, auth og RLS må settes opp manuelt senere.

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

## Del 3 — Supabase Auth (login, signup, logout, RLS)

### Pre-flight

Hent `https://supabase.com/docs/guides/auth/server-side/nextjs` og bekreft:
- Anbefalte auth-metoder i gjeldende versjon.
- Login/signup-helper-funksjonene.
- Hvordan RLS skal settes opp i kombinasjon med auth.

### `src/app/login/page.tsx` — Innloggingsside (Server Component + Server Action)

```tsx
import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <form className="flex flex-col gap-4 max-w-sm mx-auto p-8">
      <label htmlFor="email">E-post</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Passord</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Logg inn</button>
      <button formAction={signup}>Registrer</button>
    </form>
  );
}
```

### `src/app/login/actions.ts` — Server Actions for login/signup/logout

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=invalid");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=invalid");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
```

### Auth-sjekk i Server Components

```tsx
// src/app/(protected)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <div>Hei, {user.email}</div>;
}
```

**Viktig**: bruk alltid `supabase.auth.getUser()` (validerer JWT) — ikke `getSession()` som bare leser cookie uten verifisering.

### Row Level Security (RLS)

**Alltid aktiver RLS på tabeller med brukerdata.** Legg det til i første migrasjon:

```sql
-- I supabase/migrations/<timestamp>_<navn>.sql
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brukere leser egne posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Brukere skriver egne posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);
```

Uten RLS er data tilgjengelig for alle med publishable key (som er offentlig).

### OAuth (valgfritt)

Legges til i Supabase dashboard → Authentication → Providers → GitHub/Google/etc. Ingen kode-endringer nødvendig utover login-button:

```tsx
const { error } = await supabase.auth.signInWithOAuth({
  provider: "github",
  options: { redirectTo: `${location.origin}/auth/callback` },
});
```

Og en callback-route: `src/app/auth/callback/route.ts` som håndterer code exchange. Se docs for detaljer.

## Del 4 — Migrations (valgfritt, men anbefalt)

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
- `src/app/login/page.tsx` og `src/app/login/actions.ts` fungerer for e-post/passord.
- `supabase.auth.getUser()` kan kalles i Server Components/Actions.
- RLS-retningslinje etablert for nye tabeller.
- (Valgfritt) `supabase/`-mappe med migrations, lenket til prosjekt.

## Feilsøking

- **`cookies()` feiler i Server Components**: bekreft at du bruker `await cookies()` (Next 15+).
- **Session forsvinner mellom requests**: sjekk at `src/proxy.ts` kjører for ruten (matcher dekker).
- **TypeScript-feil på Supabase-kall**: kjør `pnpm db:types` hvis du har generert types.
- **`getUser()` returnerer `null` selv etter login**: proxy kjører ikke for ruten — sjekk matcher.
- **"Invalid JWT"**: JWT-secret i Supabase har rotert; logg ut og inn.
- **Passord-validering for svak**: justér i Supabase dashboard → Authentication → Policies.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]` (Del 4 er valgfri), kryss av steg 05 i `oppstart/CHECKLIST.md`.

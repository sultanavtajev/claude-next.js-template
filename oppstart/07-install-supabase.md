# Steg 07 — Supabase (prosjekt, klienter, auth)

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
- [ ] `{{SUPABASE_PROJECT_REF}}` erstattet i `CLAUDE.md` og `.mcp.json`
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
- [ ] `tsx` installert som dev-dependency (for snapshot-script)
- [ ] `scripts/supabase-snapshot.ts` opprettet
- [ ] `db:types`, `db:push`, `db:new`, `db:snapshot`-scripts lagt til i `package.json` med `dotenv -e .env.local --`-prefix (krever `dotenv-cli` fra steg 09 — kan installeres her hvis steg 09 ikke er kjørt)
- [ ] `pnpm db:snapshot` kjørt én gang, genererte `teknisk/dokumentasjon/supabase-snapshot.md`

Kryss av hver `[ ]` → `[x]` fortløpende mens du jobber. Når alle relevante bokser er `[x]` (Del 4 er valgfri), marker steg 07 i `oppstart/CHECKLIST.md` og gå til steg 08. Hvis bruker valgte "hopp-over" i Del 1, hoppes Del 2–4 over også.

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
- `.mcp.json`

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

### `src/lib/supabase/proxy.ts` — Session-refresh (chained fra src/proxy.ts)

Denne funksjonen tar en eksisterende `response` (fra i18n-middleware) og refresher Supabase-session på den. Signaturen er **annerledes** enn standard Supabase-dokumentasjon fordi vi må chainer fra next-intl.

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest, type NextResponse as NextResponseType } from "next/server";
import { env } from "@/env";

export async function updateSession(
  request: NextRequest,
  response: NextResponseType = NextResponse.next({ request })
) {
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

### `src/proxy.ts` — Chainer i18n + Supabase (erstatter steg 05 sin standalone-versjon)

I steg 05 opprettet vi en standalone i18n-proxy. Nå erstatter vi den med en chained versjon som først kjører locale-routing, deretter Supabase session-refresh:

```typescript
import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);
  return updateSession(request, response);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Viktig**: rekkefølgen er kritisk — i18n først (router til riktig locale), deretter session-refresh (skriver cookies på responsen). Hvis du gjør omvendt, går Supabase-cookiene tapt når i18n returnerer ny response.

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

Installer Supabase CLI og `dotenv-cli` for lokale migrasjoner og link til prosjektet:

```bash
pnpm add -D supabase dotenv-cli
npx supabase init
dotenv -e .env.local -- npx supabase link --project-ref <project-ref fra Del 1>
```

Når du kjører `link`, bruk den faktiske project ref brukeren oppga (ikke placeholder). `dotenv -e .env.local --`-prefiksen sørger for at `SUPABASE_ACCESS_TOKEN` er tilgjengelig for CLI-en (Supabase CLI leser ikke `.env.local` selv). Hvis steg 09 allerede er kjørt og installerte `dotenv-cli`, kan `dotenv-cli` droppes fra `pnpm add`-linjen her.

Opprett migrasjon:
```bash
dotenv -e .env.local -- npx supabase migration new <navn>
# rediger generert .sql-fil i supabase/migrations/
dotenv -e .env.local -- npx supabase db push
```

Generer TypeScript-typer fra schema:
```bash
dotenv -e .env.local -- npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

Installer `tsx` som dev-dependency (brukes av snapshot-scriptet):
```bash
pnpm add -D tsx
```

Opprett `scripts/supabase-snapshot.ts` (dumper full schema-oversikt til markdown):

```typescript
// scripts/supabase-snapshot.ts
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

function sh(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (err: unknown) {
    return `⚠️ ${(err as Error).message}`;
  }
}

const now = new Date().toISOString();
const sections: Array<[string, string]> = [];

// Migrasjoner
sections.push(["Migrasjoner", "```\n" + sh("npx supabase migration list --linked") + "\n```"]);

// Edge functions
sections.push(["Edge Functions", "```\n" + sh("npx supabase functions list") + "\n```"]);

// Schema dump (CREATE TABLE + CREATE POLICY)
const schema = sh("npx supabase db dump --linked --schema-only");

const tables = schema.match(/CREATE TABLE[\\s\\S]*?;/g) || [];
sections.push([
  "Tabeller",
  tables.length
    ? tables.map((t) => "```sql\n" + t + "\n```").join("\n\n")
    : "_Ingen tabeller funnet._",
]);

const policies = schema.match(/CREATE POLICY[\\s\\S]*?;/g) || [];
sections.push([
  "RLS-policies",
  policies.length
    ? policies.map((p) => "```sql\n" + p + "\n```").join("\n\n")
    : "_Ingen policies funnet. Husk å aktivere RLS på alle brukerdata-tabeller._",
]);

const triggers = schema.match(/CREATE TRIGGER[\\s\\S]*?;/g) || [];
sections.push([
  "Triggers",
  triggers.length
    ? triggers.map((t) => "```sql\n" + t + "\n```").join("\n\n")
    : "_Ingen triggers._",
]);

const functions = schema.match(/CREATE (?:OR REPLACE )?FUNCTION[\\s\\S]*?\\$\\$/g) || [];
sections.push([
  "Database Functions",
  functions.length
    ? functions.map((f) => "```sql\n" + f + "\n$$\n```").join("\n\n")
    : "_Ingen custom functions._",
]);

sections.push([
  "Hvordan oppdatere",
  "Denne filen regenereres automatisk av `.claude/hooks/scripts/post-migration-snapshot.js` når `supabase/migrations/*.sql` endres.\n\nManuell regenerering: `pnpm db:snapshot`\n\n**Før DB-arbeid**: les denne filen. For live-data bruk Supabase MCP (`mcp__supabase__list_tables`, `get_advisors`, osv.).",
]);

let md = `# Supabase Snapshot\n\nGenerert: ${now}\n\n`;
md += "> **Auto-generert** — ikke rediger manuelt, endringer overskrives.\n\n";
for (const [title, content] of sections) {
  md += `## ${title}\n\n${content}\n\n`;
}

mkdirSync("teknisk/dokumentasjon", { recursive: true });
writeFileSync("teknisk/dokumentasjon/supabase-snapshot.md", md);
console.log("✓ Snapshot skrevet til teknisk/dokumentasjon/supabase-snapshot.md");
```

Legg til i `package.json` scripts (alle wraps med `dotenv -e .env.local --` så CLI-tooling plukker opp `SUPABASE_ACCESS_TOKEN` og andre vars fra `.env.local`):
```json
"db:types": "dotenv -e .env.local -- supabase gen types typescript --linked > src/lib/supabase/database.types.ts",
"db:push": "dotenv -e .env.local -- supabase db push",
"db:new": "dotenv -e .env.local -- supabase migration new",
"db:snapshot": "dotenv -e .env.local -- tsx scripts/supabase-snapshot.ts"
```

`db:snapshot` trenger dotenv-prefiks fordi snapshot-scriptet spawner `npx supabase`-child-prosesser som arver env fra parent. Uten prefiks ville `supabase db dump --linked` feile med "Access token not provided".

Kjør én gang for å verifisere:
```bash
pnpm db:snapshot
```

Etter dette: Claude Code-hooken `.claude/hooks/scripts/post-migration-snapshot.js` auto-regenererer snapshot hver gang `supabase/migrations/*.sql` endres.

## Forventet resultat

- `@supabase/supabase-js` og `@supabase/ssr` i dependencies.
- `src/lib/supabase/` har `client.ts`, `server.ts`, `proxy.ts`.
- `src/proxy.ts` refresher session på hver request.
- `src/app/login/page.tsx` og `src/app/login/actions.ts` fungerer for e-post/passord.
- `supabase.auth.getUser()` kan kalles i Server Components/Actions.
- RLS-retningslinje etablert for nye tabeller.
- (Valgfritt) `supabase/`-mappe med migrations, lenket til prosjekt.
- (Valgfritt, hvis Del 4 kjørt) `scripts/supabase-snapshot.ts` + `teknisk/dokumentasjon/supabase-snapshot.md` finnes. `pnpm db:snapshot` kan regenerere snapshoten manuelt; Claude Code-hook gjør det automatisk ved migrasjons-endringer.

## Feilsøking

- **`cookies()` feiler i Server Components**: bekreft at du bruker `await cookies()` (Next 15+).
- **Session forsvinner mellom requests**: sjekk at `src/proxy.ts` kjører for ruten (matcher dekker).
- **TypeScript-feil på Supabase-kall**: kjør `pnpm db:types` hvis du har generert types.
- **`getUser()` returnerer `null` selv etter login**: proxy kjører ikke for ruten — sjekk matcher.
- **"Invalid JWT"**: JWT-secret i Supabase har rotert; logg ut og inn.
- **Passord-validering for svak**: justér i Supabase dashboard → Authentication → Policies.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]` (Del 4 er valgfri), kryss av steg 07 i `oppstart/CHECKLIST.md`.

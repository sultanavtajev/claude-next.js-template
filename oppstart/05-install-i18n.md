# Steg 05 — Internasjonalisering (next-intl)

## Pre-flight: sjekk docs

Hent `https://next-intl.dev/docs/getting-started/app-router` og bekreft:
- At `next-intl` fortsatt er anbefalt for Next.js App Router.
- Gjeldende versjon av `createMiddleware` / `createNextIntlPlugin` — APIet har utviklet seg mellom major-versjoner.
- Om routing-fil-konvensjonen fortsatt er `src/i18n/routing.ts` + `src/i18n/request.ts`.
- Hvilken proxy/middleware-fil-konvensjon som brukes (Next.js 16+ bruker `proxy.ts`, eldre Next bruker `middleware.ts`).

## Mål

Etabler **typesafe, Server Component-native i18n** før Supabase-steget. Dette er viktig fordi:
- Routing blir `/[locale]/...` — alt app-innhold flyttes under `src/app/[locale]/`
- Proxy/middleware må håndtere **både** locale-deteksjon og (senere) Supabase session-refresh
- Design system fra steg 04 kan nå adresseres per locale ved behov (f.eks. forskjellige fonts for cyrilliske språk)

## Sjekkliste

### Del 1 — Locale-valg
- [ ] `AskUserQuestion` stilt: hvilke locales prosjektet skal støtte + hvilken er default
- [ ] Locale-valg dokumentert (f.eks. `default: 'no'`, `locales: ['no', 'en']`)

### Del 2 — Installasjon
- [ ] Pre-flight docs-sjekk kjørt
- [ ] `pnpm add next-intl` kjørt

### Del 3 — Konfigurasjon
- [ ] `src/i18n/routing.ts` opprettet med `defineRouting`
- [ ] `src/i18n/request.ts` opprettet med `getRequestConfig`
- [ ] `src/i18n/navigation.ts` opprettet (typesafe `Link`, `redirect`, etc.)
- [ ] `messages/<locale>.json` opprettet for hver locale (minimal innhold)
- [ ] `next.config.ts` oppdatert med `createNextIntlPlugin`

### Del 4 — App-restrukturering
- [ ] `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` flyttet til `src/app/[locale]/`
- [ ] `src/app/[locale]/layout.tsx` mottar `params: { locale }` og wrapper `<NextIntlClientProvider>`
- [ ] (Valgfritt) `src/app/not-found.tsx` på root-nivå for 404 utenfor locale-route

### Del 5 — Proxy-oppsett
- [ ] `src/proxy.ts` opprettet med next-intl-middleware
- [ ] Klar for at steg 06 chainer Supabase session-refresh etterpå

### Del 6 — CLAUDE.md
- [ ] Ny seksjon "Internasjonalisering (låst)" med valgte locales + regel om at brukervendt tekst aldri hardkodes

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 05 i `oppstart/CHECKLIST.md` og gå til steg 06.

## Del 1 — Locale-valg (AskUserQuestion)

Still brukeren disse spørsmålene via `AskUserQuestion`:

| Spørsmål | Header | Valg (bruker kan alltid velge "Other" for fritekst) |
|----------|--------|-----|
| Hvilken locale er **default**? | Default locale | `no` (norsk) · `en` (engelsk) · `sv` (svensk) · `da` (dansk) |
| Skal appen støtte flere locales? | Ekstra locales | Bare default · Default + engelsk · Nordisk pakke (no + en + sv + da) · Egendefinert liste |

Bruk svarene til å bygge `locales`-array. Eksempel:
- Default: `no`, Ekstra: "Default + engelsk" → `locales: ['no', 'en']`, `defaultLocale: 'no'`
- Default: `en`, Ekstra: "Bare default" → `locales: ['en']`, `defaultLocale: 'en'`
- Default: `no`, Ekstra: "Nordisk pakke" → `locales: ['no', 'en', 'sv', 'da']`, `defaultLocale: 'no'`

Ved "Egendefinert": spør bruker med fritekst om komma-separert liste (f.eks. `no, en, fr, de`).

## Del 2 — Installasjon

```bash
pnpm add next-intl
```

## Del 3 — Konfigurasjon

### `src/i18n/routing.ts`

```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["no", "en"], // <-- bruker-valgt
  defaultLocale: "no",    // <-- bruker-valgt
  localePrefix: "as-needed", // /no prefikses ikke, andre locales får /en, /sv osv.
});
```

### `src/i18n/navigation.ts`

```typescript
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

### `src/i18n/request.ts`

```typescript
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

### `messages/no.json` (og `en.json`, `sv.json`, `da.json` etter behov)

Start minimalt — utvides etterhvert som Claude legger til UI-tekst:

```json
{
  "Home": {
    "title": "Velkommen",
    "description": "Dette er startsiden."
  }
}
```

For `en.json`:
```json
{
  "Home": {
    "title": "Welcome",
    "description": "This is the landing page."
  }
}
```

### `next.config.ts`

```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {
  // ... eksisterende config fra create-next-app
};

export default withNextIntl(nextConfig);
```

## Del 4 — App-restrukturering

Flytt app-filene under `[locale]`-segment:

```bash
mkdir src/app/[locale]
mv src/app/layout.tsx src/app/[locale]/layout.tsx
mv src/app/page.tsx src/app/[locale]/page.tsx
mv src/app/globals.css src/app/[locale]/globals.css
# eller behold globals.css på root — se next-intl docs
```

**Oppdater `src/app/[locale]/layout.tsx`**:

```tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import "./globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

**Oppdater `src/app/[locale]/page.tsx`** med `useTranslations`:

```tsx
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Ved async params i page.tsx: const { locale } = await params; setRequestLocale(locale);
  const t = useTranslations("Home");
  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </main>
  );
}
```

## Del 5 — Proxy-oppsett

Opprett `src/proxy.ts` med next-intl sin middleware. Denne filen utvides i steg 06 til å chainer Supabase session-refresh.

```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Matcher alle ruter unntatt statiske filer og API-ruter
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Viktig for steg 06**: dette blir erstattet av en chained versjon når Supabase-proxy legges til:

```typescript
// Steg 06 vil oppdatere dette til noe slikt:
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/proxy";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);
  return updateSession(request, response);
}
```

## Del 6 — CLAUDE.md-oppdatering

Legg til ny seksjon i `CLAUDE.md` (rett før "Harde regler"):

```markdown
## Internasjonalisering (låst)

- **Default locale**: `<bruker-valgt>`
- **Støttede locales**: `<bruker-valgt liste>`
- **Message-filer**: `messages/<locale>.json`
- **Routing**: `src/app/[locale]/...` med `localePrefix: "as-needed"`

### Regel (streng håndheving)

All brukervendt tekst **skal** gå gjennom `next-intl`. Ingen hardkoding av norske/engelske strenger i JSX.

```tsx
// ✅ Riktig
const t = useTranslations("Home");
return <h1>{t("title")}</h1>;

// ❌ Feil
return <h1>Velkommen</h1>;
```

Ved ny UI-tekst: legg til key i **alle** `messages/*.json`-filer (ikke bare default). `nextjs-reviewer`-agenten flagger hardkodet tekst.

Unntak (hardkoding tillatt):
- Logging og feilmeldinger i server-kode som ikke eksponeres til bruker
- Kommentarer og dev-tools
- Konstanter som ikke er oversettelsesmål (URLer, feltsnavn i DB)
```

## Forventet resultat

- `next-intl` i dependencies.
- `src/i18n/` med routing, request, navigation.
- `messages/<locale>.json` for hver valgt locale.
- `src/app/[locale]/...` (flyttet fra `src/app/...`).
- `src/proxy.ts` med next-intl middleware.
- `next.config.ts` wrappet med `createNextIntlPlugin`.
- `CLAUDE.md` har "Internasjonalisering (låst)"-seksjon.

## Feilsøking

- **`useTranslations must be used in a Server Component` / liknende**: sjekk at `NextIntlClientProvider` wrapper komponenten, eller bytt til `getTranslations` for Server Components som skal lage serverside-rendered tekst.
- **404 på `/`**: hvis `localePrefix: "always"` er satt må URLen være `/no/` eller `/en/`. Bruk `"as-needed"` for å la default-locale være prefikseløs.
- **TypeScript-feil på message-keys**: legg til `messages.d.ts` med `declare global { type Messages = typeof import("../messages/no.json") }` — next-intl docs har full oppsett.
- **Hydration mismatch når locale endres**: bekreft at `<html lang={locale}>` er korrekt i `[locale]/layout.tsx`.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 05 i `oppstart/CHECKLIST.md`.

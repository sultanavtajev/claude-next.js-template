# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Stack

- **Next.js** (seneste) — App Router, TypeScript, Turbopack
- **Tailwind CSS** — styling
- **shadcn/ui** — komponentbibliotek (basert på Radix + Tailwind)
- **Supabase** — database (Postgres), auth, storage, realtime, edge functions
- **@supabase/ssr** — server-side Supabase-klient for Next.js
- **Zod** — runtime-validering av input
- **ESLint + Prettier** — linting og formatering

## Mappestruktur

```
src/
├── app/                     # App Router — Server Components by default
│   ├── (auth)/              # route group for auth-sider
│   ├── login/               # login/signup med Server Actions
│   ├── auth/callback/       # OAuth callback-route
│   ├── api/                 # route handlers
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn-komponenter
│   └── ...
├── lib/
│   └── supabase/
│       ├── client.ts        # createBrowserClient (Client Components)
│       ├── server.ts        # createServerClient (Server Components/Actions)
│       ├── proxy.ts         # updateSession-helper (kalt fra proxy.ts)
│       ├── admin.ts         # service role-klient (server-only, bypass RLS)
│       └── database.types.ts # generert via `pnpm db:types`
├── env.ts                   # typesikker env-validering
└── proxy.ts                 # Next.js 16+ (tidligere middleware.ts)
supabase/
├── migrations/              # SQL-migrasjoner
└── config.toml              # lokal Supabase CLI-config
```

## Kommandoer

- `pnpm dev` — dev-server med Turbopack
- `pnpm build` — produksjonsbygg
- `pnpm start` — start produksjonsbygg
- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm db:new <navn>` — ny Supabase-migrasjon
- `pnpm db:push` — kjør migrasjoner mot linket prosjekt
- `pnpm db:types` — generer TypeScript-typer fra schema
- `npx supabase start` — kjør Supabase lokalt (Docker) — valgfritt

## Design system (låst)

<!--
Denne seksjonen fylles ut i oppstart-steg 04 basert på svar fra prosjektdialogen.
Inntil ferdig utfylt er defaultverdiene shadcn/ui sin standard (Slate + Inter).
-->

- **Stil**: <fylles inn i steg 04 — f.eks. Minimalism / Bento grid / Flat design>
- **Palette**: <f.eks. Slate-basert, cool-neutral>
- **Heading-font**: <f.eks. Inter>
- **Body-font**: <f.eks. Inter>
- **Dark mode**: <ja/nei/begge>

**Regel**: nye komponenter skal følge denne stilen. Ikke introduser brutalism, claymorphism, neumorphism eller andre stiler med mindre brukeren eksplisitt ber om det. Fargepalette hentes fra CSS-variablene i `src/app/globals.css` — aldri hardkode hex/rgb i komponenter.

## Harde regler

1. **Server Components by default.** Bruk `"use client"` kun når nødvendig (interaktivitet, hooks, browser-API).
2. **Zod for all input.** Alle Server Actions og route handlers skal validere input med Zod før videre prosessering.
3. **Ingen `any`.** Bruk `unknown` + narrowing hvis typen er ukjent.
4. **Env-variabler gjennom `src/env.ts`.** Aldri bruk `process.env` direkte utenfor env-fil — valider med Zod.
5. **`createClient` fra riktig fil.** `@/lib/supabase/client` i Client Components, `@/lib/supabase/server` i Server Components/Actions/Route Handlers.
6. **Alltid `supabase.auth.getUser()` server-side.** Ikke `getSession()` — den verifiserer ikke JWT.
7. **RLS på alle tabeller med brukerdata.** Publishable key er offentlig — tilgangskontroll er RLS.
8. **`SUPABASE_SERVICE_ROLE_KEY` kun i `@/lib/supabase/admin`.** Aldri i klient-kode. Kun for admin-flyter som bevisst skal omgå RLS.
9. **Route handlers returnerer `Response` eller `NextResponse`.** Ingen direkte `res.json(...)`.

## Hvor ting hører hjemme

| Trenger | Plass |
|---------|-------|
| Ny shadcn-komponent | `src/components/ui/` via `npx shadcn@latest add` |
| Nytt API-endepunkt | `src/app/api/<rute>/route.ts` |
| Server Action | Inline i Server Component eller i `src/lib/actions/` |
| Database-endring | `supabase/migrations/<timestamp>_<navn>.sql` |
| Ny RLS-policy | Samme migrasjonsfil som tabellen |
| Ny auth-provider | Aktiveres i Supabase dashboard → Providers |
| Shared utility | `src/lib/utils.ts` eller egen fil i `src/lib/` |

## Referanser

### Prosjekt

- GitHub: `{{GITHUB_REPO}}`
- Vercel: `{{VERCEL_PROJECT}}`
- Supabase: `{{SUPABASE_PROJECT_REF}}`
- Resend: API-nøkkel i `RESEND_API_KEY`

### Stack-dokumentasjon

- Next.js: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs
- Supabase Next.js-guide: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase Auth SSR: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase CLI: https://supabase.com/docs/guides/cli
- ui-ux-pro-max-skill: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- T3 Env: https://env.t3.gg/docs/nextjs

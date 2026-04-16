# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

<!--
@AGENTS.md-referansen under legges til i oppstart-steg 02 etter at
create-next-app har generert AGENTS.md. Ikke fjern den manuelt —
den sørger for at Next.js-spesifikke breaking-change-advarsler og
agent-instrukser leses inn sammen med CLAUDE.md.
-->

## Stack

- **Next.js** (seneste) — App Router, TypeScript, Turbopack
- **Tailwind CSS** — styling
- **shadcn/ui** — komponentbibliotek (basert på Radix + Tailwind)
- **next-intl** — internasjonalisering (i18n) med Server Components-støtte
- **Supabase** — database (Postgres), auth, storage, realtime, edge functions
- **@supabase/ssr** — server-side Supabase-klient for Next.js
- **@sultanavtajev/element-picker** — dev-only inspector (Ctrl+Shift+X) for AI-assistert UI-utvikling
- **Zod** — runtime-validering av input
- **ESLint + Prettier** — linting og formatering

## Mappestruktur

```
src/
├── app/
│   └── [locale]/            # locale-scoped routes (next-intl)
│       ├── (auth)/
│       ├── login/           # login/signup med Server Actions
│       ├── auth/callback/   # OAuth callback-route
│       ├── api/             # route handlers
│       └── layout.tsx
├── components/
│   ├── ui/                  # shadcn-komponenter
│   └── ...
├── i18n/
│   ├── routing.ts           # locale-konfig + defaultLocale
│   ├── navigation.ts        # typesafe Link/redirect/router
│   └── request.ts           # getRequestConfig (message-loading per locale)
├── lib/
│   └── supabase/
│       ├── client.ts        # createBrowserClient (Client Components)
│       ├── server.ts        # createServerClient (Server Components/Actions)
│       ├── proxy.ts         # updateSession-helper (chained etter i18n i proxy.ts)
│       ├── admin.ts         # service role-klient (server-only, bypass RLS)
│       └── database.types.ts # generert via `pnpm db:types`
├── env.ts                   # typesikker env-validering
└── proxy.ts                 # chainer next-intl + Supabase session (Next.js 16+)
messages/
├── no.json                  # norske oversettelser
├── en.json                  # engelske
└── ...                      # flere locales etter behov
supabase/
├── migrations/              # SQL-migrasjoner
└── config.toml              # lokal Supabase CLI-config
design-system/
├── MASTER.md                # global source of truth (farger, typografi, spacing)
└── pages/                   # side-spesifikke overrides (kun avvik fra MASTER)
    └── <page-slug>.md
teknisk/
├── README.md
├── dokumentasjon/           # prosjekt-docs + chat-sammendrag fra Claude-sesjoner
└── sjekkliste/              # sjekklister opprettet av /2.0-task og /2.1-task-team
```

## Kommandoer

### Shell

- `pnpm dev` — dev-server med Turbopack
- `pnpm build` — produksjonsbygg
- `pnpm start` — start produksjonsbygg
- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm db:new <navn>` — ny Supabase-migrasjon
- `pnpm db:push` — kjør migrasjoner mot linket prosjekt
- `pnpm db:types` — generer TypeScript-typer fra schema
- `dotenv -e .env.local -- npx supabase start` — kjør Supabase lokalt (Docker) — valgfritt

> **Env-loading**: alle Supabase CLI- og custom scripts wraps med `dotenv -e .env.local --`-prefix (konfigurert i `package.json` scripts). Next.js auto-laster `.env.local`, men Supabase CLI gjør ikke det selv. Se steg 09 (`oppstart/09-configure-env.md`) for full forklaring.

### MCP-servere

Konfigurasjon ligger i `.mcp.json` ved prosjektroten (Claude Code sin standard-plassering — ikke i `.claude/`). Default-sett:

- **supabase** (HTTP, OAuth) — DB-verktøy, migrations, logs
- **resend** (stdio, dotenv-wrapper) — e-post (kun hvis brukt)
- **playwright** (stdio) — browser-automasjon / E2E
- **next-devtools** (stdio) — Next.js dev-server build/runtime-info
- **shadcn** (stdio) — søk og hent komponenter fra registries
- **chrome-devtools** (stdio) — live Chrome-debugging

**To wrapper-patterns** i stdio-entries (se `.mcp.json._comment`):

1. **`cmd /c`-wrapper** — alle stdio-MCP-er starter med `"command": "cmd", "args": ["/c", "npx", ...]`. Uten `cmd /c` feiler MCP-en silent på Windows. Mac/Linux-brukere kan droppe `cmd` + `/c` og bruke `"command": "npx"` direkte.
2. **`dotenv-cli`-wrapper** — MCP-er som trenger secrets (resend) får env fra `.env.local` via `dotenv-cli -e .env.local --`-prefix i args. Ingen `"env": { "VAR": "${VAR}" }`-blokker — `.env.local` er single source of truth.

**Bevisst utelatt**: GitHub MCP (`gh` CLI dekker det), Vercel MCP (`vercel` CLI + plugin dekker det), Context7 MCP (krever API-key, `WebFetch` dekker det meste). Se steg 01 i `oppstart/CHECKLIST.md` for opt-in-oppsett.

### Slash-kommandoer (Claude Code)

Se `.claude/commands/README.md` for full oversikt. Gruppert: `0.x` = bootstrap, `1.x` = git, `2.x` = oppgaver, `3.x` = workspace, `4.x` = UI/UX.

- `/0.0-oppstart` — kjør bootstrap (oppstart/CHECKLIST.md) for nytt prosjekt
- `/1.0-commit` — commit alle endringer med beskrivende melding
- `/1.1-build-commit` — verifikasjon → commit
- `/1.2-merge-to-main` — merge feature → main og push
- `/2.0-task <beskrivelse>` — solo-oppgave med spec-intervju + sjekkliste
- `/2.1-task-team <beskrivelse>` — multi-agent team-oppgave
- `/3.0-workspace-start <navn>` — opprett git worktree + VS Code
- `/3.1-workspace-merge <navn>` — merge workspace, behold worktree
- `/3.2-workspace-reload <navn>` — gjenåpne eksisterende workspace
- `/3.3-workspace-discard <navn>` — forkast workspace uten merge
- `/3.4-workspace-finish <navn>` — merge workspace tilbake, rydd opp
- `/4.0-ui <beskrivelse>` — start UI-arbeid med garantert MASTER + ui-ux-pro-max-konsultering
- `/6.0-audit [scope]` — full audit (security + a11y + performance + design-system)
- `/6.1-a11y`, `/6.2-security`, `/6.3-performance` — enkelt-audits
- `/7.0-discovery [idé]` — omfattende prosjekt-planlegging (10 dokumenter fra ide til roadmap)

### Skill-precedence ved UI-arbeid

Når du jobber med UI — uansett oppgavestørrelse, uansett om brukeren kalte `/4.0-ui` eller bare sa "endre den knappen":

1. **Les `design-system/MASTER.md` FØRST.** Sjekk om `design-system/pages/<slug>.md` finnes for siden du endrer.
2. **Konsulter `ui-ux-pro-max`-skillen** for design-intelligens (palletter, fonts, komponent-eksempler) — innenfor MASTER-rammene.
3. **Bruk `shadcn-component`-skillen** ved nye komponenter.
4. **`nextjs-i18n`-skillen** håndterer at all brukervendt tekst går gjennom `useTranslations()`.

**MASTER vinner alltid**: hvis `ui-ux-pro-max` foreslår noe utenfor MASTER (f.eks. glassmorphism når MASTER er minimalism), avvis forslaget. Bruker kan eksplisitt godkjenne avvik — da opprettes side-override via `python3 .claude/skills/ui-ux-pro-max/scripts/search.py ... --page <slug>`.

**Bruk `/4.0-ui <beskrivelse>`** når du vil ha eksplisitt garanti for at hele workflow-en kjøres i riktig rekkefølge.

**Branch-konvensjon**: `feature` er utviklingsbranch, `main` er release. Workspace-kommandoene forutsetter dette — endre i `.claude/commands/*.md` hvis prosjektet bruker annen modell.

## Design system (låst)

**Source of truth**: `design-system/MASTER.md` — les alltid denne før UI-generering.

<!--
Verdiene under fylles ut i oppstart-steg 04 når MASTER.md genereres.
Inntil da er defaultverdiene shadcn/ui sin standard (Slate + Inter).
-->

- **Stil**: <fylles inn i steg 04 — f.eks. Minimalism / Bento grid / Flat design>
- **Palette-primær**: <hex/hsl>
- **Heading-font**: <f.eks. Inter>
- **Body-font**: <f.eks. Inter>
- **Dark mode**: <ja/nei/begge>

### Retrieval-regel (hierarkisk oppslag)

Når du skal generere UI for en side:
1. Les `design-system/MASTER.md` (global baseline).
2. Sjekk om `design-system/pages/<page-slug>.md` finnes.
3. Hvis ja: side-spesifikke regler overstyrer MASTER.
4. Hvis nei: bruk MASTER eksklusivt.

Bruk `/4.0-ui <beskrivelse>` for eksplisitt trigger, eller følg regelen i "Skill-precedence ved UI-arbeid" over for små styling-endringer.

### Stil-regel

Ikke introduser brutalism, claymorphism, neumorphism eller andre stiler utenfor MASTER med mindre brukeren eksplisitt ber om det. Fargepalette hentes fra CSS-variablene i `src/app/globals.css` — aldri hardkode hex/rgb i komponenter.

## Internasjonalisering (låst)

<!--
Verdiene fylles inn i oppstart-steg 05 basert på locale-valg fra brukeren.
-->

- **Default locale**: <fylles inn i steg 05>
- **Støttede locales**: <fylles inn i steg 05>
- **Message-filer**: `messages/<locale>.json`
- **Routing**: `src/app/[locale]/...` med `localePrefix: "as-needed"`

**Regel (streng)**: all brukervendt tekst skal gå gjennom `next-intl`. Aldri hardkode strenger i JSX.

```tsx
// ✅ const t = useTranslations("Home"); return <h1>{t("title")}</h1>;
// ❌ return <h1>Velkommen</h1>;
```

Ved ny UI-tekst: legg til key i **alle** `messages/*.json`-filer (ikke bare default). `nextjs-i18n`-skillen aktiveres automatisk og håndhever dette.

Unntak (hardkoding OK): logging, feilmeldinger i server-kode som ikke eksponeres til bruker, kommentarer, og konstanter som ikke er oversettelsesmål (URLer, DB-feltnavn).

## Harde regler

1. **Server Components by default.** Bruk `"use client"` kun når nødvendig (interaktivitet, hooks, browser-API).
2. **Før DB-arbeid: les `teknisk/dokumentasjon/supabase-snapshot.md`** for full oversikt over tabeller, RLS-policies, triggers, edge functions. Hvis filen ikke finnes eller er utdatert (sjekk `Generert:`-dato): kjør `pnpm db:snapshot`. For live-data bruk Supabase MCP.
3. **Ved sesjonsstart: les `teknisk/dokumentasjon/session-state.md` hvis den finnes.** Filen dumpes av PreCompact-hook og inneholder gjenstående sjekkliste-punkter, git-state, ucommittede endringer fra forrige sesjon. Hvis bruker har startet en spesifikk oppgave, fortsett der — ikke begynn på scratch.
4. **Ved større oppgaver: les `teknisk/dokumentasjon/prosjekt/00-visjon.md` + `03-funksjonelle-krav.md` hvis de finnes.** Sikrer at nye features passer inn i prosjektets scope og visjon. Ved scope-konflikt: stopp og sjekk med bruker før du koder.
5. **All brukervendt tekst via `next-intl`.** Aldri hardkode strenger. Bruk `useTranslations()` / `getTranslations()`. Legg til keys i **alle** `messages/*.json`.
6. **Zod for all input.** Alle Server Actions og route handlers skal validere input med Zod før videre prosessering.
7. **Ingen `any`.** Bruk `unknown` + narrowing hvis typen er ukjent.
8. **Env-variabler gjennom `src/env.ts`.** Aldri bruk `process.env` direkte utenfor env-fil — valider med Zod. `.env.local` er single source of truth; CLI-tooling (Supabase CLI, custom scripts, Vercel-env-push) wraps med `dotenv -e .env.local --`.
9. **`createClient` fra riktig fil.** `@/lib/supabase/client` i Client Components, `@/lib/supabase/server` i Server Components/Actions/Route Handlers.
10. **Alltid `supabase.auth.getUser()` server-side.** Ikke `getSession()` — den verifiserer ikke JWT.
11. **RLS på alle tabeller med brukerdata.** Publishable key er offentlig — tilgangskontroll er RLS.
12. **`SUPABASE_SERVICE_ROLE_KEY` kun i `@/lib/supabase/admin`.** Aldri i klient-kode. Kun for admin-flyter som bevisst skal omgå RLS.
13. **Route handlers returnerer `Response` eller `NextResponse`.** Ingen direkte `res.json(...)`.
14. **Typesafe navigation via `@/i18n/navigation`.** Bruk `Link`/`redirect`/`useRouter` derfra — ikke `next/link`/`next/navigation` direkte, siden de ikke er locale-aware.

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

- GitHub: `{{GITHUB_REPO}}` (workflow via `gh` CLI — ingen MCP i default-sett)
- Vercel: `{{VERCEL_PROJECT}}` (workflow via `vercel` CLI + plugin — ingen MCP i default-sett)
- Supabase: `{{SUPABASE_PROJECT_REF}}` (via HTTP-MCP + `.mcp.json`-URL-interpolering fra `.env.local`)
- Resend: `RESEND_API_KEY` i `.env.local` (via stdio-MCP m/dotenv-wrapper, kun hvis brukt)

### Stack-dokumentasjon

- Next.js: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs
- Supabase Next.js-guide: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase Auth SSR: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase CLI: https://supabase.com/docs/guides/cli
- ui-ux-pro-max-skill: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- T3 Env: https://env.t3.gg/docs/nextjs

# Next.js Template — dokumentasjon

Denne filen beskriver **selve templaten** (`claude-next.js-template`). Den slettes automatisk i oppstart-steg 14, slik at det klonede prosjektet ikke ender opp med template-dokumentasjon.

For prosjekt-spesifikk dokumentasjon (som følger med klonen): se `README.md` og `CLAUDE.md`.

---

## Om templaten

Gjenbrukbar startmal for Next.js-prosjekter med ferdig Claude Code-konfigurasjon.

## Bruk

Naviger først til mappen der du vil opprette prosjektet (f.eks. `C:\Kodeprosjekter\`), og kjør deretter:

```bash
cd C:\Kodeprosjekter
npx degit sultanavtajev/claude-next.js-template mitt-nye-prosjekt
cd mitt-nye-prosjekt
claude
```

`mitt-nye-prosjekt` blir en ny undermappe av `C:\Kodeprosjekter\` med templaten kopiert inn — **uten** templatens git-historikk. Du starter med en ren mappe som steg 12 initialiserer git på.

### Om degit

`npx degit` trenger ingen manuell installasjon — `npx` laster ned pakken automatisk første gang (krever Node.js, som templaten uansett forutsetter). Resultatet er en ren filkopi uten `.git/`-mappe, til forskjell fra `git clone` som ville tatt med seg hele template-historikken.

**Feilsøking hvis `npx degit` feiler**:

1. Verifiser at Node.js er installert: `node --version` (må være v20+)
2. Test degit direkte: `npx degit --help` skal vise hjelp-tekst
3. Hvis corporate-nettverk blokkerer npx-downloads: installer globalt én gang med `npm install -g degit`, bruk deretter `degit sultanavtajev/claude-next.js-template mitt-nye-prosjekt` (uten `npx`-prefiks)
4. Hvis alt feiler: kontakt oss — ikke fall tilbake på `git clone`, det introduserer template-historikk i ditt nye prosjekt.

I Claude Code, kjør: **`/0.0-oppstart`**

Claude leser `oppstart/CHECKLIST.md` og utfører stegene i rekkefølge:

1. Konfigurerer Claude-oppsettet med prosjektnavn og beskrivelse
2. Kjører `create-next-app@latest` med standardflagg (TS, App Router, Tailwind, Turbopack, src/)
3. Initialiserer shadcn/ui
4. Installerer ui-ux-pro-max-skillen og låser designsystem (stil, palette, fonts) basert på prosjektdialog
5. Setter opp i18n med next-intl (locale-valg via AskUserQuestion, restrukturer `app/[locale]/...`, proxy)
6. Installerer `@sultanavtajev/element-picker` — dev-only inspector for AI-assistert UI-utvikling
7. Gjennomgår Supabase: prosjekt-opprettelse, klienter, Auth (login/signup/RLS), CLI for migrations, chainer session-proxy etter i18n-proxy
8. Lager `.env.example` med dokumenterte nøkler
9. Verifiserer at `dev`, `build`, `lint`, `typecheck` er grønne
10. Etablerer `teknisk/`-mappa for prosjekt-dokumentasjon og sjekklister
11. Resetter git-historikk, gjennomgår `gh auth` + repo-opprettelse, (valgfritt) Vercel-linking
12. Rydder opp (sletter `oppstart/` + TEMPLATE.md, final commit, pusher)

## Hva ligger i templaten

- `CLAUDE.md` — prosjektkonfig for Claude Code (med placeholders)
- `.claude/skills/` — Next.js-spesifikke ferdigheter Claude aktiverer ved behov
- `.claude/agents/` — delegerbare subagents (reviewer, build-resolver)
- `.claude/commands/` — slash-kommandoer (workspace, git, task-workflows)
- `.claude/hooks/` — automatisk formatering + guard mot sensitive filer
- `.mcp.json` — Vercel + GitHub + Supabase + Resend + Playwright + Context7 + shadcn + Chrome DevTools + next-devtools
- `oppstart/` — engangs-instruksjoner som slettes etter bootstrap
- **Claude Code-hooks** for automatisk konsistens:
  - **SessionStart-briefing** — ved `claude`-start: gir Claude git-status, siste commits, snapshot-alder, aktive sjekklister, manglende env-vars
  - **Stop-chat-arkivering** — lagrer hver sesjons full chat-historikk til `teknisk/dokumentasjon/chats/raw/` + månedsindeks
  - **PreCompact state-dump** — dumper sesjon-state (sjekklister, fil-endringer, git) til `teknisk/dokumentasjon/session-state.md` før Claude komprimerer kontekst
  - **Post-migration snapshot** — auto-regenererer `teknisk/dokumentasjon/supabase-snapshot.md` når Supabase-migrasjoner endres

## Etter oppstart

`oppstart/`-mappen slettes i siste steg. Prosjektet er da et helt vanlig Next.js-prosjekt med Claude-konfigurasjonen vedlagt i `.claude/`.

## Tilpasse templaten videre

Templaten er designet for å endres. Noen naturlige utvidelser:

- **Flere skills**: kopier en eksisterende `.claude/skills/<navn>/SKILL.md` som mal.
- **Flere agents**: legg til `.claude/agents/<navn>.md` med frontmatter (`name`, `description`, `tools`).
- **Flere hooks**: rediger `.claude/settings.json` og legg til scripts i `.claude/hooks/scripts/`.
- **Andre stack-valg**: endre `oppstart/02-create-next-app.md`-flagg eller erstatt Supabase med annen backend (Neon+Drizzle, Convex, etc.) via nye oppstart-filer.

## Windows-brukere: unngå OneDrive-sync

Moderne Windows (spesielt med jobbkonto) synkroniserer `C:\Users\<navn>\`-undermapper til OneDrive. Kodeprosjekter *i* denne synkroniseringen gir problemer:

- File locks under `pnpm build` / `pnpm dev` (EPERM / ENOBUFS)
- Treg filsystem-ytelse (OneDrive queuerer skrivinger)
- `node_modules/` synkes — enorm ytelsestreff og fyller OneDrive-kvota
- `.git`-korrupsjon ved samtidig sync + git-write
- Lange path-prefiks som bryter Windows' 260-tegns-grense

**Anbefaling**: opprett en dedikert mappe direkte under `C:\`, f.eks. `C:\Kodeprosjekter\`, og plasser alle prosjekter der. Dette er utenfor OneDrive-sync og gir stabil utvikling. Det er også hva eksemplene i denne READMEen forutsetter.

Hvis du allerede har prosjekter under `C:\Users\<navn>\...`: flytt dem ut. "Free up space"-flagget i OneDrive er ikke tilstrekkelig — mappen må være *unsynced* helt.

## Forutsetninger på maskinen

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- git
- Claude Code CLI (installert, innlogget)

## Tredjeparts-verktøy templaten bruker

- **[ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** — AI-skill for designsystem, 67 stiler, 161 palletter, 57 font-pairings. Installeres i steg 04.
- **[shadcn/ui](https://ui.shadcn.com)** — komponentbibliotek.
- **[Supabase](https://supabase.com)** — database, auth, storage.
- **[T3 Env](https://env.t3.gg)** — typesikker env-validering.

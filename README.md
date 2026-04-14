# Next.js Template

Gjenbrukbar startmal for Next.js-prosjekter med ferdig Claude Code-konfigurasjon.

## Bruk

```bash
git clone <denne-repo-url> mitt-nye-prosjekt
cd mitt-nye-prosjekt
claude
```

I Claude Code, si: **"Kjør oppstart"**

Claude leser `oppstart/CHECKLIST.md` og utfører stegene i rekkefølge:

1. Konfigurerer Claude-oppsettet med prosjektnavn/GitHub-repo/Vercel-prosjekt
2. Kjører `create-next-app@latest` med standardflagg (TS, App Router, Tailwind, Turbopack, src/)
3. Initialiserer shadcn/ui
4. Installerer Supabase-klienter (`@supabase/ssr`) og proxy for session-refresh
5. Setter opp Supabase Auth med login/signup-sider
6. Lager `.env.example` med dokumenterte nøkler
7. Verifiserer at `dev`, `build`, `lint`, `typecheck` er grønne
8. Rydder opp (sletter `oppstart/`, lager første commit)

## Hva ligger i templaten

- `CLAUDE.md` — prosjektkonfig for Claude Code (med placeholders)
- `.claude/skills/` — Next.js-spesifikke ferdigheter Claude aktiverer ved behov
- `.claude/agents/` — delegerbare subagents (reviewer, build-resolver)
- `.claude/hooks/` — automatisk formatering + guard mot sensitive filer
- `.claude/mcp-servers.json` — Vercel + GitHub MCP-config
- `oppstart/` — engangs-instruksjoner som slettes etter bootstrap

## Etter oppstart

`oppstart/`-mappen slettes i siste steg. Prosjektet er da et helt vanlig Next.js-prosjekt med Claude-konfigurasjonen vedlagt i `.claude/`.

## Tilpasse templaten videre

Templaten er designet for å endres. Noen naturlige utvidelser:

- **Flere skills**: kopier en eksisterende `.claude/skills/<navn>/SKILL.md` som mal.
- **Flere agents**: legg til `.claude/agents/<navn>.md` med frontmatter (`name`, `description`, `tools`).
- **Flere hooks**: rediger `.claude/settings.json` og legg til scripts i `.claude/hooks/scripts/`.
- **Andre stack-valg**: endre `oppstart/02-create-next-app.md`-flagg eller erstatt Supabase med annen backend (Neon+Drizzle, Convex, etc.) via nye oppstart-filer.

## Forutsetninger på maskinen

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- git
- Claude Code CLI (installert, innlogget)

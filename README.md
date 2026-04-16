# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

<!--
Denne README fylles ut i oppstart-steg 01 (prosjektnavn + beskrivelse).
Templatens egen dokumentasjon ligger i TEMPLATE.md, som slettes i steg 14.
-->

## Kom i gang

```bash
pnpm install
pnpm dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js** (App Router, TypeScript, Turbopack)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (database, auth, storage)
- **Zod** for input-validering
- **@t3-oss/env-nextjs** for typesikre env-variabler

Full oversikt over konvensjoner, mappestruktur og regler: se `CLAUDE.md`.

## Kommandoer

- `pnpm dev` — dev-server med Turbopack
- `pnpm build` — produksjonsbygg
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript-sjekk
- `pnpm db:new <navn>` — ny Supabase-migrasjon
- `pnpm db:push` — kjør migrasjoner
- `pnpm db:types` — generer TypeScript-typer fra schema

## Slash-kommandoer (Claude Code)

- `/1.0-commit` — commit alle endringer
- `/1.1-build-commit` — verifikasjon → commit
- `/1.2-merge-to-main` — merge feature → main + push
- `/2.0-task <beskrivelse>` — solo-oppgave med spec + sjekkliste
- `/2.1-task-team <beskrivelse>` — multi-agent team-oppgave
- `/3.0-workspace-start <navn>` — opprett git worktree

Full oversikt: se `.claude/commands/README.md`.

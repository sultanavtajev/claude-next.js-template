# Steg 02 — create-next-app

## Pre-flight: sjekk docs

Før du kjører kommandoen, hent `https://nextjs.org/docs/app/getting-started/installation` via WebFetch og bekreft:
- At `create-next-app`-flaggene under fortsatt er gyldige.
- At Next.js sin anbefalte Node-versjon er dekket av brukerens miljø.
- At ingen ny standardkonfigurasjon har blitt introdusert (f.eks. `--proxy`, nye default-flagg).

Hvis docs har endret anbefalingen: følg docs, og noter avviket.

## Mål

Generer Next.js-boilerplate i nåværende mappe med standard stack.

## Sjekkliste

- [ ] Pre-flight docs-sjekk kjørt (se seksjonen over)
- [ ] `npx create-next-app@latest .` kjørt med flaggsettet fra "Kommandoer"
- [ ] `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/` opprettet
- [ ] `CLAUDE.md`, `README.md` og `.claude/` er **ikke** overskrevet (verifisert med `git status`)
- [ ] `pnpm dev` viser standard Next.js-velkomstside på `http://localhost:3000`
- [ ] Dev-server stoppet

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 02 i `oppstart/CHECKLIST.md` og gå til steg 03.

## Forutsetninger

- `pnpm` eller `npm` tilgjengelig.
- Nåværende mappe er ikke et eksisterende Next.js-prosjekt.
- `.claude/`, `CLAUDE.md`, `oppstart/`, `.gitignore`, `README.md` finnes (disse skal beholdes).

## Kommandoer

Kjør `create-next-app` i nåværende mappe (punktum):

```bash
npx create-next-app@latest . --typescript --app --tailwind --eslint --src-dir --turbopack --import-alias "@/*" --use-pnpm
```

Hvis prompt om eksisterende filer: svar **Yes** på "continue" (filene våre beholdes; kun kolliderende filer overskrives).

Hvis `create-next-app` spør om noen av flaggene likevel: svar slik at flaggsettet over reflekteres.

## Forventet resultat

- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/` opprettet.
- `src/app/layout.tsx` og `src/app/page.tsx` er Next.js-standard boilerplate.
- `node_modules/` installert.
- `README.md` og `CLAUDE.md` fra templaten er **ikke** overskrevet (create-next-app's egen README ville kollidert; bekreft at vår versjon fortsatt er der).

## Verifisering

```bash
pnpm dev
```

Åpne `http://localhost:3000` — standard Next.js-velkomstside skal vises. Stopp dev-serveren (`Ctrl+C`).

## Feilsøking

- **`create-next-app` overskrev `README.md`**: gjenopprett fra git (`git checkout README.md`) eller kopier på nytt fra templaten.
- **pnpm ikke installert**: `npm i -g pnpm`.
- **Port 3000 opptatt**: kjør med `pnpm dev -- -p 3001`.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 02 i `oppstart/CHECKLIST.md`.

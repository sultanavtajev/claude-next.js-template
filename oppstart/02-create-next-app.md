# Steg 02 — create-next-app

## Mål

Generer Next.js-boilerplate i nåværende mappe med standard stack.

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

Kryss av steg 02 i `oppstart/CHECKLIST.md` når ferdig.

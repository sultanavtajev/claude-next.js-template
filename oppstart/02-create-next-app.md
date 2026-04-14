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

- **`pnpm` må være installert** (verifisert i `/0.0-oppstart`-kommandoens steg 0). Hvis ikke verifisert: kjør `pnpm --version`. Ved feil, installér med `npm install -g pnpm`.
- Node.js 20+.
- Nåværende mappe er ikke et eksisterende Next.js-prosjekt.
- `.claude/`, `CLAUDE.md`, `oppstart/`, `.gitignore`, `README.md`, `TEMPLATE.md` finnes (disse skal beholdes).

## Kommandoer

### 1. Backup templatens egne filer

`create-next-app .` vil overskrive `README.md` og `.gitignore` fordi de allerede finnes. `CLAUDE.md` røres ikke, men backupes for sikkerhets skyld.

```bash
cp README.md .README.bak
cp .gitignore .gitignore.bak
cp CLAUDE.md .CLAUDE.md.bak
```

### 2. Kjør `create-next-app`

`--skip-git` hindrer create-next-app fra å initialisere git (steg 08 gjør det):

```bash
npx create-next-app@latest . \
  --typescript --app --tailwind --eslint --src-dir --turbopack \
  --import-alias "@/*" --use-pnpm --skip-git
```

Hvis prompt om eksisterende filer: svar **Yes** på "continue" — vi vet at kollisjonene (README.md, .gitignore) skal overskrives midlertidig og så restaureres fra backup.

Hvis `create-next-app` spør om noen av flaggene likevel: svar slik at flaggsettet over reflekteres.

### 3. Restaurér templatens filer

```bash
mv .README.bak README.md
mv .gitignore.bak .gitignore
mv .CLAUDE.md.bak CLAUDE.md
```

Verifiser at ingen `.bak`-filer gjenstår:

```bash
ls -la .*.bak 2>/dev/null
```

Ingen output = alt restaurert.

## Forventet resultat

- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/` opprettet.
- `src/app/layout.tsx` og `src/app/page.tsx` er Next.js-standard boilerplate.
- `node_modules/` installert.
- `README.md`, `.gitignore` og `CLAUDE.md` er templatens versjoner (restaurert fra `.bak`-filer etter create-next-app).
- Ingen `.git/`-mappe er opprettet (vi brukte `--skip-git`).
- `.claude/`, `oppstart/`, `TEMPLATE.md` urørt.

## Verifisering

```bash
pnpm dev
```

Åpne `http://localhost:3000` — standard Next.js-velkomstside skal vises. Stopp dev-serveren (`Ctrl+C`).

## Feilsøking

- **`create-next-app` overskrev `README.md`/`.gitignore` og backup mangler**: hvis du hoppet over steg 1 (backup). Reset via git (hvis repo finnes) eller hent fra GitHub-templaten manuelt.
- **`.bak`-filer finnes fortsatt**: du glemte steg 3 (restore). Kjør `mv .README.bak README.md` etc.
- **`pnpm: command not found` / `not recognized`**: installér med `npm install -g pnpm`, verifiser med `pnpm --version`, og prøv steget på nytt. (Burde vært fanget i `/0.0-oppstart`-kommandoens forutsetnings-sjekk.)
- **create-next-app opprettet `.git/` likevel**: fjern `--skip-git` var ikke med. Kjør `rm -rf .git` — steg 08 oppretter git-repo på riktig måte senere.
- **Port 3000 opptatt**: kjør med `pnpm dev -- -p 3001`.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 02 i `oppstart/CHECKLIST.md`.

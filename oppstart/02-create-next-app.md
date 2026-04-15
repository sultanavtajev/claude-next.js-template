# Steg 02 — create-next-app

## Pre-flight: sjekk docs

Før du kjører kommandoen, hent `https://nextjs.org/docs/app/getting-started/installation` via WebFetch og bekreft:
- At `create-next-app`-flaggene under fortsatt er gyldige.
- At Next.js sin anbefalte Node-versjon er dekket av brukerens miljø.
- At ingen ny standardkonfigurasjon har blitt introdusert (f.eks. `--proxy`, nye default-flagg).
- Hvilke filer `create-next-app` genererer i ikke-tom mappe — spesielt `AGENTS.md` og `CLAUDE.md` (nye fra v16+).

### Kjent gotcha (per Next.js 16.2+)

- `create-next-app .` **nekter å kjøre** i en mappe med kolliderende filer (tidligere prompt for "continue" er fjernet). Du må flytte konflikt-filene ut først.
- Konflikt-filer: `README.md`, `.gitignore`, og fra v16+ også `CLAUDE.md` og `AGENTS.md`.
- `AGENTS.md` er en ny konvensjon fra Next.js v16 (på linje med CLAUDE.md for Claude Code) — den inneholder Next.js-spesifikke agent-instruksjoner og breaking-change-advarsler. **Behold Next.js sin AGENTS.md**; vår CLAUDE.md bør referere til den via `@AGENTS.md` etter create-next-app er ferdig.

## Mål

Generer Next.js-boilerplate i nåværende mappe med standard stack.

## Sjekkliste

- [ ] Pre-flight docs-sjekk kjørt (se seksjonen over) — bekreftet at create-next-app-oppførselen ikke har endret seg
- [ ] Templatens kolliderende filer flyttet til `/tmp/template-backup/`: `README.md`, `.gitignore`, `CLAUDE.md`
- [ ] `npx create-next-app@latest . ... --skip-git` kjørt uten feil
- [ ] `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/` opprettet
- [ ] `AGENTS.md` fra create-next-app finnes (beholdes)
- [ ] Next.js' `CLAUDE.md` slettet (`rm CLAUDE.md`)
- [ ] Templatens `README.md`, `.gitignore`, `CLAUDE.md` flyttet tilbake fra `/tmp/template-backup/`
- [ ] `/tmp/template-backup/` fjernet
- [ ] `@AGENTS.md` lagt til øverst i `CLAUDE.md` (referanse til Next.js' agent-instrukser)
- [ ] `.claude/`, `oppstart/`, `TEMPLATE.md` urørt
- [ ] Ingen `.git/`-mappe opprettet av create-next-app (`--skip-git` fungerte)
- [ ] `pnpm dev` startet via `run_in_background: true`, `curl http://localhost:3000/` svarte `HTTP 200`
- [ ] Dev-server stoppet (background-task avsluttet)

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 02 i `oppstart/CHECKLIST.md` og gå til steg 03.

## Forutsetninger

- **`pnpm` må være installert** (verifisert i `/0.0-oppstart`-kommandoens steg 0). Hvis ikke verifisert: kjør `pnpm --version`. Ved feil, installér med `npm install -g pnpm`.
- Node.js 20+.
- Nåværende mappe er ikke et eksisterende Next.js-prosjekt.
- `.claude/`, `CLAUDE.md`, `oppstart/`, `.gitignore`, `README.md`, `TEMPLATE.md` finnes (disse skal beholdes).

## Kommandoer

### 1. Flytt templatens kolliderende filer til en midlertidig mappe

`create-next-app .` nekter å kjøre hvis mappa har kolliderende filer. Kopiering er ikke nok — filene må være **fysisk borte** fra prosjektmappa under kjøringen.

```bash
mkdir -p /tmp/template-backup
mv README.md /tmp/template-backup/
mv .gitignore /tmp/template-backup/
mv CLAUDE.md /tmp/template-backup/
```

(`/tmp/template-backup` virker i Git Bash på Windows. Alternativt: `../template-backup` hvis du foretrekker nærmere.)

`.claude/`, `oppstart/`, `TEMPLATE.md` kolliderer ikke — de forblir i prosjektmappa.

### 2. Kjør `create-next-app`

`--skip-git` hindrer create-next-app fra å initialisere git (steg 11 gjør det):

```bash
npx create-next-app@latest . \
  --typescript --app --tailwind --eslint --src-dir --turbopack \
  --import-alias "@/*" --use-pnpm --skip-git
```

Hvis create-next-app spør om et flagg interaktivt (Yarn/pnpm/npm-valg osv.): svar slik at flaggsettet over reflekteres.

### 3. Håndtér Next.js' nye AGENTS.md (og eventuelt CLAUDE.md)

create-next-app v16+ oppretter:
- `AGENTS.md` — **behold denne**. Inneholder Next.js-spesifikke instruksjoner og breaking-change-notater.
- `CLAUDE.md` — create-next-app sin versjon. **Slett denne**, vi erstatter med vår egen i steg 4.

```bash
# Slett Next.js sin CLAUDE.md (vi har vår egen i backup)
rm CLAUDE.md
```

### 4. Flytt templatens filer tilbake

```bash
mv /tmp/template-backup/README.md .
mv /tmp/template-backup/.gitignore .
mv /tmp/template-backup/CLAUDE.md .
rmdir /tmp/template-backup
```

### 5. Referer AGENTS.md fra CLAUDE.md

Legg til `@AGENTS.md` øverst i `CLAUDE.md` rett under `## Beskrivelse`-blokken. Dette sier til Claude Code at AGENTS.md skal leses inn som kontekst sammen med CLAUDE.md.

Hvis `CLAUDE.md` allerede har en `@AGENTS.md`-linje: hopp over.

## Forventet resultat

- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/` opprettet.
- `src/app/layout.tsx` og `src/app/page.tsx` er Next.js-standard boilerplate.
- `node_modules/` installert.
- `README.md`, `.gitignore` og `CLAUDE.md` er templatens versjoner (flyttet tilbake fra `/tmp/template-backup/`).
- `AGENTS.md` fra Next.js 16+ beholdt — Claude Code leser den sammen med CLAUDE.md via `@AGENTS.md`.
- Ingen `.git/`-mappe er opprettet (vi brukte `--skip-git`).
- `.claude/`, `oppstart/`, `TEMPLATE.md` urørt.

## Verifisering

Start dev-serveren som **background-prosess** og test med `curl`. **Ikke bruk `sleep N && curl ...`** — Claude Code-miljøet blokkerer `sleep ≥ 2s` før en annen kommando.

Riktig mønster:

1. Start `pnpm dev` via Bash-verktøyet med `run_in_background: true`. Dette returnerer umiddelbart med en task-ID; dev-serveren kjører i bakgrunnen.
2. Verifiser at serveren svarer:
   ```bash
   curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/
   ```
   Forventet: `HTTP 200`. Hvis curl returnerer connection-feil fordi serveren ikke er klar ennå: vent på stdout-event fra background-tasken som indikerer "Ready" (bruk `Monitor`-verktøyet på task-ID-en), deretter curl på nytt. Alternativt: prøv curl to–tre ganger — Turbopack starter oftest innen ett sekund.
3. Stopp background-tasken når serveren svarer `HTTP 200` (via `KillShell` eller "Stop Task").

## Feilsøking

- **`create-next-app` avbryter med "The directory contains files that could conflict"**: du hoppet over steg 1 (flytt til `/tmp/template-backup/`). `cp`-basert backup virker ikke — create-next-app sjekker filsystemet. Flytt filene faktisk ut, kjør create-next-app, og flytt tilbake.
- **Backup-filer ble liggende i `/tmp/template-backup/`**: du hoppet over steg 4 (flytt tilbake). Kjør `mv /tmp/template-backup/* .` og `rmdir /tmp/template-backup`.
- **`pnpm: command not found` / `not recognized`**: installér med `npm install -g pnpm`, verifiser med `pnpm --version`, og prøv steget på nytt. (Burde vært fanget i `/0.0-oppstart`-kommandoens forutsetnings-sjekk.)
- **create-next-app opprettet `.git/` likevel**: `--skip-git` var ikke med. Kjør `rm -rf .git` — steg 11 oppretter git-repo på riktig måte senere.
- **`CLAUDE.md` har fortsatt Next.js-innhold, ikke vår**: steg 3 eller 4 feilet. Slett Next.js-versjonen (`rm CLAUDE.md`) og flytt vår tilbake (`mv /tmp/template-backup/CLAUDE.md .`).
- **`AGENTS.md` mangler**: create-next-app genererte den ikke (kanskje eldre versjon). Ikke noe problem — hopp over `@AGENTS.md`-referansen i CLAUDE.md.
- **Port 3000 opptatt**: kjør med `pnpm dev -- -p 3001`.
- **`sleep N && curl ...` blokkeres med "Run blocking commands in the background"**: Claude Code-miljøet blokkerer `sleep ≥ 2s` før en annen kommando. Start `pnpm dev` med `run_in_background: true`, vent på "Ready"-event via `Monitor`-verktøyet (eller bare kjør curl direkte — dev-serveren er oftest klar innen ett sekund), og stopp tasken etterpå.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 02 i `oppstart/CHECKLIST.md`.

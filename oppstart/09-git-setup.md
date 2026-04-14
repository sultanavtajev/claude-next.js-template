# Steg 09 — Remote-oppsett (Git, GitHub, Vercel)

## Mål

Reset template-repoets git-historikk, opprett fersk lokal historikk, opprett GitHub-repo med remote og push, og (valgfritt) link prosjektet til Vercel. Fyll inn `{{GITHUB_REPO}}` og `{{VERCEL_PROJECT}}`-placeholders.

## Pre-flight

- `gh` CLI installert. Sjekk med `gh --version`. Hvis ikke: `winget install GitHub.cli` (Windows) eller se `https://cli.github.com/`.
- `vercel` CLI installert hvis Vercel brukes. Sjekk med `vercel --version`. Hvis ikke: `pnpm add -g vercel`.

## Del 1 — Reset git-historikk

Template-repoet har historie fra `sultanavtajev/claude-next.js-template`. Brukerens nye prosjekt skal ha fersk historikk:

```bash
rm -rf .git
git init
git branch -M main
git add .
git commit -m "chore: bootstrap fra claude-next.js-template"
```

Hvis brukeren vil beholde template-historikk: hopp over `rm -rf .git` og `git init`. Legg da til ny remote via `git remote set-url origin <ny-url>` i Del 2.

## Del 2 — GitHub-repo-gjennomgang

### 1. Verifiser gh-autentisering

```bash
gh auth status
```

Hvis ikke autentisert, si til brukeren:

> "Jeg kan ikke autentisere deg på dine vegne. Kjør `gh auth login` i terminalen (velg HTTPS + web-auth), og si fra når du er ferdig."

Vent på bekreftelse, sjekk `gh auth status` på nytt.

### 2. Samle inn repo-preferanser via `AskUserQuestion`

| Spørsmål | Header | Valg |
|----------|--------|------|
| Hva skal repoet hete på GitHub? | Repo-navn | Samme som prosjektnavn, Other (skriv inn) |
| Public eller private? | Synlighet | Public, Private |
| Opprett også `feature`-branch og push? | Feature-branch | Ja (anbefalt — workspace-kommandoene bruker den), Nei (bare main) |

### 3. Opprett repo og push

Bytt ut `<repo-navn>` og `<visibility>` med svarene fra AskUserQuestion:

```bash
gh repo create <repo-navn> --<public|private> --source=. --push --description "Opprettet fra claude-next.js-template"
```

Hent brukernavnet fra `gh api user --jq .login` og lag streng `<brukernavn>/<repo-navn>`.

### 4. (Hvis valgt) Opprett feature-branch

```bash
git branch feature
git push -u origin feature
```

### 5. Fyll inn `{{GITHUB_REPO}}`-placeholder

Søk-og-erstatt `{{GITHUB_REPO}}` med `<brukernavn>/<repo-navn>` i:
- `CLAUDE.md`
- `.claude/mcp-servers.json`

Commit denne endringen (blir siste commit i steg 10):
```bash
# ikke commit nå — samler opp til steg 10
```

## Del 3 — Vercel-gjennomgang (valgfritt)

### 1. Spør om bruker vil linke Vercel

Bruk `AskUserQuestion`:

| Spørsmål | Header | Valg |
|----------|--------|------|
| Skal prosjektet linkes til Vercel nå? | Vercel | Ja, link nå · Nei, hopp over |

### 2. Hvis "Nei"

Behold `{{VERCEL_PROJECT}}`-placeholderen og hopp til "Forventet resultat". Bruker kan kjøre `vercel link` senere.

### 3. Hvis "Ja"

Verifiser vercel-autentisering:

```bash
vercel whoami
```

Hvis ikke autentisert, si til brukeren:

> "Kjør `vercel login` i terminalen og velg metode (GitHub, GitLab, email). Si fra når du er ferdig."

Vent på bekreftelse.

### 4. Link prosjektet

```bash
vercel link
```

Dette er interaktivt — Vercel spør hvilken scope (org/team) og prosjektnavn. Brukeren må svare selv i terminalen. Be dem velge prosjektnavn som matcher GitHub-repo-navnet for konsistens.

### 5. Hent Vercel-prosjektnavn fra `.vercel/project.json`

Etter link genereres `.vercel/project.json` lokalt. Les feltet `projectId` eller spør brukeren hva de kalte prosjektet. Fyll inn `{{VERCEL_PROJECT}}`-placeholder i:
- `CLAUDE.md`
- `.claude/mcp-servers.json`

`.vercel/` er allerede i `.gitignore` — lokal-only.

## Forventet resultat

- `.git/` er fersk — ingen template-commits i historikken.
- Minst én commit: `"chore: bootstrap fra claude-next.js-template"`.
- `origin` peker på `https://github.com/<bruker>/<repo-navn>`, `main` og eventuelt `feature` pushet.
- `{{GITHUB_REPO}}` erstattet med `<bruker>/<repo-navn>`.
- (Hvis Vercel ble linket) `{{VERCEL_PROJECT}}` erstattet med prosjektnavn. `.vercel/project.json` finnes lokalt.

## Feilsøking

- **`gh: command not found`**: installer GitHub CLI og `gh auth login`.
- **`vercel: command not found`**: `pnpm add -g vercel`.
- **`repository <navn> already exists`**: velg nytt navn via AskUserQuestion og prøv igjen.
- **`Permission denied` ved `rm -rf .git`**: lukk IDE eller andre prosesser som kan ha lås på `.git/`-filer. På Windows kan VS Codes Git-extension holde filer åpne.
- **`gh auth login` krever manuell input**: Claude kan ikke fullføre OAuth-flyten — bruker må gjøre det selv i terminalen.
- **`vercel link` krever interaktiv input**: samme som over — bruker må klikke gjennom.

## Avkrysning

Kryss av steg 09 i `oppstart/CHECKLIST.md` når ferdig.

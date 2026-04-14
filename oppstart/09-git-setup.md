# Steg 09 — Git-oppsett (lokal + remote)

## Mål

Slett template-repoets git-historikk, initialisér fersk historikk for brukerens prosjekt, og sett opp remote på GitHub med både `main` og `feature`-branch pushet.

## Pre-flight

- `gh` CLI installert og autentisert (`gh auth status`).
- Bruker ønsker å opprette GitHub-repo nå. (Hvis ikke — hopp til "Alternativ: bare lokal" nederst.)

## Kommandoer

### 1. Spør brukeren om remote-detaljer

Bruk `AskUserQuestion` med disse spørsmålene:

| Spørsmål | Header | Valg |
|----------|--------|------|
| Hva skal repoet hete på GitHub? | Repo-navn | `{{PROJECT_NAME}}` (samme som prosjekt), Other (skriv inn) |
| Skal repoet være public eller private? | Synlighet | Public, Private |
| Skal vi også opprette `feature`-branch og pushe den? | Feature-branch | Ja (anbefalt — workspace-kommandoene bruker den), Nei (bare main) |

### 2. Reset git-historikk

Template-repoet har historie fra `sultanavtajev/claude-next.js-template`. Brukerens nye prosjekt skal ha fersk historikk:

```bash
rm -rf .git
git init
git branch -M main
```

### 3. Stage alt og lag første commit

```bash
git add .
git commit -m "chore: bootstrap fra claude-next.js-template"
```

### 4. Opprett GitHub-repo og push main

Bytt ut `<repo-navn>` og `--<visibility>` med svarene fra steg 1:

```bash
gh repo create <repo-navn> --<public|private> --source=. --push --description "Opprettet fra claude-next.js-template"
```

Dette setter automatisk `origin` som remote og pusher `main`.

### 5. (Hvis valgt) Opprett og push feature-branch

```bash
git branch feature
git push -u origin feature
```

### 6. Verifiser

```bash
gh repo view --web     # (valgfri) åpner repoet i nettleser
git branch -vv         # begge branches med tracking-info
git remote -v          # origin peker på riktig repo
```

## Alternativ: bare lokal (hopper over remote)

Hvis brukeren ikke vil opprette GitHub-repo nå:

```bash
rm -rf .git
git init
git branch -M main
git add .
git commit -m "chore: bootstrap fra claude-next.js-template"
```

Remote kan legges til senere med:
```bash
gh repo create <navn> --<visibility> --source=. --push
```

## Forventet resultat

- `.git/` er fersk — ingen template-commits i historikken.
- Minst én commit: `"chore: bootstrap fra claude-next.js-template"`.
- (Hvis GitHub-repo ble opprettet) `origin` peker på `https://github.com/<bruker>/<repo-navn>`, `main` og eventuelt `feature` pushet.

## Feilsøking

- **`gh: command not found`**: installer GitHub CLI (`winget install GitHub.cli`) og `gh auth login`.
- **`repository <navn> already exists`**: velg nytt navn via AskUserQuestion og prøv igjen.
- **`Permission denied` ved `rm -rf .git`**: lukk IDE eller andre prosesser som kan ha lås på `.git/`-filer. På Windows kan VS Codes Git-extension holde filer åpne.
- **Bruker vil beholde template-historikk**: hopp over `rm -rf .git` og `git init` — da vil historikken fra template være med. Legg til ny remote via `git remote set-url origin <ny-url>` eller `git remote add origin <ny-url>` i stedet.

## Avkrysning

Kryss av steg 09 i `oppstart/CHECKLIST.md` når ferdig.

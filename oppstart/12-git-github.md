# Steg 12 — Git + GitHub

## Mål

Initialisér fersk git-historikk (prosjektet er lastet med degit, så ingen `.git/` finnes ennå), opprett GitHub-repo med remote og push. Fyll inn `{{GITHUB_REPO}}`-placeholder. GitHub-arbeid håndteres gjennom `gh` CLI — ingen MCP trengs (se steg 01 "Bevisst utelatte MCP-er" om du likevel vil legge til GitHub MCP manuelt).

## Sjekkliste

### Del 1 — Initialisér git-historikk
- [ ] Pre-flight: `gh --version` OK
- [ ] `rm -rf .git` kjørt defensivt (uansett om `.git/` finnes — create-next-app v16.2+ og eventuell `git clone`-fallback kan ha opprettet den)
- [ ] `git init` + `git branch -M main` kjørt
- [ ] Første commit laget: `"chore: bootstrap fra claude-next.js-template"`

### Del 2 — GitHub
- [ ] `gh auth status` OK (bruker har kjørt `gh auth login` om nødvendig)
- [ ] Repo-detaljer samlet via `AskUserQuestion`: navn, synlighet, feature-branch ja/nei
- [ ] `gh repo create` kjørt; `origin` satt, `main` pushet
- [ ] (Hvis valgt) `feature`-branch opprettet og pushet
- [ ] `{{GITHUB_REPO}}` erstattet med `<bruker>/<repo-navn>` i `CLAUDE.md`

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 12 i `oppstart/CHECKLIST.md` og gå til steg 13.

## Pre-flight

`gh` CLI installert. Sjekk med `gh --version`. Hvis ikke: `winget install GitHub.cli` (Windows) eller se `https://cli.github.com/`.

## Del 1 — Initialisér git-historikk

Prosjektet ble lastet ned med `degit` og `.git/` ble fjernet eksplisitt i steg 02 — så det skal ikke finnes `.git/`-mappe nå. Men siden create-next-app v16.2+ og `git clone`-fallback kan ha sneket inn en `.git/`-mappe likevel, gjør vi en defensiv `rm -rf .git` før init:

```bash
# Defensiv — fjern eventuell stale .git/ uansett hvordan den kom dit
rm -rf .git

# Fersk init
git init
git branch -M main
git add .
git commit -m "chore: bootstrap fra claude-next.js-template"
```

### Hvis brukeren har eksisterende git-historikk de vil beholde

Skulle brukeren eksplisitt ha sagt at de vil beholde en eksisterende `.git/` (f.eks. videreføring av et annet prosjekt), **hopp over `rm -rf .git`** og sjekk status:

```bash
git log --oneline 2>/dev/null | head -3
```

- Commits med "claude-next.js-template"-historikk → bruker brukte `git clone` i stedet for degit og glemte steg 02 — bekreft `rm -rf .git` + fersk init.
- Helt andre commits → bruker har eksisterende repo. Stopp og avklar med bruker om de vil beholde historikken (dette er uvanlig ved `/0.0-oppstart` på ferskt prosjekt).

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

Commit denne endringen (blir siste commit i steg 14):
```bash
# ikke commit nå — samler opp til steg 14
```

## Forventet resultat

- `.git/` er fersk — ingen template-commits i historikken.
- Minst én commit: `"chore: bootstrap fra claude-next.js-template"`.
- `origin` peker på `https://github.com/<bruker>/<repo-navn>`, `main` og eventuelt `feature` pushet.
- `{{GITHUB_REPO}}` erstattet med `<bruker>/<repo-navn>`.
- `gh` CLI er klar for videre workflow (issues, PRs, Actions) — ingen MCP trengs.

## Feilsøking

- **`gh: command not found`**: installer GitHub CLI og `gh auth login`.
- **`repository <navn> already exists`**: velg nytt navn via AskUserQuestion og prøv igjen.
- **`Permission denied` ved `rm -rf .git`**: lukk IDE eller andre prosesser som kan ha lås på `.git/`-filer. På Windows kan VS Codes Git-extension holde filer åpne.
- **`gh auth login` krever manuell input**: Claude kan ikke fullføre OAuth-flyten — bruker må gjøre det selv i terminalen.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 12 i `oppstart/CHECKLIST.md`.

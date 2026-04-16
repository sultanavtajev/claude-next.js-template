# Steg 12 — Git + GitHub

## Mål

Initialisér fersk git-historikk (prosjektet er lastet med degit, så ingen `.git/` finnes ennå), opprett GitHub-repo med remote og push. Fyll inn `{{GITHUB_REPO}}`-placeholder og autoriser GitHub MCP.

## Sjekkliste

### Del 1 — Initialisér git-historikk
- [ ] Pre-flight: `gh --version` OK
- [ ] Verifisert at ingen `.git/`-mappe finnes (degit-flyten — standard)
- [ ] `git init` + `git branch -M main` kjørt
- [ ] Første commit laget: `"chore: bootstrap fra claude-next.js-template"`

### Del 2 — GitHub
- [ ] `gh auth status` OK (bruker har kjørt `gh auth login` om nødvendig)
- [ ] Repo-detaljer samlet via `AskUserQuestion`: navn, synlighet, feature-branch ja/nei
- [ ] `gh repo create` kjørt; `origin` satt, `main` pushet
- [ ] (Hvis valgt) `feature`-branch opprettet og pushet
- [ ] `{{GITHUB_REPO}}` erstattet med `<bruker>/<repo-navn>` i `CLAUDE.md`
- [ ] GitHub MCP autorisert via `/mcp` → github i Claude Code (OAuth-flow fullført)

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 12 i `oppstart/CHECKLIST.md` og gå til steg 13.

## Pre-flight

`gh` CLI installert. Sjekk med `gh --version`. Hvis ikke: `winget install GitHub.cli` (Windows) eller se `https://cli.github.com/`.

## Del 1 — Initialisér git-historikk

Prosjektet ble lastet ned med `degit` (per `TEMPLATE.md`-instruks), så det finnes ingen `.git/`-mappe. Initialisér fersk historikk:

```bash
git init
git branch -M main
git add .
git commit -m "chore: bootstrap fra claude-next.js-template"
```

### Hvis `.git/` uventet finnes

Kjør først:

```bash
git log --oneline 2>/dev/null | head -3
```

- Commits med "claude-next.js-template"-historikk → bruker brukte `git clone` i stedet for degit. Stopp og spør: skal vi `rm -rf .git` og starte med fersk historikk? (Anbefalt: ja.)
- Helt andre commits → bruker har eksisterende repo de vil beholde. Stopp og avklar med bruker før noe gjøres.

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

(`.mcp.json` trenger ikke dette — GitHub MCP bruker OAuth og gir access til alle autoriserte repoer.)

Commit denne endringen (blir siste commit i steg 14):
```bash
# ikke commit nå — samler opp til steg 14
```

### 6. Autoriser GitHub MCP (OAuth)

GitHub har offisiell MCP-server på `https://api.githubcopilot.com/mcp/` med 70+ verktøy for issues, PRs, Actions, security, discussions, gists, orgs og projects. Templaten har den registrert i `.mcp.json`, men brukeren må autorisere den første gang:

1. I Claude Code-sessionen: kjør `/mcp`
2. Velg `github`
3. Følg OAuth-flow i browser (GitHub-login + grant access)
4. Verifiser ved å la Claude kjøre `mcp__github__list_issues` e.l. mot nyopprettet repo

Etter autorisering får Claude tilgang til hele GitHub-API-et via MCP (issues, PRs, Actions-logs, security alerts osv.) uten PAT eller env-variabel.

## Forventet resultat

- `.git/` er fersk — ingen template-commits i historikken.
- Minst én commit: `"chore: bootstrap fra claude-next.js-template"`.
- `origin` peker på `https://github.com/<bruker>/<repo-navn>`, `main` og eventuelt `feature` pushet.
- `{{GITHUB_REPO}}` erstattet med `<bruker>/<repo-navn>`.
- GitHub MCP tilgjengelig i Claude Code etter OAuth.

## Feilsøking

- **`gh: command not found`**: installer GitHub CLI og `gh auth login`.
- **`/mcp github` viser "Needs authentication"**: bruker må fullføre OAuth-flyten i browser. Browser åpnes automatisk ved første kall.
- **GitHub MCP returnerer 401/403**: autorisering utløpt eller manglende scope — kjør `/mcp` → github → re-auth.
- **GitHub-account uten Copilot-tilgang**: hosted MCP krever Copilot-abonnement. Fallback er å kjøre Docker-versjonen lokalt med PAT: erstatt `github`-oppføringen i `.mcp.json` med `{"command": "docker", "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"], "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"}}` og sett `GITHUB_TOKEN` i `.env.local`.
- **`repository <navn> already exists`**: velg nytt navn via AskUserQuestion og prøv igjen.
- **`Permission denied` ved `rm -rf .git`**: lukk IDE eller andre prosesser som kan ha lås på `.git/`-filer. På Windows kan VS Codes Git-extension holde filer åpne.
- **`gh auth login` krever manuell input**: Claude kan ikke fullføre OAuth-flyten — bruker må gjøre det selv i terminalen.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 12 i `oppstart/CHECKLIST.md`.

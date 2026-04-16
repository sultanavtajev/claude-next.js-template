# Steg 11 — Prosjekt-struktur (`teknisk/`-mappa)

## Mål

Opprett `teknisk/`-mappestrukturen med `dokumentasjon/` og `sjekkliste/`-undermapper, og legg inn README-filer som forklarer bruken. Dette er prosjektets faste plass for:
- **`teknisk/dokumentasjon/`** — `.md`-filer med prosjekt-dokumentasjon, arkitekturnotater, chat-sammendrag fra Claude-sesjoner
- **`teknisk/sjekkliste/`** — sjekklister opprettet av `/2.0-task` og `/2.1-task-team` under utvikling

## Sjekkliste

- [ ] `teknisk/`-linjen fjernet fra `.gitignore` (verifisert med `grep "^teknisk/$" .gitignore` — ingen treff)
- [ ] `teknisk/`-mappa opprettet
- [ ] `teknisk/README.md` opprettet med overordnet forklaring
- [ ] `teknisk/dokumentasjon/` opprettet
- [ ] `teknisk/dokumentasjon/README.md` opprettet med forklaring + eksempler
- [ ] `teknisk/sjekkliste/` opprettet
- [ ] `teknisk/sjekkliste/README.md` opprettet med forklaring + eksempler
- [ ] Verifisert med `git status` at 4 nye filer er klare til stage (og teknisk/ ikke er ignorert)

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 11 i `oppstart/CHECKLIST.md` og gå til steg 12.

## Kommandoer

### 1. Fjern `teknisk/`-linjen fra `.gitignore`

Templaten ignorerer `teknisk/` by default slik at chat-filer fra hooking under template-utvikling ikke havner i templatens git-repo. Bruker-prosjekter skal versjonere mappen — fjern linjen:

```bash
# Linux/Mac/Git Bash på Windows:
sed -i '/^teknisk\/$/d' .gitignore

# Eller mer manuelt: åpne .gitignore og fjern linjen "teknisk/" (og evt. kommentaren rett over)
```

Verifiser:
```bash
grep "^teknisk/$" .gitignore
```
Skal gi **ingen** output (linjen er borte).

### 2. Opprett mappene

```bash
mkdir -p teknisk/dokumentasjon teknisk/sjekkliste
```

### 3. Opprett `teknisk/README.md`

```markdown
# teknisk/

Samlested for prosjektintern dokumentasjon og sjekklister.

## Struktur

- **`dokumentasjon/`** — prosjekt-dokumentasjon, arkitekturnotater, chat-sammendrag fra Claude-sesjoner, analyse-dokumenter.
- **`sjekkliste/`** — sjekklister opprettet av `/2.0-task` og `/2.1-task-team` under utvikling. En fil per oppgave (eller mappe for team-oppgaver).

## Konvensjoner

- Alle filer versjoneres og committes.
- Kebab-case-navn (`bruker-onboarding.md`, ikke `Bruker Onboarding.md`).
- Ved fullføring: legg `OK - ` først i filnavnet (for sjekkliste-filer).
```

### 4. Opprett `teknisk/dokumentasjon/README.md`

```markdown
# teknisk/dokumentasjon/

`.md`-filer med prosjekt-dokumentasjon som utvikler seg over tid.

## Typiske filer

- **Arkitekturnotater** — systemdesign, dataflyt, valg av stack
- **Integrasjons-oppsummeringer** — f.eks. "slik fungerer webhook-oppsettet for Stripe"
- **Chat-sammendrag** — verdifulle Claude-sesjoner limes inn her for framtidig referanse
- **Feilanalyser** — post-mortem-notater etter incidents

## Ikke dette

- README-nivå-dokumentasjon (det ligger i `/README.md`)
- CLAUDE-instrukser (de ligger i `/CLAUDE.md` og `/.claude/`)
- Sjekklister fra `/2.0-task` (de ligger i `teknisk/sjekkliste/`)

## Eksempel-filnavn

- `auth-flow.md`
- `webhook-stripe.md`
- `performance-profiling-2026-Q2.md`
- `claude-chat-refactor-db-schema.md`
```

### 5. Opprett `teknisk/sjekkliste/README.md`

```markdown
# teknisk/sjekkliste/

Sjekkliste-filer opprettet av `/2.0-task` og `/2.1-task-team` — én per oppgave.

## Hvordan filene opprettes

### Solo-oppgaver (`/2.0-task`)

Claude oppretter `<oppgave-navn-i-kebab-case>.md` når du starter en oppgave. Eksempel:

```bash
/2.0-task Legg til redigering av brukerprofil
```

→ Claude oppretter `teknisk/sjekkliste/rediger-brukerprofil.md` med alle deltrinnene og krysser av etterhvert.

### Team-oppgaver (`/2.1-task-team`)

Claude oppretter en mappe i stedet for én fil:

```
teknisk/sjekkliste/<oppgave-navn>/
├── hovedsjekkliste.md
├── <teammate-a>.md
└── <teammate-b>.md
```

## Ved fullføring

Når sjekklisten er grønn, legg til `OK - ` først i navnet:

- `rediger-brukerprofil.md` → `OK - rediger-brukerprofil.md`
- Mappen `team-onboarding-flow/` → `OK - team-onboarding-flow/`

Dette gir en rask visuell oversikt over hva som er arkivert vs aktivt.
```

## Forventet resultat

- `teknisk/README.md` eksisterer og forklarer strukturen.
- `teknisk/dokumentasjon/README.md` og `teknisk/sjekkliste/README.md` eksisterer med egne formål.
- `git status` viser 4 nye filer klare til stage (de commites i steg 14 som del av bootstrap-commit).

## Feilsøking

- **`mkdir: can't create directory 'teknisk/dokumentasjon': File exists`**: mappa finnes allerede (kanskje fra et tidligere forsøk). Trygt å ignorere og skrive README-filene uansett.
- **Bruker vil ha andre mappenavn**: dette er konvensjon fra templaten. Kan endres, men husk også å oppdatere `/2.0-task` og `/2.1-task-team` som refererer `teknisk/sjekkliste/`.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 11 i `oppstart/CHECKLIST.md`.

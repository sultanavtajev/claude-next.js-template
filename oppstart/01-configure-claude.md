# Steg 01 — Configure Claude

## Mål

Fyll inn prosjektspesifikk metadata i `CLAUDE.md` og `.claude/mcp-servers.json` slik at Claude-konfigurasjonen reflekterer dette prosjektet.

## Sjekkliste

- [ ] Prosjektnavn hentet via `AskUserQuestion`
- [ ] Beskrivelse hentet via `AskUserQuestion`
- [ ] `{{PROJECT_NAME}}` erstattet i `CLAUDE.md` (og `README.md` hvis det finnes placeholder)
- [ ] `{{PROJECT_DESCRIPTION}}` erstattet i `CLAUDE.md`
- [ ] Verifisert at bare `{{GITHUB_REPO}}`, `{{VERCEL_PROJECT}}` og `{{SUPABASE_PROJECT_REF}}` gjenstår som placeholders

Kryss av hver `[ ]` → `[x]` fortløpende mens du jobber. Når alle er `[x]`, marker steg 01 i `oppstart/CHECKLIST.md` som ferdig og gå til steg 02.

## Forutsetninger

- `CLAUDE.md` og `.claude/mcp-servers.json` finnes i prosjektroten (lagt inn fra templaten).
- De inneholder placeholders på formen `{{UPPERCASE_SNAKE}}`.

## Kommandoer

### 1. Samle prosjekt-metadata

**Bruk `AskUserQuestion`-verktøyet.** Bare to felter spørres om her — resten fylles inn senere i dedikerte steg:

| Spørsmål | Header | Notat |
|----------|--------|-------|
| Hva skal prosjektet hete? | Prosjektnavn | Bruker velger "Other" og skriver inn (f.eks. `mitt-saas`) |
| Kort beskrivelse (én setning)? | Beskrivelse | Bruker velger "Other" og skriver inn |

`{{GITHUB_REPO}}`, `{{VERCEL_PROJECT}}` og `{{SUPABASE_PROJECT_REF}}` blir fylt inn i sine respektive steg:
- `{{SUPABASE_PROJECT_REF}}` → steg 07 (Supabase-prosjekt-gjennomgang)
- `{{GITHUB_REPO}}` → steg 12 (git + GitHub-repo-opprettelse)
- `{{VERCEL_PROJECT}}` → steg 13 (Vercel-linking)

Ikke spør brukeren om disse nå — de krever login/ressursopprettelse og håndteres best som dedikerte gjennomganger.

### 2. Søk-og-erstatt `{{PROJECT_NAME}}` og `{{PROJECT_DESCRIPTION}}`

Gjør erstatning i disse filene:
- `CLAUDE.md`
- `README.md` (prosjektets egen README — begge placeholders er her)

**Ikke** rør:
- `{{GITHUB_REPO}}`, `{{VERCEL_PROJECT}}`, `{{SUPABASE_PROJECT_REF}}` — fylles inn i senere steg.
- `TEMPLATE.md` — dokumentasjon for selve templaten, slettes i steg 14.

### 3. Verifiser at bare de riktige placeholders gjenstår

```bash
grep -r "{{" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=oppstart --exclude=TEMPLATE.md
```

Forventet: treff **kun** på `{{GITHUB_REPO}}`, `{{VERCEL_PROJECT}}`, `{{SUPABASE_PROJECT_REF}}`. Ingen `{{PROJECT_NAME}}` eller `{{PROJECT_DESCRIPTION}}`.

Vi ekskluderer `TEMPLATE.md` fra sjekken fordi filen inneholder dokumentasjon om templaten (inklusive eksempel-placeholders), og slettes uansett i steg 14.

## Forventet resultat

- `{{PROJECT_NAME}}` og `{{PROJECT_DESCRIPTION}}` erstattet i `CLAUDE.md` (og `README.md` hvis relevant).
- `{{GITHUB_REPO}}`, `{{VERCEL_PROJECT}}`, `{{SUPABASE_PROJECT_REF}}` **beholdes** som placeholders — disse fylles inn i senere steg.
- `CLAUDE.md` har riktig prosjektnavn i H1 og beskrivelse.

## Env-variabler MCP-serverne trenger

MCP-serverne i `.claude/mcp-servers.json` refererer til disse env-variablene (må finnes i brukerens shell eller `.env.local`):

- GitHub: OAuth via `/mcp` i Claude Code — ingen token trengs (autoriseres første gang MCP kalles)
- Vercel: OAuth via `/mcp` i Claude Code — ingen token trengs (autoriseres første gang MCP kalles)
- `SUPABASE_ACCESS_TOKEN` — personlig access token fra Supabase (kun hvis Supabase brukes)
- `RESEND_API_KEY` — API-nøkkel fra Resend dashboard (kun hvis Resend brukes)
- `CONTEXT7_API_KEY` — API-nøkkel fra context7.com/dashboard (valgfri, men gir høyere rate limits)

Disse krever ingen env-variabel:
- `playwright` (@playwright/mcp) — browser-automasjon og E2E-testing
- `next-devtools` (next-devtools-mcp) — kobler til Next.js 16+ dev-serverens `/_next/mcp`-endepunkt automatisk for build/runtime-feil og live state
- `shadcn` (shadcn@latest mcp) — søk og hent shadcn-komponenter fra registries
- `chrome-devtools` (chrome-devtools-mcp) — live Chrome-debugging mot åpen browser (komplementerer Playwright)

Informér brukeren at disse må settes for at MCP-serverne skal virke. Fjern eventuelt servere som ikke er aktuelle fra `.claude/mcp-servers.json`.

## Feilsøking

- **Grep finner treff i `oppstart/`**: det er OK — denne mappen slettes i steg 14.
- **Grep finner `{{GITHUB_REPO}}`, `{{VERCEL_PROJECT}}`, `{{SUPABASE_PROJECT_REF}}`**: forventet — de fylles inn i steg 07, 12 og 13.
- **Bruker bruker ikke Supabase/Resend/Vercel**: disse kan enten fjernes fra `.claude/mcp-servers.json` (i relevant steg) eller beholdes med `TBD` — MCP-serveren vil da ikke fungere før verdien er fylt inn.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 01 i `oppstart/CHECKLIST.md`.

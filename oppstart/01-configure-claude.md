# Steg 01 — Configure Claude

## Mål

Fyll inn prosjektspesifikk metadata i `CLAUDE.md` og `.mcp.json` slik at Claude-konfigurasjonen reflekterer dette prosjektet.

## Sjekkliste

- [ ] Prosjektnavn hentet via `AskUserQuestion`
- [ ] Beskrivelse hentet via `AskUserQuestion`
- [ ] `{{PROJECT_NAME}}` erstattet i `CLAUDE.md` (og `README.md` hvis det finnes placeholder)
- [ ] `{{PROJECT_DESCRIPTION}}` erstattet i `CLAUDE.md`
- [ ] Verifisert at bare `{{GITHUB_REPO}}`, `{{VERCEL_PROJECT}}` og `{{SUPABASE_PROJECT_REF}}` gjenstår som placeholders

Kryss av hver `[ ]` → `[x]` fortløpende mens du jobber. Når alle er `[x]`, marker steg 01 i `oppstart/CHECKLIST.md` som ferdig og gå til steg 02.

## Forutsetninger

- `CLAUDE.md` og `.mcp.json` finnes i prosjektroten (lagt inn fra templaten).
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

MCP-serverne i `.mcp.json` refererer til disse env-variablene. Templaten bruker `.env.local` som single source of truth (settes opp i steg 09 med `dotenv-cli`). **Stdio-MCP-er** som trenger secrets wraps med `dotenv-cli -e .env.local --` så `.env.local` lastes inn i prosess-environmentet før child-prosessen starter — ingen `"env": { ... }`-blokker i `.mcp.json` selv.

Default-sett (6 MCP-er):

- `SUPABASE_PROJECT_REF` — supabase-prosjekt-ref brukes i URL-interpolering (`${SUPABASE_PROJECT_REF}`). Auth via OAuth — ingen Bearer-token trengs. Fylles inn i `.env.local` i steg 07.
- `RESEND_API_KEY` — API-nøkkel fra Resend dashboard (kun hvis Resend brukes; stdio m/dotenv-wrapper). Fylles inn i steg 08.

Disse krever ingen env-variabel:
- `playwright` (@playwright/mcp) — browser-automasjon og E2E-testing
- `next-devtools` (next-devtools-mcp) — kobler til Next.js 16+ dev-serverens `/_next/mcp`-endepunkt automatisk for build/runtime-feil og live state
- `shadcn` (shadcn@latest mcp) — søk og hent shadcn-komponenter fra registries
- `chrome-devtools` (chrome-devtools-mcp) — live Chrome-debugging mot åpen browser (komplementerer Playwright)

Informér brukeren at disse må settes i `.env.local` for at MCP-serverne skal virke. Fjern eventuelt MCP-servere som ikke er aktuelle fra `.mcp.json`.

### Bevisst utelatte MCP-er

- **GitHub MCP** — ikke inkludert i default. `gh` CLI (brukes i steg 12) dekker samme behov (issues, PRs, Actions). Legg til manuelt om ønsket: hosted OAuth-endpoint `https://api.githubcopilot.com/mcp/` (type: http).
- **Vercel MCP** — ikke inkludert. Vercel-plugin (`npx plugins add vercel/vercel-plugin`) + `vercel` CLI i steg 13 dekker workflow-en. Legg til manuelt om ønsket: `https://mcp.vercel.com` (type: http, OAuth).
- **Context7 MCP** — ikke inkludert. Gir docs-oppslag for libraries, men `WebFetch` mot offisielle docs dekker det meste. Legg til manuelt med `CONTEXT7_API_KEY` i `.env.local` for høyere rate limits:

  ```json
  "context7": {
    "command": "cmd",
    "args": ["/c", "npx", "-y", "dotenv-cli", "-e", ".env.local", "--", "npx", "-y", "@upstash/context7-mcp"]
  }
  ```

### Windows-kompatibilitet: `cmd /c`-wrapper

Alle stdio-baserte MCP-er i `.mcp.json` bruker `"command": "cmd"` + `"args": ["/c", "npx", ...]` som wrapper. Uten dette feiler de silent på Windows (Node.js klarer ikke å spawn `npx`-binary direkte på Windows pga `.cmd`-extension-håndtering).

**Ikke-Windows-brukere** (mac/Linux): `cmd` finnes ikke. Fjern `"command": "cmd"` og de to første args-elementene (`"/c", "npx"`) så du sitter igjen med `"command": "npx"` + originale args. Eksempel:

```json
// Før (Windows-default):
"playwright": {
  "command": "cmd",
  "args": ["/c", "npx", "-y", "@playwright/mcp@latest"]
}

// Etter (mac/Linux):
"playwright": {
  "command": "npx",
  "args": ["-y", "@playwright/mcp@latest"]
}
```

HTTP-baserte MCP-er (supabase) er plattform-uavhengige — ingen endring trengs.

### Secrets via `dotenv-cli`-wrapper (stdio-MCP-er)

Stdio-MCP-er som trenger secrets (resend, context7) wraps med `dotenv-cli` så `.env.local` lastes inn før child-prosessen starter. Mønster:

```json
"resend": {
  "command": "cmd",
  "args": ["/c", "npx", "-y", "dotenv-cli", "-e", ".env.local", "--", "npx", "-y", "resend-mcp"]
}
```

Det som skjer:
1. `cmd /c npx -y dotenv-cli -e .env.local --` starter `dotenv-cli` som laster `.env.local` inn i sitt eget process-env.
2. `--` skiller `dotenv-cli`-args fra child-kommandoen.
3. `npx -y resend-mcp` starter faktisk MCP-server og arver env (inkl. `RESEND_API_KEY`).

**Fordel**: ingen `"env": { "VAR": "${VAR}" }`-blokker trengs i `.mcp.json`. Alt ligger i `.env.local` som allerede er single source of truth.

**HTTP-MCP-er** kan ikke wraps med dotenv-cli (ingen child-prosess). Hvis en HTTP-MCP krever secrets i headers, må Claude Code lese `.env.local` selv ved oppstart — dette virker i praksis siden Claude Code typisk plukker opp prosjektets `.env.local` ved session-start.

## Feilsøking

- **Grep finner treff i `oppstart/`**: det er OK — denne mappen slettes i steg 14.
- **Grep finner `{{GITHUB_REPO}}`, `{{VERCEL_PROJECT}}`, `{{SUPABASE_PROJECT_REF}}`**: forventet — de fylles inn i steg 07, 12 og 13.
- **Bruker bruker ikke Supabase/Resend/Vercel**: disse kan enten fjernes fra `.mcp.json` (i relevant steg) eller beholdes med `TBD` — MCP-serveren vil da ikke fungere før verdien er fylt inn.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 01 i `oppstart/CHECKLIST.md`.

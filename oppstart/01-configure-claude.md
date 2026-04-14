# Steg 01 — Configure Claude

## Mål

Fyll inn prosjektspesifikk metadata i `CLAUDE.md` og `.claude/mcp-servers.json` slik at Claude-konfigurasjonen reflekterer dette prosjektet.

## Forutsetninger

- `CLAUDE.md` og `.claude/mcp-servers.json` finnes i prosjektroten (lagt inn fra templaten).
- De inneholder placeholders på formen `{{UPPERCASE_SNAKE}}`.

## Kommandoer

1. Spør brukeren om følgende verdier:
   - **Prosjektnavn** (f.eks. `mitt-saas`) → `{{PROJECT_NAME}}`
   - **Kort beskrivelse** (én setning) → `{{PROJECT_DESCRIPTION}}`
   - **GitHub-repo** (f.eks. `brukernavn/mitt-saas` — kan være `TBD` hvis ikke opprettet ennå) → `{{GITHUB_REPO}}`
   - **Vercel-prosjektnavn** (eller `TBD`) → `{{VERCEL_PROJECT}}`
   - **Supabase project ref** (fra Supabase dashboard → Project Settings → Reference ID; eller `TBD` hvis Supabase ikke brukes) → `{{SUPABASE_PROJECT_REF}}`

   **Merk**: hvis brukeren ikke bruker Supabase eller Resend, kan de beholde `TBD`/placeholder — MCP-serveren vil bare ikke fungere før verdien er fylt inn. Alternativt: fjern serveren fra `.claude/mcp-servers.json`.

2. Gjør søk-og-erstatt i disse filene:
   - `CLAUDE.md`
   - `.claude/mcp-servers.json`
   - `README.md` (hvis det inneholder placeholders — sjekk)

3. Verifiser at ingen `{{` gjenstår:
   ```bash
   grep -r "{{" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=oppstart
   ```
   Forventet: 0 treff (utenom `oppstart/`-mappen).

## Forventet resultat

- Alle `{{PLACEHOLDER}}`-strenger er erstattet med konkrete verdier.
- `CLAUDE.md` har riktig prosjektnavn i H1 og beskrivelse.
- `.claude/mcp-servers.json` peker på riktig GitHub-repo og Vercel-prosjekt.

## Env-variabler MCP-serverne trenger

MCP-serverne i `.claude/mcp-servers.json` refererer til disse env-variablene (må finnes i brukerens shell eller `.env.local`):

- `GITHUB_TOKEN` — personlig access token fra GitHub
- `VERCEL_TOKEN` — access token fra Vercel dashboard
- `SUPABASE_ACCESS_TOKEN` — personlig access token fra Supabase (kun hvis Supabase brukes)
- `RESEND_API_KEY` — API-nøkkel fra Resend dashboard (kun hvis Resend brukes)

Informér brukeren at disse må settes for at MCP-serverne skal virke. Fjern eventuelt servere som ikke er aktuelle fra `.claude/mcp-servers.json`.

## Feilsøking

- **Grep finner treff i `oppstart/`**: det er OK — denne mappen slettes i steg 08.
- **Bruker vet ikke GitHub-repo ennå**: bruk `TBD` som verdi. Kan oppdateres senere.
- **Bruker bruker ikke Supabase/Resend**: fjern `supabase` / `resend` fra `.claude/mcp-servers.json` i stedet for å beholde placeholder.

## Avkrysning

Kryss av steg 01 i `oppstart/CHECKLIST.md` når ferdig.

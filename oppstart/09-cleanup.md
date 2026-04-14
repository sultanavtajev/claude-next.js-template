# Steg 09 — Cleanup

## Mål

Slett `oppstart/`-mappen og gjør første commit. Prosjektet er da klart til faktisk utvikling.

## Kommandoer

```bash
# Slett oppstart-instruksjonene — de er brukt og er ikke lenger nødvendige
rm -rf oppstart/

# Bekreft git-status
git status

# Stage alt og commit
git add .
git commit -m "chore: bootstrap prosjekt fra template"
```

## Forventet resultat

- `oppstart/`-mappen er borte.
- Én commit i git-loggen: "chore: bootstrap prosjekt fra template" med alle filene i prosjektet.
- `git status` viser ren working tree.

## Restart IDE og Claude Code

**Viktig**: før brukeren begynner å jobbe i prosjektet, må både IDE og Claude Code restartes for at endringene skal tre i kraft:

- **MCP-servere** i `.claude/mcp-servers.json` plukkes kun opp ved oppstart — nye servere blir ikke tilgjengelige før Claude starter på nytt.
- **`settings.json`** og **permissions** leses inn ved oppstart.
- **Nye skills og agents** registreres ved oppstart.

### Fremgangsmåte

1. Lukk Claude Code (`/exit` eller lukk terminal-sessionen).
2. Lukk IDE (f.eks. VS Code).
3. Åpne IDE på nytt i prosjektmappen.
4. Start Claude Code på nytt: `claude`.
5. **Verifiser MCP-servere**: kjør `/mcp` i Claude Code og sjekk at alle konfigurerte servere står som connected. Manglende tilkobling betyr som regel at env-variabel mangler eller API-nøkkel er ugyldig.

Informér brukeren om dette som siste instruksjon.

## Etterarbeid (ikke en del av dette steget — informasjon til brukeren)

Etter bootstrap er ferdig og Claude/IDE er restartet, er det typisk disse oppgavene brukeren vil gjøre:

1. **Opprette GitHub-repo** og pushe: `gh repo create && git push -u origin main`.
2. **Koble til Vercel**: `vercel link` og sette env-variabler i Vercel-dashboardet.
3. **Sette opp lokal Postgres** (eller Supabase/Neon) og kjøre `pnpm db:migrate`.
4. **Registrere GitHub OAuth-app** for auth.
5. **Fylle inn `.env.local`** med faktiske verdier.

Disse skrittene gjøres utenfor oppstart-flyten fordi de krever eksterne ressurser (kontoer, tjenester).

## Avkrysning

Kryss av steg 09 i `oppstart/CHECKLIST.md` — men fordi mappen slettes i dette steget, er avkrysningen symbolsk. Når du er her og alt over er OK, er bootstrap fullført.

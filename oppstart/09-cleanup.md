# Steg 09 — Cleanup

## Mål

Slett `oppstart/`-mappen og `TEMPLATE.md`, lag final commit uten template-artefaktene, og push til remote (hvis opprettet i steg 08).

## Sjekkliste

- [ ] `rm -rf oppstart/` kjørt
- [ ] `rm TEMPLATE.md` kjørt (templatens egen dokumentasjon — ikke en del av prosjektet)
- [ ] `git status` viser at `oppstart/` og `TEMPLATE.md` er fjernet, ingen andre uventede endringer
- [ ] Final commit laget: `"chore: fjern template-artefakter etter bootstrap"`
- [ ] (Hvis remote fra steg 08) `git push origin main` kjørt
- [ ] (Hvis feature-branch) synket og pushet til `origin/feature`
- [ ] IDE/Claude-restart-instruksjoner gitt til bruker (lukk + åpne, `/mcp`-verifisering)

Kryss av hver `[ ]` → `[x]` fortløpende. Siste boks er symbolsk siden mappen slettes i samme steg — når alle bokser er `[x]`, marker steg 09 i master-CHECKLIST.md som ferdig. Bootstrap er da fullført.

## Kommandoer

```bash
# Slett oppstart-instruksjonene og template-dokumentasjonen
rm -rf oppstart/
rm TEMPLATE.md

# Bekreft git-status — skal vise at oppstart/ og TEMPLATE.md er slettet
git status

# Stage slettingen og commit
git add -A
git commit -m "chore: fjern template-artefakter etter bootstrap"
```

## Push til remote (hvis steg 08 opprettet GitHub-repo)

```bash
git push origin main

# Hvis feature-branch ble opprettet i steg 08
git checkout feature
git merge main --ff-only
git push origin feature
git checkout main
```

## Forventet resultat

- `oppstart/`-mappen er borte.
- `TEMPLATE.md` er borte.
- To commits i loggen:
  1. `"chore: bootstrap fra claude-next.js-template"` (fra steg 08)
  2. `"chore: fjern template-artefakter etter bootstrap"` (fra dette steget)
- `git status` viser ren working tree.
- (Hvis remote satt opp) Begge branches pushet til GitHub.

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

## Etterarbeid (informasjon til brukeren)

Etter bootstrap er ferdig og Claude/IDE er restartet, er det typisk disse oppgavene brukeren vil gjøre:

1. **Koble til Vercel**: `vercel link` og sette env-variabler i Vercel-dashboardet.
2. **Kjøre Supabase-migrasjoner** mot linket prosjekt: `pnpm db:push` (hvis du har schema-endringer).
3. **Fylle inn `.env.local`** med faktiske verdier fra Supabase dashboard og eventuelle tredjeparts-tjenester (Resend, Context7).
4. **Aktivere OAuth-providers** i Supabase dashboard hvis du vil støtte GitHub/Google-innlogging.

Disse skrittene gjøres utenfor oppstart-flyten fordi de krever eksterne ressurser (kontoer, tjenester).

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, marker steg 09 i `oppstart/CHECKLIST.md` som ferdig — avkrysningen er symbolsk siden mappen slettes i samme steg. Bootstrap er da fullført.

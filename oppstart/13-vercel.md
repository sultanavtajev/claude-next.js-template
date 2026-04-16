# Steg 13 — Vercel (valgfri)

## Mål

Link prosjektet til Vercel for deploy, autoriser Vercel MCP, push env-variabler automatisk, konfigurer Supabase Auth URLs mot production, og fyll inn `{{VERCEL_PROJECT}}`-placeholder. Valgfri — hopp over hvis brukeren ikke deployer til Vercel.

## Sjekkliste

### Del 1 — Link
- [ ] `AskUserQuestion`: skal Vercel linkes nå?
- [ ] (Hvis ja) Pre-flight: `vercel --version` OK
- [ ] (Hvis ja) Vercel MCP autorisert via `/mcp` → vercel i Claude Code (OAuth-flow fullført)
- [ ] (Hvis ja) `vercel whoami` OK (bruker har kjørt `vercel login` om nødvendig)
- [ ] (Hvis ja) `vercel link` kjørt; `.vercel/project.json` finnes
- [ ] (Hvis ja) `{{VERCEL_PROJECT}}` erstattet i `CLAUDE.md`

### Del 2 — Push env-variabler til Vercel
- [ ] (Hvis ja) `.env.local` lest, variabler listet opp
- [ ] (Hvis ja) `AskUserQuestion`: push env-vars til Vercel automatisk?
- [ ] (Hvis bruker valgte push) alle ikke-sensitive vars pushet til production + preview + development
- [ ] (Hvis bruker valgte push) sensitive vars (service role key) pushet til production + preview (ikke development)
- [ ] (Hvis ja) sjekket om siste deploy feilet (typisk ja, siden env manglet) — redeploy trigget

### Del 3 — Supabase Auth URL Configuration (hvis Supabase ble satt opp i steg 07)
- [ ] (Hvis ja) Production-URL hentet fra Vercel (`vercel ls` eller `.vercel/project.json` + API)
- [ ] (Hvis ja) `SUPABASE_ACCESS_TOKEN` verifisert å finnes i `.env.local`
- [ ] (Hvis ja) `AskUserQuestion`: konfigurer Supabase Auth URLs automatisk?
- [ ] (Hvis bruker valgte konfigurering) Site URL + Redirect URLs PATCH-et via Supabase Management API

Kryss av hver `[ ]` → `[x]` fortløpende. Hele steget er valgfritt — hvis bruker svarer "Nei" på første spørsmål, marker steg 13 i `oppstart/CHECKLIST.md` som ferdig (bare spørsmålet krysses av) og gå til steg 14. Del 2 og 3 er også individuelt valgfri — bruker kan si "push selv senere" og fortsatt krysse av steget.

## Pre-flight

- `vercel` CLI installert. Sjekk med `vercel --version`. Hvis ikke: `pnpm add -g vercel`.
- `dotenv-cli` installert lokalt (kommer fra steg 09). Sjekk med `pnpm dotenv --version`. Brukes til å laste `.env.local` inn i bash-blokkene under cross-platform.
- For Del 3 (Supabase Auth URLs): `SUPABASE_ACCESS_TOKEN` må finnes i `.env.local`. Hvis ikke: be bruker hente personal access token fra `https://supabase.com/dashboard/account/tokens` og legge i `.env.local`.

## Del 1 — Link Vercel-prosjekt

### 1. Spør om bruker vil linke Vercel

Bruk `AskUserQuestion`:

| Spørsmål | Header | Valg |
|----------|--------|------|
| Skal prosjektet linkes til Vercel nå? | Vercel | Ja, link nå · Nei, hopp over |

### 2. Hvis "Nei"

Behold `{{VERCEL_PROJECT}}`-placeholderen og hopp til "Forventet resultat". Bruker kan kjøre `vercel link` senere.

### 3. Hvis "Ja" — autoriser offisiell Vercel MCP

Vercel har en offisiell remote MCP-server på `https://mcp.vercel.com` med OAuth-basert autentisering. Templaten har den allerede i `.mcp.json`, men brukeren må autorisere den første gang:

1. I Claude Code-sessionen: kjør `/mcp` → velg `vercel` → følg OAuth-flow i browser.
2. Etter autorisering får Claude tilgang til: docs-søk, team/project-håndtering, deployments, logs.

### 4. Verifiser Vercel-CLI-autentisering

```bash
vercel whoami
```

Hvis ikke autentisert, si til brukeren:

> "Kjør `vercel login` i terminalen og velg metode (GitHub, GitLab, email). Si fra når du er ferdig."

Vent på bekreftelse.

### 5. Link prosjektet

```bash
vercel link
```

Dette er interaktivt — Vercel spør hvilken scope (org/team) og prosjektnavn. Brukeren må svare selv i terminalen. Be dem velge prosjektnavn som matcher GitHub-repo-navnet for konsistens.

### 6. Hent Vercel-prosjektnavn fra `.vercel/project.json`

Etter link genereres `.vercel/project.json` lokalt med `orgId` og `projectId`. Les feltet `projectId` eller spør brukeren hva de kalte prosjektet. Fyll inn `{{VERCEL_PROJECT}}`-placeholder i:
- `CLAUDE.md`

`.vercel/` er allerede i `.gitignore` — lokal-only.

## Del 2 — Push env-variabler til Vercel

### 1. Les `.env.local`

Les filen og list opp variablene som finnes. Typisk fra template-oppsettet:

| Variabel | Environments | Merknad |
|----------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | production, preview, development | Offentlig — trygg i alle env |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | production, preview, development | Offentlig — trygg i alle env |
| `SUPABASE_SERVICE_ROLE_KEY` | production, preview | **Sensitive** — Vercel blokkerer i development (bruker `.env.local` lokalt) |
| `RESEND_API_KEY` | production, preview, development | Hvis Resend brukt i steg 08 |
| (andre) | (etter skjønn) | |

### 2. Bekreft med bruker

Bruk `AskUserQuestion`:

| Spørsmål | Header | Valg |
|----------|--------|------|
| Push disse env-variablene til Vercel nå (production + preview + development)? | Push env | Ja, push nå · Nei, jeg gjør det selv senere |

List opp variablene klart i prompt-teksten slik at bruker ser hva som blir pushet.

### 3. Hvis "Ja" — push via CLI

`vercel env add` tar value fra stdin når piped. Vi wraps hele loop-en med `dotenv -e .env.local --` så `.env.local`-vars blir tilgjengelig i bash-prosessen (cross-platform — fungerer i bash, PowerShell, cmd):

```bash
dotenv -e .env.local -- bash -c '
  # Liste over vars vi vil pushe (les fra Bash sin env etter dotenv-load)
  VARS="NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY SUPABASE_SERVICE_ROLE_KEY RESEND_API_KEY"

  for key in $VARS; do
    value="${!key}"
    [ -z "$value" ] && continue  # skip tomme

    case "$key" in
      SUPABASE_SERVICE_ROLE_KEY)
        envs="production preview" ;;  # sensitive — Vercel blokkerer i development
      *)
        envs="production preview development" ;;
    esac

    for env in $envs; do
      printf "%s" "$value" | vercel env add "$key" "$env" --force
    done
  done
'
```

`--force` overskriver hvis variabelen finnes fra før. Listen `VARS` justeres etter hva templaten faktisk bruker (les fra `src/env.ts` for sannheten).

Alternativ for én og én var manuelt:
```bash
dotenv -e .env.local -- bash -c 'printf "%s" "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --force'
```

Rapportér til bruker hvilke vars som ble satt per environment.

### 4. Redeploy hvis siste deploy feilet

Første push til GitHub (fra steg 12) trigger ofte deploy _før_ env-vars ble pushet — den feiler typisk med `invalid_type` eller missing env. Sjekk:

```bash
vercel ls | head -5
```

Eller bruk Vercel MCP: `mcp__vercel__list_deployments` med `projectId` fra `.vercel/project.json`.

Hvis siste deploy har `● Error`-status:

```bash
# Finn URL til siste feilede deploy
FAILED_URL=$(vercel ls --prod 2>&1 | grep -m1 "● Error" | awk '{print $2}')

# Redeploy (bygger på nytt med oppdaterte env-vars)
vercel redeploy "$FAILED_URL"
```

Alternativt: `git commit --allow-empty -m "chore: redeploy med env-vars" && git push` trigger en ny deploy via GitHub-integrasjonen.

Rapportér deploy-URL til bruker når den er grønn.

### 5. Hvis "Nei, jeg gjør det selv senere"

Informér bruker:

> "OK — du kan kjøre `vercel env add <NAVN> production` for hver variabel manuelt senere. Eller gå til Vercel dashboard → Project → Settings → Environment Variables. Husk at `SUPABASE_SERVICE_ROLE_KEY` må markeres som **Sensitive** og utelates fra Development."

## Del 3 — Supabase Auth URL Configuration

Hopp over hvis Supabase ikke ble satt opp i steg 07 (bruker valgte "hopp over").

### Bakgrunn

Supabase Auth bruker `Site URL` og `Redirect URLs` til:
- Confirmation-lenker i signup-emails
- OAuth-callback-redirects
- Magic link-redirects
- Password-reset-lenker

I utvikling er `http://localhost:3000/**` pre-konfigurert. For produksjon må Vercel-URL-en legges til — ellers brekker auth-flyten i prod.

### 1. Hent production-URL

Fra `.vercel/project.json`:
```bash
PROJECT_ID=$(jq -r .projectId .vercel/project.json)
TEAM_ID=$(jq -r .orgId .vercel/project.json)
```

Hent siste vellykkede production-deploy-URL via CLI:
```bash
PROD_URL=$(vercel ls --prod 2>&1 | grep -m1 "● Ready" | awk '{print $2}')
# F.eks. https://mitt-prosjekt.vercel.app
```

Eller via Vercel MCP: `mcp__vercel__get_project` → les `alias`-feltet (det stabile `<prosjekt>.vercel.app`-domenet).

Produksjons-URL-en bør være den stabile `<prosjekt>.vercel.app` (ikke `<hash>-<team>.vercel.app` som er deploy-spesifikk).

### 2. Verifiser `SUPABASE_ACCESS_TOKEN`

```bash
grep -q "^SUPABASE_ACCESS_TOKEN=" .env.local || echo "MISSING"
```

Hvis manglende: be bruker hente token fra `https://supabase.com/dashboard/account/tokens` og legge til i `.env.local`:

```
SUPABASE_ACCESS_TOKEN=sbp_...
```

### 3. Bekreft med bruker

Bruk `AskUserQuestion`:

| Spørsmål | Header | Valg |
|----------|--------|------|
| Konfigurer Supabase Auth URLs automatisk (Site URL + Redirect URLs for prod/preview/localhost)? | Auth URLs | Ja, konfigurer nå · Nei, jeg gjør det i dashboard |

### 4. Hvis "Ja" — kall Supabase Management API

Hent `SUPABASE_PROJECT_REF` fra `.env.local` eller `CLAUDE.md` (ble fylt inn i steg 07). Wrap hele bash-blokken med `dotenv -e .env.local --` så `SUPABASE_ACCESS_TOKEN` og `SUPABASE_PROJECT_REF` blir tilgjengelig:

```bash
dotenv -e .env.local -- bash -c '
  PROD_URL="https://mitt-prosjekt.vercel.app"  # fra steg 1 over
  TEAM=$(jq -r .orgId .vercel/project.json | cut -d_ -f2)  # f.eks. "sultanavtajevs"

  # Bygg redirect-liste (komma-separert streng)
  REDIRECTS="${PROD_URL}/**,https://*-${TEAM}.vercel.app/**,http://localhost:3000/**"

  # PATCH auth config
  curl -X PATCH "https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth" \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"site_url\": \"${PROD_URL}\",
      \"uri_allow_list\": \"${REDIRECTS}\"
    }"
'
```

**Merk**: feltnavnet for redirect-URL-er er `uri_allow_list` (komma-separert streng) i Management API-et. Hvis API-et returnerer 400 med "unknown field": GET først for å inspisere aktuelt schema (se neste steg).

### 5. Verifiser

```bash
dotenv -e .env.local -- bash -c '
  curl -s "https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth" \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" | jq "{site_url, uri_allow_list}"
'
```

Forventet: begge feltene satt til de nye verdiene.

### 6. Hvis "Nei, jeg gjør det i dashboard"

Informér bruker:

> "OK — gå til Supabase dashboard → Authentication → URL Configuration og legg inn:
> - **Site URL**: `${PROD_URL}`
> - **Redirect URLs**: `${PROD_URL}/**`, `https://*-<team>.vercel.app/**`, `http://localhost:3000/**`
>
> Uten dette vil auth-emails og OAuth-callbacks peke til localhost eller brekke i prod."

## Forventet resultat

- (Hvis Vercel ble linket) `{{VERCEL_PROJECT}}` erstattet med prosjektnavn. `.vercel/project.json` finnes lokalt. Vercel MCP tilgjengelig i Claude Code.
- (Hvis env-push) Env-variabler synlige i Vercel dashboard under Project → Settings → Environment Variables. Sensitive vars riktig merket.
- (Hvis env-push) Production-deploy grønn etter redeploy (hvis første feilet).
- (Hvis Auth URLs satt) Supabase dashboard viser riktig Site URL + Redirect URLs. Signup/OAuth/magic-links fungerer i prod.
- (Hvis hoppet over) `{{VERCEL_PROJECT}}` beholdes som placeholder. Bruker må gjøre alt manuelt.

## Feilsøking

- **`vercel: command not found`**: `pnpm add -g vercel` (trengs for CLI-kommandoene; MCP-serveren fungerer uavhengig).
- **`/mcp vercel` viser "Needs authentication"**: bruker må fullføre OAuth-flyten i browser. Browser åpnes automatisk ved første kall.
- **Vercel MCP returnerer 401**: autorisering utløpt — kjør `/mcp` → vercel → re-auth.
- **`vercel link` krever interaktiv input**: bruker må klikke gjennom selv — Claude kan ikke fullføre interaktive CLI-prompts.
- **`vercel env add` feiler med "already exists"**: variabelen finnes fra før for den environmenten. Legg til `--force` for å overskrive.
- **`SUPABASE_SERVICE_ROLE_KEY` feiler i development**: forventet — Vercel blokkerer sensitive vars der. Hopp over development-environment for den.
- **Første deploy etter push til GitHub feilet**: env-vars ble satt etter push. Kjør `vercel redeploy <failed-url>` eller `git commit --allow-empty -m "redeploy" && git push`.
- **Supabase Management API returnerer 401**: `SUPABASE_ACCESS_TOKEN` ugyldig eller manglende scope. Re-generer token i Supabase dashboard.
- **Management API returnerer 400 "unknown field"**: feltnavnet kan ha endret seg. GET config først for å se aktuelt schema: `curl https://api.supabase.com/v1/projects/${REF}/config/auth -H "Authorization: Bearer ${TOKEN}"`.
- **Preview-URLer brekker auth**: sjekk at wildcard `https://*-<team>.vercel.app/**` er i Redirect URLs. Hvis ikke: legg til via samme PATCH-kall.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Hele steget er valgfritt — marker steg 13 i `oppstart/CHECKLIST.md` som ferdig når alle relevante deler er behandlet (bruker kan hoppe over hele eller deler).

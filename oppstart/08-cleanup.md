# Steg 08 — Cleanup

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

## Etterarbeid (ikke en del av dette steget — informasjon til brukeren)

Etter bootstrap er ferdig, er det typisk disse oppgavene brukeren vil gjøre:

1. **Opprette GitHub-repo** og pushe: `gh repo create && git push -u origin main`.
2. **Koble til Vercel**: `vercel link` og sette env-variabler i Vercel-dashboardet.
3. **Sette opp lokal Postgres** (eller Supabase/Neon) og kjøre `pnpm db:migrate`.
4. **Registrere GitHub OAuth-app** for auth.
5. **Fylle inn `.env.local`** med faktiske verdier.

Disse skrittene gjøres utenfor oppstart-flyten fordi de krever eksterne ressurser (kontoer, tjenester).

## Avkrysning

Kryss av steg 08 i `oppstart/CHECKLIST.md` — men fordi mappen slettes i dette steget, er avkrysningen symbolsk. Når du er her og alt over er OK, er bootstrap fullført.

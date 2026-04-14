---
name: nextjs-verification
description: Kjør full verifikasjonsloop (typecheck, lint, build) etter endringer og fiks feil systematisk. Bruk etter større refactors, før commit, eller når brukeren ber om "sjekk at alt virker".
---

# Next.js Verification Loop

Verifiser at koden er gyldig etter endringer. Rekkefølgen er **kritisk** — billigste sjekk først.

## Standardloop

Kjør disse kommandoene i rekkefølge. Hopp til neste kun når forrige er grønn:

### 1. TypeScript

```bash
pnpm typecheck
# eller hvis script mangler:
pnpm tsc --noEmit
```

Fiks alle TS-feil før du går videre. ESLint og build har ingen vits å sjekke når typene er feil.

### 2. ESLint

```bash
pnpm lint
```

Kjør `pnpm lint --fix` for auto-fiksbare. Manuelt fiks resten. Warnings er OK å la stå hvis de er intensjonelle — men rapporter dem.

### 3. Build

```bash
pnpm build
```

Dette fanger opp ting typecheck ikke tar:
- Manglende `"use client"` / `"use server"` der det trengs
- Feil i server-only imports i client-komponenter
- `next/image`-konfigurasjon, route-metadata, osv.

### 4. (Valgfritt) Dev-sanitycheck

```bash
pnpm dev
```

Kun hvis brukeren har bedt om UI-verifikasjon. Åpne relevante ruter i nettleser, sjekk at det du endret faktisk virker.

## Vanlige feilkilder

| Symptom | Årsak | Fiks |
|---------|-------|------|
| `You're importing a component that needs useState` | Mangler `"use client"` | Legg til direktivet øverst i komponenten |
| `Dynamic server usage: cookies()` | Bruker dynamisk API i statisk rute | Legg `export const dynamic = "force-dynamic"` eller flytt til Server Action |
| Hydration mismatch | Server og client rendrer ulikt | Unngå `Date.now()`, `Math.random()`, browser-API i render |
| `Cannot find module '@/...'` | tsconfig.json-paths mangler | Sjekk at `"paths": { "@/*": ["./src/*"] }` er satt |
| Supabase server-klient feiler i Client Component | `@/lib/supabase/server` bruker `cookies()` — server-only | Bruk `@/lib/supabase/client` i browser |

## Etter verifikasjon

Hvis alt er grønt: rapporter kort "Typecheck, lint, build grønt" og fortsett med det brukeren ba om.

Hvis noe feiler gjennom flere iterasjoner: stopp, rapporter den gjenstående feilen, og spør brukeren om hjelp før du prøver mer.

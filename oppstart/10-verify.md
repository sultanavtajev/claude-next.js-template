# Steg 10 — Verify

## Mål

Bekreft at alle deler av oppsettet fungerer: dev-server, bygg, lint, typecheck.

## Sjekkliste

- [ ] `pnpm install` kjørt uten feil
- [ ] `pnpm db:types` kjørt (eller markert hoppet over hvis Supabase CLI ikke er linket)
- [ ] `pnpm lint`: 0 errors
- [ ] `pnpm typecheck` (eller `pnpm tsc --noEmit`): 0 errors
- [ ] `pnpm build`: lykkes (env-variabel-advarsler rapporteres, men blokkerer ikke)
- [ ] (Valgfritt) `pnpm dev` testet mot `http://localhost:3000`, dev-server stoppet

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]` (valgfritt-punkt unntatt), marker steg 10 i `oppstart/CHECKLIST.md` og gå til steg 11.

## Kommandoer (i rekkefølge)

```bash
pnpm install                    # sikre at alle deps er på plass
pnpm db:types                   # generer Supabase TypeScript-typer (hvis supabase-prosjekt er linket)
pnpm lint                       # ESLint
pnpm typecheck || pnpm tsc --noEmit   # hvis typecheck-script ikke finnes, kjør tsc direkte
pnpm build                      # produksjonsbygg
```

**Merk**: `pnpm db:types` kan hoppes over hvis brukeren ikke har linket Supabase CLI til prosjektet ennå — da finnes det ingen schema å generere fra. Rapporter i så fall at steget er hoppet over, ikke feilet.

## Forventet resultat

- **`pnpm install`**: ingen feil, warnings er OK.
- **`pnpm db:types`**: enten "Generated types" eller hoppet over (hvis Supabase ikke er linket).
- **`pnpm lint`**: 0 errors (warnings akseptable, men rapporter dem).
- **`pnpm typecheck`**: 0 errors.
- **`pnpm build`**: bygger uten feil. Advarsler om manglende env-variabler er forventet hvis `.env.local` ikke er fylt inn — rapporter, men ikke blokker.

## Dev-sjekk (valgfritt men anbefalt)

```bash
pnpm dev
```

- Åpne `http://localhost:3000` — velkomstsiden skal vises.
- Trykk `Ctrl+C` for å stoppe.

## Feilsøking

- **Build feiler pga env-variabler**: rapporter hvilke. Brukeren må fylle ut `.env.local` før en ekte build kan kjøres. Dette er ikke blokkerende for neste steg.
- **TypeScript-feil om `@/lib/supabase/server`**: sjekk at `tsconfig.json` har `"paths": { "@/*": ["./src/*"] }`.
- **ESLint-feil i generert kode**: kjør `pnpm lint --fix`.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]` (dev-sjekk er valgfri), kryss av steg 10 i `oppstart/CHECKLIST.md`.

# Steg 07 — Verify

## Mål

Bekreft at alle deler av oppsettet fungerer: dev-server, bygg, lint, typecheck.

## Kommandoer (i rekkefølge)

```bash
pnpm install                    # sikre at alle deps er på plass
pnpm db:generate                # Prisma-klient
pnpm lint                       # ESLint
pnpm typecheck || pnpm tsc --noEmit   # hvis typecheck-script ikke finnes, kjør tsc direkte
pnpm build                      # produksjonsbygg
```

## Forventet resultat

- **`pnpm install`**: ingen feil, warnings er OK.
- **`pnpm db:generate`**: "Generated Prisma Client".
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

- **Build feiler pga env-variabler**: rapporter hvilke. Brukeren må fylle ut `.env.local` før en ekte build kan kjøres. Dette er ikke blokkerende for steg 08.
- **TypeScript-feil om `@/lib/auth`**: sjekk at `tsconfig.json` har `"paths": { "@/*": ["./src/*"] }`.
- **ESLint-feil i generert kode**: kjør `pnpm lint --fix`.

## Avkrysning

Kryss av steg 07 i `oppstart/CHECKLIST.md` når ferdig.

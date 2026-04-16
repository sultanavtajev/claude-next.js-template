# Steg 10 — Verify

## Mål

Bekreft at alle deler av oppsettet fungerer: dev-server, bygg, lint, typecheck. Oppdater `eslint.config.mjs` for å ignorere template-mapper, og kjør **ren build før typecheck** så `.next/types/*` er ferske (Next.js genererer type-filer derfra — utdaterte `.next/types` gir falske TS-errors etter `[locale]`-restruktureringen i steg 05).

## Sjekkliste

- [ ] `pnpm install` kjørt uten feil
- [ ] `eslint.config.mjs` oppdatert med `globalIgnores([".claude/**", "scripts/**", "supabase/**"])` i tillegg til default-ignores
- [ ] `pnpm db:types` kjørt (eller markert hoppet over hvis Supabase CLI ikke er linket)
- [ ] `pnpm lint`: 0 errors
- [ ] `rm -rf .next && pnpm build`: bygger uten feil (ren build — ingen stale type-filer)
- [ ] `pnpm typecheck` (eller `pnpm tsc --noEmit`): 0 errors
- [ ] (Valgfritt) `pnpm dev` testet mot `http://localhost:3000`, dev-server stoppet

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]` (valgfritt-punkt unntatt), marker steg 10 i `oppstart/CHECKLIST.md` og gå til steg 11.

## Kommandoer (i rekkefølge)

```bash
pnpm install                    # sikre at alle deps er på plass

# Oppdater eslint.config.mjs (se seksjonen under) før lint — ellers fanger ESLint opp .claude/-scripts som har CommonJS requires
pnpm db:types                   # generer Supabase TypeScript-typer (hvis supabase-prosjekt er linket)
pnpm lint                       # ESLint
rm -rf .next && pnpm build      # ren build — regenerer .next/types/* så typecheck kjører mot friske types
pnpm typecheck || pnpm tsc --noEmit   # hvis typecheck-script ikke finnes, kjør tsc direkte
```

**Merk**: `pnpm db:types` kan hoppes over hvis brukeren ikke har linket Supabase CLI til prosjektet ennå — da finnes det ingen schema å generere fra. Rapporter i så fall at steget er hoppet over, ikke feilet.

## Oppdater `eslint.config.mjs`

create-next-app genererer `eslint.config.mjs` med default-ignores for `.next/**`, `out/**`, `build/**`, `next-env.d.ts`. Utvid med våre template-mapper:

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Template-spesifikke tillegg:
    ".claude/**",   // hooks/scripts bruker CommonJS requires — ikke lint-relevant
    "scripts/**",   // dev-scripts (supabase-snapshot.ts osv.)
    "supabase/**",  // migrations-SQL + generert config
  ]),
  ...compat.extends("next/core-web-vitals", "next/typescript"),
]);

export default eslintConfig;
```

**Hvorfor**: uten `.claude/**`-ignore fanger ESLint opp 15–20 feil i `.claude/hooks/scripts/*.js` (CommonJS `require()`-bruk). `scripts/`- og `supabase/`-mappene inneholder heller ikke app-kode som trenger ESLint.

## Hvorfor `rm -rf .next` før typecheck?

Next.js 16+ genererer `.next/types/validator.ts` og `.next/types/routes.d.ts` basert på app-mappens struktur. Etter restruktureringen i steg 05 (`app/` → `app/[locale]/`) kan `.next/types/*` inneholde stale paths som ikke matcher gjeldende routes. Dette gir TS2344/TS2307-errors i typecheck som ikke finnes etter en ren build.

`rm -rf .next && pnpm build` regenererer `.next/types/*` fra scratch basert på dagens app-struktur. Etter det kjører typecheck rent.

## Forventet resultat

- **`pnpm install`**: ingen feil, warnings er OK.
- **`eslint.config.mjs`**: oppdatert med tre nye ignore-patterns.
- **`pnpm db:types`**: enten "Generated types" eller hoppet over (hvis Supabase ikke er linket).
- **`pnpm lint`**: 0 errors (warnings akseptable, men rapporter dem).
- **`rm -rf .next && pnpm build`**: bygger uten feil. Advarsler om manglende env-variabler er forventet hvis `.env.local` ikke er fylt inn — rapporter, men ikke blokker.
- **`pnpm typecheck`**: 0 errors (etter ren build).

## Dev-sjekk (valgfritt men anbefalt)

```bash
pnpm dev
```

- Åpne `http://localhost:3000` — velkomstsiden skal vises.
- Trykk `Ctrl+C` for å stoppe.

## Feilsøking

- **Build feiler pga env-variabler**: rapporter hvilke. Brukeren må fylle ut `.env.local` før en ekte build kan kjøres. Dette er ikke blokkerende for neste steg.
- **TypeScript-feil om `@/lib/supabase/server`**: sjekk at `tsconfig.json` har `"paths": { "@/*": ["./src/*"] }`.
- **Typecheck feiler med TS2344/TS2307 i `.next/types/validator.ts`**: stale types. Kjør `rm -rf .next && pnpm build && pnpm typecheck`.
- **ESLint rapporterer 15+ feil i `.claude/hooks/scripts/*.js`**: du har hoppet over `eslint.config.mjs`-oppdateringen — legg inn `globalIgnores([".claude/**", ...])` og kjør lint på nytt.
- **ESLint-feil i generert kode**: kjør `pnpm lint --fix`.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]` (dev-sjekk er valgfri), kryss av steg 10 i `oppstart/CHECKLIST.md`.

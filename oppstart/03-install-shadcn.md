# Steg 03 — shadcn/ui

## Pre-flight: sjekk docs

Før installasjon, hent `https://ui.shadcn.com/docs/installation/next` og bekreft:
- At `npx shadcn@latest init -d` fortsatt er riktig CLI-form (pakken het tidligere `shadcn-ui`; prompts ble fjernet i favor av default-presets i senere versjoner).
- Hvilket default-preset som brukes (typisk `base-nova` i 2026-versjoner — shadcn-default-baseline).
- Anbefalt basiskomponent-sett (enkelte komponenter er deprecated og erstattet — `form` → `field`, `toast` → `sonner`).

Hvis CLI har endret seg: følg docs.

## Mål

Initialiser shadcn/ui med default-preset og legg til basissett av komponenter.

## Sjekkliste

- [ ] Pre-flight docs-sjekk kjørt
- [ ] `npx shadcn@latest init -d` kjørt (default-flagget hopper over prompts — bruker `base-nova`-preset)
- [ ] `components.json` opprettet i roten
- [ ] `src/lib/utils.ts` inneholder `cn()`-helper
- [ ] `src/app/globals.css` oppdatert med shadcn-temavariabler via `@theme inline` (Tailwind v4 — ingen `tailwind.config.ts` lenger)
- [ ] Basiskomponenter lagt til: `button input label field card dialog sonner`
- [ ] Verifisering: midlertidig `<Button>` rendres i nettleser, fjernet etterpå

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 03 i `oppstart/CHECKLIST.md` og gå til steg 04.

## Kommandoer

```bash
# -d = default-preset (base-nova) — hopper over interaktive prompts
npx shadcn@latest init -d
```

`init -d` konfigurerer prosjektet med:
- Preset: `base-nova` (shadcn-default-baseline)
- CSS-variabler: ja (standard siden v2)
- Import-alias: `@/components`, `@/lib/utils` (standard)
- Tailwind v4: Style/Color/CSS variables-promptene fra eldre versjoner er fjernet — alt er nå i `globals.css` via `@theme inline`

Legg til basiskomponenter:

```bash
npx shadcn@latest add button input label field card dialog sonner
```

**Viktig om komponent-valg**:
- `form` er **deprecated** — bruk `field` (mer fleksibel field-wrapper).
- `toast` er **deprecated** — bruk `sonner` (toast-bibliotek som shadcn har adoptert).

## Forventet resultat

- `components.json` opprettet i roten med preset `base-nova`.
- `src/components/ui/` inneholder komponentfiler (`button.tsx`, `input.tsx`, `label.tsx`, `field.tsx`, `card.tsx`, `dialog.tsx`, `sonner.tsx`).
- `src/lib/utils.ts` inneholder `cn()`-helper.
- `src/app/globals.css` inneholder `@import "tailwindcss"` + shadcn-tema via `@theme inline`-blokk (OKLCH-farger).
- **Ingen `tailwind.config.ts`** — Tailwind v4 konfigureres i CSS. Dette er bevisst og nytt i Tailwind v4.

## Tailwind v4-notat

Tailwind v4 flyttet konfig fra JS (`tailwind.config.ts`) til CSS (`@theme` i `globals.css`). Dette betyr:
- Farger, fonts, spacing defineres i `globals.css` via `@theme inline { --color-primary: oklch(...); ... }`.
- shadcn-init genererer denne blokken automatisk.
- Hvis steg 04 (UI/UX design system) endrer palette, oppdateres `globals.css` (ikke `tailwind.config.ts`).

## Verifisering

Legg midlertidig inn en `<Button>` i `src/app/page.tsx` og bekreft i nettleser at den rendres. Fjern etterpå.

## Feilsøking

- **Import-alias virker ikke**: sjekk at `tsconfig.json` har `"paths": { "@/*": ["./src/*"] }` (genereres av create-next-app).
- **CSS-variabler virker ikke**: bekreft at `globals.css` importeres i `src/app/layout.tsx` og at `@theme inline`-blokken er intakt.
- **`form` eller `toast` lastes**: eldre docs — bruk `field` og `sonner` i stedet.
- **`init` ber om prompts tross `-d`**: CLI er enten eldre versjon eller `-d` har flyttet. Sjekk docs for gjeldende default-flag.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 03 i `oppstart/CHECKLIST.md`.

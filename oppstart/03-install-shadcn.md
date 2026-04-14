# Steg 03 — shadcn/ui

## Pre-flight: sjekk docs

Før installasjon, hent `https://ui.shadcn.com/docs/installation/next` og bekreft:
- At `npx shadcn@latest init` fortsatt er riktig CLI-pakke (tidligere het den `shadcn-ui`).
- Prompts og default-verdier ved init.
- Listen over anbefalte basiskomponenter.

Hvis CLI-pakken er endret eller prompts har ny struktur: følg docs.

## Mål

Initialiser shadcn/ui og legg til basissett av komponenter.

## Sjekkliste

- [ ] Pre-flight docs-sjekk kjørt
- [ ] `npx shadcn@latest init` kjørt og prompts besvart (Default / Slate / CSS variables: Yes)
- [ ] `components.json` opprettet i roten
- [ ] `src/lib/utils.ts` inneholder `cn()`-helper
- [ ] `tailwind.config.ts` og `src/app/globals.css` oppdatert med shadcn-temavariabler
- [ ] Basiskomponenter lagt til: `button input label form card dialog toast`
- [ ] Verifisering: midlertidig `<Button>` rendres i nettleser, fjernet etterpå

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 03 i `oppstart/CHECKLIST.md` og gå til steg 04.

## Kommandoer

```bash
npx shadcn@latest init
```

Svar i prompten:
- Style: **Default**
- Base color: **Slate** (eller brukers valg)
- CSS variables: **Yes**

Legg til basiskomponenter:

```bash
npx shadcn@latest add button input label form card dialog toast
```

## Forventet resultat

- `components.json` opprettet i roten.
- `src/components/ui/` inneholder komponentfiler (`button.tsx`, `input.tsx`, osv.).
- `src/lib/utils.ts` inneholder `cn()`-helper.
- `tailwind.config.ts` oppdatert med shadcn-temavariabler.
- `src/app/globals.css` inneholder CSS-variabler fra shadcn.

## Verifisering

Legg midlertidig inn en `<Button>` i `src/app/page.tsx` og bekreft i nettleser at den rendres. Fjern etterpå.

## Feilsøking

- **Import-alias virker ikke**: sjekk at `tsconfig.json` har `"paths": { "@/*": ["./src/*"] }`.
- **CSS-variabler virker ikke**: bekreft at `globals.css` importeres i `src/app/layout.tsx`.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 03 i `oppstart/CHECKLIST.md`.

# Steg 03 — shadcn/ui

## Mål

Initialiser shadcn/ui og legg til basissett av komponenter.

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

Kryss av steg 03 i `oppstart/CHECKLIST.md` når ferdig.

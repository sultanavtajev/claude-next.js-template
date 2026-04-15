# Steg 06 — Element Picker (dev-tool for AI-assistert utvikling)

## Pre-flight: sjekk docs

Hent `https://registry.npmjs.org/@sultanavtajev/element-picker` (JSON-response inneholder README) eller `https://www.npmjs.com/package/@sultanavtajev/element-picker` og bekreft:
- Gjeldende pakkenavn er `@sultanavtajev/element-picker`.
- Peer-dependencies (React ≥ 18, React DOM ≥ 18) er oppfylt.
- Eksport-navnet er `ElementPicker` (default).
- Keyboard-shortcut (Ctrl+Shift+X) er fortsatt aktiv.

## Mål

Installer og konfigurer **Element Picker** — en dev-only inspector som aktiveres med `Ctrl+Shift+X`. Brukeren kan hovre over et element, trykke, og kopiere komponent-hierarki + kildesti + CSS-selektorer til utklippstavlen. Denne informasjonen limes deretter rett inn i Claude Code for presis referanse når de skal gjøre endringer.

Verdien: eliminerer "hvilken komponent er det jeg klikket på?"-gjetting mellom bruker og Claude. Essensielt for AI-assistert frontend-utvikling.

## Sjekkliste

- [ ] Pre-flight docs-sjekk kjørt
- [ ] `pnpm add @sultanavtajev/element-picker` kjørt
- [ ] Import lagt til i `src/app/[locale]/layout.tsx`
- [ ] `<ElementPicker />` rendret innenfor `<body>`, wrappet i `{process.env.NODE_ENV === "development" && ...}`-sjekk
- [ ] Verifisert at komponenten ikke vises i produksjonsbygg (`pnpm build && pnpm start` → ingen Element Picker-artefakter)

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 06 i `oppstart/CHECKLIST.md` og gå til steg 07 (Supabase).

## Forutsetninger

- Steg 02 ferdig (Next.js + React 18+ installert).
- Steg 05 ferdig (layout.tsx er flyttet til `src/app/[locale]/layout.tsx`).

## Kommandoer

### 1. Installer pakken

```bash
pnpm add @sultanavtajev/element-picker
```

Pakken har `sonner` og `lucide-react` som transitive dependencies — begge er vanligvis allerede installert (sonner gjennom shadcn, lucide-react gjennom shadcn-komponenter).

### 2. Legg til `<ElementPicker />` i root layout

Rediger `src/app/[locale]/layout.tsx`:

```tsx
import { ElementPicker } from "@sultanavtajev/element-picker";
// ... andre imports ...

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // ... eksisterende locale-sjekk og provider-wrapping ...

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        {process.env.NODE_ENV === "development" && <ElementPicker />}
      </body>
    </html>
  );
}
```

**Viktig**: `process.env.NODE_ENV === "development"` sørger for at komponenten **ikke** bundles eller rendres i produksjon. Dette er viktig siden pakken er en dev-tool — ikke noe sluttbrukere skal se.

## Bruk (informasjon til brukeren — gis etter installasjon)

Etter oppsett:

1. Start dev-server: `pnpm dev`
2. Åpne appen i nettleser
3. Trykk **Ctrl+Shift+X** (Cmd+Shift+X på macOS) for å aktivere inspector
4. Hover over et element — tooltips viser komponent + kildesti
5. Klikk for å kopiere detaljer til utklippstavlen
6. Lim inn i Claude Code for presis referanse

## Forventet resultat

- `@sultanavtajev/element-picker` i `dependencies` (ikke `devDependencies` — pakken sjekker selv `NODE_ENV`).
- `<ElementPicker />` rendres i `src/app/[locale]/layout.tsx` kun i dev-mode.
- Ingen synlig effekt på produksjonsbygg.

## Feilsøking

- **`Module not found: Can't resolve '@sultanavtajev/element-picker'`**: installasjonen feilet — kjør `pnpm install` på nytt.
- **Element Picker vises ikke ved Ctrl+Shift+X**: bekreft at `process.env.NODE_ENV === "development"` — du er sannsynligvis i en prod-build. Kjør `pnpm dev`, ikke `pnpm start`.
- **Peer-dep-advarsel om React-versjon**: bekreft at `react` og `react-dom` er ≥ 18. Next.js 15+ har React 19, som bør være kompatibel.
- **Komponenten bundles i prod**: dobbelsjekk `process.env.NODE_ENV`-wrapperen. Next.js tree-shaker bort `false`-grenen ved build.

## Hvorfor dette hører hjemme i templaten

Templaten er bygd for Claude Code-workflow. Element Picker er designet spesifikt for å dele kontekst mellom en UI-utvikler og AI-assistenter — det reduserer friksjonen i "jeg vil endre den knappen" → "hvilken knapp?"-utvekslingen.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 06 i `oppstart/CHECKLIST.md`.

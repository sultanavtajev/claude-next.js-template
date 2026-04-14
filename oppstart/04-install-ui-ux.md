# Steg 04 — UI/UX design system (ui-ux-pro-max)

## Pre-flight: sjekk docs

Hent `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` og bekreft:
- Gjeldende CLI-kommando (`npx uipro-cli init --ai claude` eller nyere).
- Om pakkenavnet `uipro-cli` fortsatt er riktig.
- Liste over tilgjengelige stiler, palletter, font-pairings.

## Mål

Installer ui-ux-pro-max-skillen og bruk den til å etablere et **låst, prosjekt-spesifikt designsystem** som resten av utviklingen følger. Skillen gir intelligente anbefalinger basert på prosjekttype og målgruppe.

Resultat: én valgt kombinasjon av (stil + palette + fonts) som skrives inn i `src/app/globals.css` + `CLAUDE.md`. Ingen ad-hoc design-valg senere.

## Forutsetninger

- Steg 03 ferdig (shadcn/ui er initialisert med default-farger).
- Node.js + pnpm/npm tilgjengelig.
- Internett for CLI-nedlastning.

## Del 1 — Installer skillen

```bash
npx uipro-cli init --ai claude
```

Dette kopierer skill-filer til `.claude/skills/ui-ux-pro-max/`. Verifiser at mappen finnes:

```bash
ls .claude/skills/ui-ux-pro-max/
```

Forventet: SKILL.md + scripts/ + eventuelle støttefiler.

## Del 2 — Design discovery (interaktivt med brukeren)

**Viktig**: Still brukeren disse spørsmålene én etter én. Ikke gjett. Bruk svarene for å gi anbefalinger.

### Spørsmål 1: Prosjekttype

Hva er det primære formålet med applikasjonen?
- **SaaS / dashboard** (admin-panel, analytics, CRM)
- **Landing page / marketing** (produktside, portfolio, agent)
- **E-handel** (nettbutikk, bookingflyt)
- **Community / innhold** (blog, forum, media)
- **Intern verktøy** (intranett, HR-system, skjemaer)
- **Annet** — la bruker beskrive

### Spørsmål 2: Målgruppe

Hvem bruker appen?
- **B2B / enterprise** (profesjonelle, teknisk kompetente)
- **B2C / consumer** (allmennheten)
- **Utviklere / tech** (DX-fokusert)
- **Kreative / designere** (visuelt kresne)
- **Blandet / ukjent** (nøytral)

### Spørsmål 3: Vibe

Hvilken følelse skal appen gi?
- **Profesjonell** — trygg, seriøs, korporat
- **Minimalistisk** — rent, fokusert, luftig
- **Leken** — fargerik, uformell, engasjerende
- **Bold** — sterk, kontrast, selvsikker
- **Luksuriøs** — raffinert, monokrom, typografi-tung
- **Teknisk** — data-tett, funksjonell, kompakt

### Spørsmål 4: Primærfarge-retning

- **Nøytral** (gråskala + én accent) — trygt valg, passer SaaS/dashboards
- **Varm** (rød/oransje/gul/rosa) — energi, kreativ, retail
- **Kald** (blå/grønn/lilla) — tillit, finans, helse
- **Spesifikk brand-farge** — bruker oppgir hex-kode

### Spørsmål 5: Dark mode

- Bare light mode
- Bare dark mode
- Begge (default light, bryter til dark)
- Begge (default dark, bryter til light)

## Del 3 — Gi anbefalinger

Basert på svarene, bruk ui-ux-pro-max-skillen til å foreslå **2–3 kombinasjoner** med:

- **Stil** (f.eks. Minimalism, Flat, Bento Grid, Glassmorphism light, Modern SaaS)
- **Palette** (spesifikke HSL-verdier for `background`, `foreground`, `primary`, `secondary`, `accent`, `muted`, `border`, `destructive`)
- **Font pairing** (heading + body fra Google Fonts)
- **Justerende begrunnelse** — hvorfor denne kombinasjonen passer svarene

Typiske retninger basert på svar:
- SaaS + B2B + Profesjonell + Nøytral + Begge → Minimalism med slate-palette
- Landing page + Kreative + Bold + Varm → Bento grid med vibrant palette
- Blog + Consumer + Minimalistisk + Nøytral + Light → Flat design med serif-heading
- Enterprise + B2B + Teknisk + Kald → Flat data-dense med blå-grå palette

Bruk skillen intelligent — ikke bare list opp, koble anbefalingene til svarene.

## Del 4 — Lås valget

Når bruker har valgt én kombinasjon:

### A. Oppdater `src/app/globals.css`

Erstatt `:root` og `.dark` med de valgte CSS-variablene:

```css
:root {
  --background: <hsl>;
  --foreground: <hsl>;
  --primary: <hsl>;
  --primary-foreground: <hsl>;
  /* ... alle shadcn-variabler ... */
}

.dark {
  /* ... hvis dark mode ... */
}
```

### B. Legg til fonts

Hvis valget inkluderer custom fonts (ikke shadcn-default), bruk `next/font`:

```tsx
// src/app/layout.tsx
import { Inter, Lora } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" className={`${inter.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Og i `tailwind.config.ts`:
```ts
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-sans)"],
      serif: ["var(--font-serif)"],
    },
  },
}
```

### C. Lock i `CLAUDE.md`

Legg til en seksjon **"Design system (låst)"** i CLAUDE.md:

```markdown
## Design system (låst)

- **Stil**: <valgt stil>
- **Palette**: <beskrivelse + primær hex>
- **Heading-font**: <font-navn>
- **Body-font**: <font-navn>
- **Dark mode**: <ja/nei/begge>

**Regel**: nye komponenter skal følge denne stilen. Ikke introduser brutalism, claymorphism, neumorphism eller andre stiler med mindre brukeren eksplisitt ber om det. Fargepalette hentes fra CSS-variablene i `src/app/globals.css` — aldri hardkode hex/rgb i komponenter.
```

### D. Opprett `DESIGN-SYSTEM.md` (valgfritt men anbefalt)

En egen fil i roten som dokumenterer valget mer detaljert for mennesker (ikke bare Claude):

```markdown
# Design System

## Valg tatt ved bootstrap

- Prosjekttype: <svar>
- Målgruppe: <svar>
- Vibe: <svar>
- Primærfarge: <svar>
- Dark mode: <svar>

## Resulterende stil

<stil-beskrivelse med referanse til ui-ux-pro-max>

## Palette
| Token | Light | Dark |
|-------|-------|------|
| background | <hsl> | <hsl> |
| foreground | <hsl> | <hsl> |
...

## Typografi
- Heading: <font>
- Body: <font>
```

## Forventet resultat

- `.claude/skills/ui-ux-pro-max/` finnes og er aktivert.
- `src/app/globals.css` har oppdaterte CSS-variabler.
- `CLAUDE.md` har "Design system (låst)"-seksjon.
- (Valgfritt) `DESIGN-SYSTEM.md` opprettet.

## Feilsøking

- **`npx uipro-cli init` feiler med "command not found"**: pakken kan ha byttet navn — sjekk docs og GitHub.
- **Skill-mappen mangler SKILL.md**: re-kjør `uipro update` eller reinstaller.
- **Claude ignorerer stil-valget senere**: sjekk at CLAUDE.md faktisk har "Design system"-seksjonen og at skill-frontmatter er korrekt.

## Avkrysning

Kryss av steg 04 i `oppstart/CHECKLIST.md` når ferdig.

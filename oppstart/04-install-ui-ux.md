# Steg 04 — UI/UX design system (ui-ux-pro-max)

## Pre-flight: sjekk docs

Hent `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` og bekreft:
- Gjeldende CLI-kommando (`npx uipro-cli init --ai claude` eller nyere).
- Om pakkenavnet `uipro-cli` fortsatt er riktig.
- Liste over tilgjengelige stiler, palletter, font-pairings.

## Mål

Installer ui-ux-pro-max-skillen og bruk den til å etablere et **låst, prosjekt-spesifikt designsystem** som resten av utviklingen følger. Skillen gir intelligente anbefalinger basert på prosjekttype og målgruppe.

Resultat: én valgt kombinasjon av (stil + palette + fonts) som skrives inn i `src/app/globals.css` + `CLAUDE.md`. Ingen ad-hoc design-valg senere.

## Sjekkliste

- [ ] Pre-flight docs-sjekk kjørt
- [ ] `npx uipro-cli init --ai claude` kjørt; `.claude/skills/ui-ux-pro-max/` finnes
- [ ] Discovery-spørsmål stilt via `AskUserQuestion`: prosjekttype, målgruppe, vibe, farger
- [ ] Discovery-spørsmål stilt: dark mode-strategi
- [ ] 2–3 anbefalte kombinasjoner presentert; bruker har valgt én
- [ ] `design-system/MASTER.md` opprettet — enten via `search.py --design-system --persist` (uten `-p`-flagget), eller manuelt (fallback) hvis search.py ikke gir brukbart output
- [ ] Verifisert at MASTER.md ligger direkte under `design-system/`, ikke under `design-system/<prosjektnavn>/`
- [ ] `src/app/globals.css` oppdatert med OKLCH-variabler fra valgt palette (shadcn-standard-paletter hentes fra `ui.shadcn.com/themes`)
- [ ] `src/app/[locale]/layout.tsx` oppdatert: valgt font via `next/font/google`, `metadata.title` + `description` fra prosjekt, `html lang={locale}`
- [ ] `CLAUDE.md` "Design system (låst)"-seksjon fylt inn med konkrete verdier (stil, palette, fonts, dark mode)
- [ ] `design-system/`-mappen stage-klar for commit

Kryss av hver `[ ]` → `[x]` fortløpende. Når alle er `[x]`, marker steg 04 i `oppstart/CHECKLIST.md` og gå til steg 05 (i18n).

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

**Viktig**: Bruk `AskUserQuestion`-verktøyet. Ikke spør i fritekst. Siden AskUserQuestion tillater maks 4 spørsmål per kall og maks 4 valg per spørsmål, del opp slik:

### Kall 1 — AskUserQuestion (4 spørsmål)

| Spørsmål | Header | Valg (maks 4) |
|----------|--------|---------------|
| Hva er det primære formålet? | Prosjekttype | SaaS/dashboard, Landing/marketing, E-handel, Community/innhold |
| Hvem bruker appen? | Målgruppe | B2B/enterprise, B2C/consumer, Utviklere/tech, Kreative/designere |
| Hvilken følelse skal appen gi? | Vibe | Profesjonell, Minimalistisk, Bold/leken, Luksuriøs/teknisk |
| Primærfarge-retning? | Farger | Nøytral (gråskala), Varm (rød/oransje), Kald (blå/grønn), Spesifikk brand-farge |

### Kall 2 — AskUserQuestion (1 spørsmål)

| Spørsmål | Header | Valg (maks 4) |
|----------|--------|---------------|
| Dark mode-strategi? | Dark mode | Bare light, Bare dark, Begge (default light), Begge (default dark) |

### Ved "Intern verktøy", "Blandet", "Annet", etc.

Brukeren kan alltid velge "Other" og skrive fritekst — AskUserQuestion håndterer dette automatisk. Bruk fritekst-svaret direkte i `search.py`-spørringen i Del 4.

### Hvis bruker velger "Spesifikk brand-farge"

Gjør et oppfølgings-AskUserQuestion-kall der bruker oppgir hex-koden som fritekst via "Other"-opsjon.

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

## Del 4 — Lås valget (Master + Overrides-mønster)

ui-ux-pro-max har en innebygd mekanisme for å **persistere designsystemet til filer** som Claude leser før hver UI-generering. Dette er det som gjør låsingen ekte — ikke bare en kommentar.

### A. Generer og persistér `design-system/MASTER.md`

Når bruker har valgt én kombinasjon fra anbefalingene, bygg en spørringstreng fra svarene (f.eks. `"SaaS dashboard minimalism slate-palette"`) og kjør:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query basert på svarene>" \
  --design-system \
  --persist
```

**Viktig**: ikke bruk `-p "<prosjektnavn>"` — det plasserer MASTER.md i `design-system/<prosjektnavn>/` i stedet for rett under `design-system/`, som bryter vår konvensjon. Hvis `-p` ble brukt ved feil: `mv design-system/<prosjektnavn>/MASTER.md design-system/MASTER.md && rmdir design-system/<prosjektnavn>`.

Dette oppretter `design-system/MASTER.md` — **global source of truth** for farger, typografi, spacing, komponenter, tilstander.

Eksempel-spørringer basert på discovery-svar:
- `"SaaS dashboard minimalism slate"` → SaaS, B2B, profesjonell, nøytral
- `"ecommerce landing bold warm"` → E-handel, B2C, bold, varm
- `"portfolio minimalism serif"` → Portfolio, kreativ, minimalistisk

### A.1 Fallback: hvis `search.py` ikke gir brukbart output

I praksis kan `search.py` returnere "ingen match" eller ustrukturert output. I så fall: **skriv `design-system/MASTER.md` manuelt** basert på brukerens valgte kombinasjon + shadcn-standard som baseline.

For **shadcn-standard-paletter** (slate, zinc, stone, gray, neutral, red, rose, orange, blue, green, yellow, violet): hent eksakte OKLCH-verdier fra `https://ui.shadcn.com/themes` eller fra en fersk `npx shadcn@latest init` på en annen palette og kopier `:root` / `.dark`-blokkene derfra.

Minimal `MASTER.md`-struktur:
```markdown
# Design System — {{PROJECT_NAME}} (MASTER)

**Stil:** <valgt stil, f.eks. "Minimalism (shadcn-default-baseline)">
**Palette:** <valgt, f.eks. "Slate (OKLCH)">
**Fonts:** <f.eks. "Inter (body + heading), Geist Mono (code)">
**Dark mode:** <ja/nei/begge>

## Fargevariabler
Se `src/app/globals.css` — `:root` og `.dark`. Aldri hardkod farger i komponenter.

## Typografi-skala
- H1: text-4xl font-semibold
- H2: text-3xl font-semibold
- H3: text-2xl font-medium
- Body: text-base
- Small: text-sm

## Spacing
Tailwind-default-skala (0, 1, 2, 4, 6, 8, 12, 16, 24).

## Komponenter
Baseline: shadcn/ui. Ikke dupliser eksisterende komponenter.

## Tilstander
- Hover: `hover:bg-accent`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring`
- Disabled: `disabled:opacity-50`
```

Rapportér tydelig: "search.py ga ikke brukbart output — MASTER.md skrevet manuelt basert på bruker-valg".

### B. Oppdater `src/app/globals.css`

`MASTER.md` peker til `globals.css` som source of truth for CSS-variabler. Oppdater `:root` og `.dark` i `src/app/globals.css` med OKLCH-verdier fra valgt palette. For shadcn-standard-paletter: kopier fra `https://ui.shadcn.com/themes` eller fra en fersk `shadcn@latest init` i en sandbox.

### B.1 Oppdater `src/app/[locale]/layout.tsx` med valgt font

create-next-app leverer `Geist`-fonten som default. Hvis brukeren valgte en annen font (Inter er vanlig for minimalism):

```tsx
// src/app/[locale]/layout.tsx
import { Inter, Geist_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// I <html>-taggen:
<html lang={locale} className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
```

Og oppdater `metadata` med ekte prosjektnavn (ikke `"Create Next App"`).

### C. Oppdater `CLAUDE.md` → "Design system (låst)"-seksjon

Erstatt placeholder-verdiene med ekte verdier fra `MASTER.md`:

```markdown
## Design system (låst)

**Source of truth**: `design-system/MASTER.md` — les alltid denne før UI-generering.

- **Stil**: <valgt stil>
- **Palette-primær**: <hex/hsl>
- **Heading-font**: <font>
- **Body-font**: <font>
- **Dark mode**: <ja/nei/begge>

**Retrieval-regel**: når du skal generere UI for en side:
1. Les `design-system/MASTER.md`.
2. Sjekk om `design-system/pages/<page-slug>.md` finnes.
3. Hvis ja: side-spesifikke regler overstyrer MASTER.
4. Hvis nei: bruk MASTER eksklusivt.

**Stil-regel**: ikke introduser brutalism, claymorphism, neumorphism eller andre stiler utenfor MASTER med mindre brukeren eksplisitt ber om det. Fargepalette hentes fra CSS-variablene i `src/app/globals.css` — aldri hardkode hex/rgb i komponenter.
```

### D. (Valgfritt) Opprett side-spesifikke overrides

For sider som trenger å avvike fra MASTER (f.eks. en "Checkout" som krever mer kompakt layout, eller en "Landing" med større typografi):

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "checkout minimalism compact" \
  --design-system \
  --persist \
  -p "{{PROJECT_NAME}}" \
  --page "checkout"
```

Dette oppretter `design-system/pages/checkout.md` — inneholder **kun avvik** fra MASTER. Per regelen i `CLAUDE.md` "Skill-precedence ved UI-arbeid" leser Claude alltid MASTER først og merger inn side-overrides etterpå før kode genereres.

Dette steget kan hoppes over ved bootstrap — sider legges til etter behov senere.

### E. Commit design-system/-mappen

`design-system/` skal **committes** (versjonert). Dette er ikke en bruker-preferanse — det er prosjektets bindende designkontrakt.

```bash
git add design-system/
```

## Forventet resultat

- `.claude/skills/ui-ux-pro-max/` finnes og er aktivert.
- `design-system/MASTER.md` eksisterer med konkrete verdier (ikke placeholders).
- `design-system/pages/` eksisterer som tom mappe (eller med én fil hvis del D ble gjort).
- `src/app/globals.css` har CSS-variabler som matcher MASTER.
- `CLAUDE.md` "Design system (låst)"-seksjon peker til MASTER + retrieval-regel.
- `CLAUDE.md` "Skill-precedence ved UI-arbeid"-regelen er på plass — Claude leser MASTER og kaller `ui-ux-pro-max` ved alle UI-endringer. `/4.0-ui <beskrivelse>` brukes som eksplisitt trigger for større jobber.

## Feilsøking

- **`npx uipro-cli init` feiler med "command not found"**: pakken kan ha byttet navn — sjekk docs og GitHub.
- **Skill-mappen mangler SKILL.md**: re-kjør `uipro update` eller reinstaller.
- **Claude ignorerer stil-valget senere**: sjekk at CLAUDE.md faktisk har "Design system"-seksjonen og at skill-frontmatter er korrekt.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle interne bokser er `[x]`, kryss av steg 04 i `oppstart/CHECKLIST.md`.

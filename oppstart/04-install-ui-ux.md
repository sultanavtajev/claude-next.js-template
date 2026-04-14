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

## Del 4 — Lås valget (Master + Overrides-mønster)

ui-ux-pro-max har en innebygd mekanisme for å **persistere designsystemet til filer** som Claude leser før hver UI-generering. Dette er det som gjør låsingen ekte — ikke bare en kommentar.

### A. Generer og persistér `design-system/MASTER.md`

Når bruker har valgt én kombinasjon fra anbefalingene, bygg en spørringstreng fra svarene (f.eks. `"SaaS dashboard minimalism slate-palette"`) og kjør:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query basert på svarene>" \
  --design-system \
  --persist \
  -p "{{PROJECT_NAME}}"
```

Dette oppretter `design-system/MASTER.md` — **global source of truth** for farger, typografi, spacing, komponenter, tilstander.

Eksempel-spørringer basert på discovery-svar:
- `"SaaS dashboard minimalism slate"` → SaaS, B2B, profesjonell, nøytral
- `"ecommerce landing bold warm"` → E-handel, B2C, bold, varm
- `"portfolio minimalism serif"` → Portfolio, kreativ, minimalistisk

### B. Oppdater `src/app/globals.css`

`MASTER.md` inneholder konkrete HSL-verdier. Overfør dem til `:root` og `.dark` i `src/app/globals.css`, slik at shadcn-komponenter plukker dem opp automatisk. Custom fonts (hvis valgt) legges til via `next/font` i `src/app/layout.tsx` + `tailwind.config.ts`.

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

Dette oppretter `design-system/pages/checkout.md` — inneholder **kun avvik** fra MASTER. `design-system-retrieval`-skillen i `.claude/skills/` leser alltid MASTER først og merger inn side-overrides etterpå.

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
- `.claude/skills/design-system-retrieval/` finnes (kommer fra templaten — ingen handling nødvendig) — denne skillen aktiveres automatisk når Claude skal lage UI.

## Feilsøking

- **`npx uipro-cli init` feiler med "command not found"**: pakken kan ha byttet navn — sjekk docs og GitHub.
- **Skill-mappen mangler SKILL.md**: re-kjør `uipro update` eller reinstaller.
- **Claude ignorerer stil-valget senere**: sjekk at CLAUDE.md faktisk har "Design system"-seksjonen og at skill-frontmatter er korrekt.

## Avkrysning

Kryss av steg 04 i `oppstart/CHECKLIST.md` når ferdig.

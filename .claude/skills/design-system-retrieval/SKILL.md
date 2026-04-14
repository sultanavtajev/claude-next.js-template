---
name: design-system-retrieval
description: Tving hierarkisk oppslag av designsystem før UI-generering. Les alltid design-system/MASTER.md først, sjekk deretter design-system/pages/<page>.md for side-spesifikke overrides. Bruk hver gang du skal lage nytt UI, ny side, ny komponent, eller endre styling.
---

# Design System Retrieval

Dette prosjektet har et **låst designsystem** som ligger i `design-system/`-mappen. Før du genererer UI-kode, skal du alltid lese derfra — ikke gjett, ikke improviser.

## Når denne skillen skal aktiveres

- Bruker ber om ny side eller ruteknutepunkt.
- Bruker ber om ny komponent (uansett om det er shadcn-basert eller custom).
- Bruker ber om styling-endring (farger, spacing, typografi).
- Bruker ber om landing page, dashboard, form, modal, osv.

Hvis oppgaven ikke involverer UI (f.eks. database-migrasjon, API-endepunkt, Server Action-logikk), **ikke** aktivér denne skillen.

## Retrieval-workflow (MASTER + overrides-mønster)

### 1. Les alltid MASTER først

```
design-system/MASTER.md
```

Denne filen er **global source of truth** for:
- Fargetokens (primary, secondary, accent, muted, destructive, etc.)
- Typografi (font-familier, vekter, størrelser, line-heights)
- Spacing-skala
- Radii og shadows
- Komponent-baseline (hva en knapp/kort/modal "ser ut som" i dette prosjektet)
- Tilstander (hover, focus, active, disabled)

Hvis MASTER ikke finnes: stopp og rapporter til bruker — oppstart-steg 04 må være kjørt.

### 2. Sjekk om side-spesifikk override finnes

Hvis oppgaven gjelder en spesifikk side (f.eks. "Lag checkout-side", "bygg dashboard"):

```
design-system/pages/<page-slug>.md
```

Slug-regler:
- Lowercase, bindestreker (`kebab-case`)
- Bruk ruten uten leading slash: `/checkout` → `checkout`, `/dashboard/settings` → `dashboard-settings`
- Hvis uklart: spør brukeren hva siden skal hete

Hvis fil finnes: les den, **side-regler overstyrer MASTER** der de avviker.
Hvis ikke: bruk kun MASTER.

### 3. Kombiner og generer

Når du nå skriver UI-kode:
- Fargene du bruker skal komme fra CSS-variabler (`bg-primary`, `text-foreground`, osv.) som matcher MASTER — aldri hardkode hex.
- Spacing/radii/shadows følger MASTER-skalaen.
- Typografi følger MASTER med mindre side-override sier noe annet.
- Interaksjonstilstander følger MASTER.

## Eksempel-prompt før kodegenerering

Før du skriver kode, rapporter kort:

```
Designsystem innlest:
- MASTER: design-system/MASTER.md
- Side-override: design-system/pages/dashboard.md (merget inn)
Genererer komponent i henhold til disse reglene.
```

Hvis det ikke finnes side-override:
```
Designsystem innlest:
- MASTER: design-system/MASTER.md
- Ingen side-override for "<page-slug>"
Genererer komponent kun etter MASTER.
```

## Når du vil opprette ny side-override

Hvis brukeren ber om en side som trenger avvik fra MASTER (f.eks. en kampanje-landing som skal være "boldere" enn resten av appen), **spør først** om dette skal låses som en permanent override. Hvis ja:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" \
  --design-system \
  --persist \
  -p "<prosjektnavn>" \
  --page "<page-slug>"
```

Dette oppretter/overskriver `design-system/pages/<page-slug>.md`. Filen beskriver **kun avvikene** fra MASTER — ikke hele systemet på nytt.

## Anti-patterns

- ❌ Improvisere en stil fordi MASTER føles "kjedelig" — escalate til bruker i stedet.
- ❌ Hardkode hex-verdier eller rgb i komponent-kode.
- ❌ Lage parallelle design-beslutninger som konkurrerer med MASTER (f.eks. egen `button-primary-v2.tsx` med annen farge).
- ❌ Generere UI uten å rapportere hvilke design-filer som ble lest.

## Hvis brukeren vil endre MASTER

Endringer i MASTER påvirker **hele appen**. Dette bør ikke gjøres lett. Hvis bruker ber om det:

1. Bekreft at de mener å endre den globale stilen (ikke bare én side).
2. Foreslå å regenerere med `--design-system --persist` fra ui-ux-pro-max i stedet for manuell redigering — det holder MASTER konsistent.
3. Etter endring: flagg at alle eksisterende komponenter kan trenge revalidering mot nytt MASTER.

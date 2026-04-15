---
name: design-system-retrieval
description: Enforcer som garanterer at design-system/MASTER.md leses og ui-ux-pro-max-skillen kalles før all UI-generering — også for små endringer (knappefarge, spacing, en linje med tekst). Gjelder uansett om brukeren ber om "lag side" eller "fiks denne".
---

# Design System Retrieval (enforcer)

Denne skillen gjør **én ting**: tvinger Claude til å gå gjennom designsystemet før UI endres, uansett hvor lite endringen er.

## Forhold til ui-ux-pro-max

`ui-ux-pro-max` er primær-skillen for UI/UX-design — den eier:
- Discovery (67 stiler, 161 palletter, 57 font-pairings)
- Generering av `design-system/MASTER.md` via `search.py --design-system --persist`
- MASTER + page-overrides-mønsteret

Denne skillen (`design-system-retrieval`) **dupliserer ikke** ui-ux-pro-max — den er en *gatekeeper* som garanterer at ui-ux-pro-max + MASTER faktisk konsulteres før UI-endringer. Uten denne kan Claude hoppe rett til kode-skriving ved små oppgaver hvor ui-ux-pro-max ikke ville auto-aktivert.

## Når denne skillen aktiveres

- Bruker ber om **enhver** UI-endring (ny side, ny komponent, fargeendring, spacing, font, layout, animation, hover-state, osv.)
- Bruker ber om "fiks dette UI-et" / "gjør den knappen blå" / "endre overskriften til større"
- Bruker ber om landing page, dashboard, form, modal, sidebar, navigasjon

## Workflow (kort)

Før du genererer UI-kode:

1. **Les `design-system/MASTER.md`** — global source of truth.
2. **Sjekk `design-system/pages/<slug>.md`** hvis oppgaven gjelder en spesifikk side.
3. **Konsulter `ui-ux-pro-max`-skillen** for konkret design-intelligens (HSL-verdier, font-pairings, komponent-eksempler) — men **kun innenfor MASTER-rammene**.
4. **Generér kode** som følger MASTER (+ overrides hvis relevante).

## Rapporter alltid hvilke design-filer som ble lest

Før du skriver kode:

```
Designsystem innlest:
- MASTER: design-system/MASTER.md
- Side-override: design-system/pages/checkout.md (merget inn) — eller "ingen side-override"
- ui-ux-pro-max konsultert for: <hva spesifikt>
Genererer komponent i henhold til disse.
```

Hvis MASTER ikke finnes: stopp og rapportér til bruker — oppstart-steg 04 må være kjørt.

## Konflikt: ui-ux-pro-max vs MASTER

`ui-ux-pro-max` har 67 stiler å foreslå, men MASTER låser én. Når de er uenige:

- **MASTER vinner alltid.** Hvis ui-ux-pro-max foreslår glassmorphism og MASTER sier minimalism: følg minimalism.
- Bruker kan eksplisitt overstyre ("lag en bento-grid landing for kampanjen, avvik fra MASTER er OK") — da følger du brukeren og oppretter eventuelt en side-override (`design-system/pages/<slug>.md`).
- Aldri innfør stiler utenfor MASTER stille — eskaler til bruker først.

## Anti-patterns

- ❌ Generere UI-kode uten å rapportere "Designsystem innlest: ..." først
- ❌ Bruke ui-ux-pro-max-forslag som overstyrer MASTER uten brukerens samtykke
- ❌ Hardkode hex/rgb/oklch-verdier i komponenter (bruk CSS-variabler fra `globals.css`)
- ❌ Lage parallelle komponent-versjoner (`button-v2.tsx` med annen stil)

## Kort: hvis du er usikker, bruk `/4.0-ui <beskrivelse>`

Brukeren kan starte UI-arbeid eksplisitt med slash-kommandoen `/4.0-ui`, som garanterer at både denne skillen og ui-ux-pro-max kalles i riktig rekkefølge. Du som modell trenger ikke vente på den — denne skillen aktiveres uansett ved UI-arbeid.

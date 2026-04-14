---
name: search-first
description: Forsk før du koder — sjekk eksisterende kode og offisielle Next.js/React/Auth.js/Prisma-docs før du implementerer. Bruk når du skal lage noe nytt, endre stack-spesifikk kode, eller er usikker på moderne beste praksis.
---

# Search-First: Research Before Coding

Next.js og tilhørende stack (React, Auth.js v5, Prisma, shadcn) endrer seg ofte. Denne skillen tvinger et "research first"-steg før implementasjon.

## Når denne skillen aktiveres

- Brukeren ber om en ny feature som involverer Next.js-API (routing, caching, streaming, Server Actions, proxy/middleware).
- Du skal røre auth-flyt, database-tilgang, eller rendering-grense (Server vs Client).
- Du er usikker på om en pattern er fortsatt gjeldende (f.eks. `getServerSession` vs `auth()`).
- Du skal legge til en ny shadcn-komponent eller oppgradere en dep.

## Workflow

### 0. Bootstrap-kontekst: alltid verifiser mot docs

Hvis du kjører et steg i `oppstart/`, **alltid** hent den tilhørende doks-URLen før du eksekverer. Stegfilene kan være utdatert — offisielle docs er sannheten. Eksempler på ting som har endret seg uten varsel i templaten før:
- `middleware.ts` → `proxy.ts` (Next.js 16)
- `shadcn-ui` → `shadcn` (CLI-pakkenavn)
- `getServerSession` → `auth()` (Auth.js v4 → v5)

Hvis du oppdager at stegfilen er utdatert: følg docs, utfør steget, og rapporter avviket tydelig i avkrysningen slik at brukeren kan oppdatere stegfilen etterpå.

### 1. Sjekk eksisterende kode først

Før du skriver ny kode, søk i prosjektet etter lignende mønstre:

```
Grep etter: relevante funksjonsnavn, imports, strukturer
Glob etter: filer med samme pattern (f.eks. "src/app/**/route.ts")
```

Hvis prosjektet allerede har en måte å gjøre det på — **følg den**. Ikke innfør parallelle mønstre.

### 2. Sjekk offisielle docs ved usikkerhet

**Foretrukket**: bruk `context7` MCP-serveren hvis den er konfigurert — den gir versjon-spesifikke docs og er raskere enn WebFetch.

**Ellers**: WebFetch mot offisiell kilde:

- `nextjs.org/docs` — Next.js App Router, caching, Server Actions, proxy
- `react.dev` — Hooks, Suspense, Server Components
- `authjs.dev` — Auth.js v5 (merk: v4-docs finnes fortsatt, unngå dem)
- `prisma.io/docs` — schema, migrations, client-bruk
- `ui.shadcn.com` — komponent-install og customisering
- `tailwindcss.com/docs` — utility-klasser
- `supabase.com/docs` — database, auth, storage
- `resend.com/docs` — e-postsending

### 3. Rapporter funnene kort før du koder

Én-to setninger: "Fant eksisterende X i `path/file.ts` — følger samme mønster" **eller** "Next.js-docs bekrefter at Y er riktig tilnærming. Implementerer nå."

## Anti-pattern: hoppe rett til koding

Ikke gjør dette:
- Gjette på at gammel React-pattern (f.eks. `useEffect` for data-fetching) er riktig i Server Components.
- Bruke `getServerSession` i Auth.js v5 — det er `auth()` nå.
- Bruke `<img>` i stedet for `next/image` uten eksplisitt grunn.
- Skrive egen Prisma-klient-instans i stedet for å importere fra `@/lib/db`.

## Når du IKKE skal aktivere search-first

- Trivielle ting (rename variabel, fikse typo, oppdatere én CSS-klasse).
- Brukeren har eksplisitt gitt implementasjonsdetaljer ("bruk X").
- Du har nettopp gjort samme type oppgave i samme samtale og researchen er fortsatt gyldig.

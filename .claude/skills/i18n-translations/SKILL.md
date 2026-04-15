---
name: i18n-translations
description: Tving at all brukervendt tekst går gjennom next-intl og at nye keys legges til i alle messages/<locale>.json-filer. Bruk når du lager/endrer UI-tekst, lager en ny side, eller når brukeren ber om "legg til oversettelse for X".
---

# i18n Translations — streng håndheving

Dette prosjektet bruker `next-intl` med flere locales låst i `CLAUDE.md` (se "Internasjonalisering (låst)"-seksjonen). All brukervendt tekst skal gå gjennom `next-intl`-APIer, aldri hardkodes.

## Når denne skillen skal aktiveres

- Du lager/endrer JSX som inneholder tekst som vil vises til brukeren.
- Bruker ber om ny side, ny komponent, ny form, ny error-melding.
- Bruker ber om "oversett X til engelsk/norsk/svensk".
- Du lager en Server Action som returnerer brukermeldinger.

Ikke aktivér for:
- `console.log`, logger til server-kode
- Kommentarer
- URLer, DB-feltnavn, tekniske IDer
- Interne dev-tools eller admin-scripts som ikke eksponeres til bruker

## Workflow

### 1. Identifiser alle brukervendte strenger

Før du skriver kode, gå gjennom hvilken tekst som vil vises. Eksempel: en ny "Create Post"-form har:
- Overskrift: "Create a new post"
- Label: "Title"
- Label: "Body"
- Button: "Create"
- Validation error: "Title is required"
- Success message: "Post created"

### 2. Velg namespace

Namespaces grupperer relaterte keys. Konvensjoner:
- Sideside-navn: `Home`, `Dashboard`, `Checkout`
- Komponent-familie: `Forms.CreatePost`, `Nav`
- Global: `Common` (brukt flere steder), `Errors` (feilmeldinger)

Nye namespaces legges til som top-level JSON-objekter i `messages/<locale>.json`.

### 3. Les alle eksisterende messages-filer

```
messages/no.json
messages/en.json
messages/<flere>.json
```

Sjekk om namespacet/keyen allerede finnes — gjenbruk hvis mulig.

### 4. Legg til keys i ALLE locale-filer

Aldri bare i én. Hvis du legger til en ny key i `no.json`, må den også inn i `en.json` og alle andre locale-filer i prosjektet.

**Eksempel** — ny form trenger 6 keys:

```json
// messages/no.json
{
  "Forms": {
    "CreatePost": {
      "heading": "Ny post",
      "title": "Tittel",
      "body": "Innhold",
      "submit": "Opprett",
      "validation.titleRequired": "Tittel er påkrevd",
      "success": "Post opprettet"
    }
  }
}
```

```json
// messages/en.json
{
  "Forms": {
    "CreatePost": {
      "heading": "New post",
      "title": "Title",
      "body": "Body",
      "submit": "Create",
      "validation.titleRequired": "Title is required",
      "success": "Post created"
    }
  }
}
```

### 5. Bruk `useTranslations` (Client) eller `getTranslations` (Server)

```tsx
// Server Component
import { getTranslations } from "next-intl/server";

export default async function CreatePostPage() {
  const t = await getTranslations("Forms.CreatePost");
  return <h1>{t("heading")}</h1>;
}

// Client Component
"use client";
import { useTranslations } from "next-intl";

export function CreatePostForm() {
  const t = useTranslations("Forms.CreatePost");
  return <button>{t("submit")}</button>;
}
```

### 6. For dynamiske verdier: bruk ICU message-syntax

```json
{
  "welcome": "Hei, {name}!",
  "itemCount": "{count, plural, =0 {Ingen elementer} one {1 element} other {# elementer}}"
}
```

```tsx
t("welcome", { name: user.name });
t("itemCount", { count: items.length });
```

## Kvalitetsregler

- **Aldri konkat strings**: `<span>{t("greeting")}, {name}!</span>` er feil — bruk `t("greeting", { name })` med ICU-placeholder i stedet.
- **Aldri hardkode fallback**: `{t("title") || "Home"}` gjemmer manglende oversettelser. Fix heller messages-filene.
- **Konsistens**: "Cancel"/"Avbryt" skal være samme namespace/key hver gang (`Common.cancel`).

## Server Actions og error-meldinger

Server Actions må ha locale-kontekst for å returnere oversatte feil. To mønstre:

**A) Server Action returnerer en key, klient oversetter:**
```tsx
// Server Action
return { ok: false, errorKey: "Forms.CreatePost.validation.titleRequired" };

// Client
const t = useTranslations();
if (!state?.ok) toast(t(state.errorKey));
```

**B) Server Action oversetter via `getTranslations`:**
```tsx
"use server";
import { getTranslations } from "next-intl/server";

export async function createPost(formData: FormData) {
  const t = await getTranslations("Forms.CreatePost");
  if (!data.title) return { ok: false, error: t("validation.titleRequired") };
}
```

Mønster B er enklere når det er få feiltilstander. Mønster A skalerer bedre.

## Rapportering

Når du har lagt til/endret oversettelser, si kort til bruker:

> "Lagt til 6 nye keys under `Forms.CreatePost`. Oversatt til no + en. Sjekk om andre locales (sv, da) også trenger dem."

## Anti-patterns

- ❌ Hardkodet brukertekst i JSX: `<h1>Velkommen</h1>`
- ❌ Key bare i én locale-fil — resulterer i "missing translation"-runtime-feil
- ❌ Parallelle namespaces for samme konsept (`Common.cancel` + `Buttons.cancel`)
- ❌ Fallback i koden: `t("key") ?? "default"` — fix messages-filen i stedet
- ❌ Tekst i konstanter i TS-filer som bypasser i18n: `const ERRORS = { TITLE_REQUIRED: "Tittel er påkrevd" }` — legg dem i messages-filer

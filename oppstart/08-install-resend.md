# Steg 08 — Resend (valgfri)

## Pre-flight: sjekk docs

Hent `https://resend.com/docs/send-with-nextjs` og `https://resend.com/docs/mcp-server` og bekreft:
- Gjeldende pakkenavn for Resend-klienten (`resend` på npm).
- Offisielt MCP-pakkenavn (`resend-mcp`).
- At Resend fortsatt bruker personal API keys (ikke OAuth).
- Hvilke domain-verifiseringssteg som kreves før produksjon.

## Mål

Valgfritt steg for prosjekter som trenger transaksjonell e-post (velkomstmail, passord-reset, varsler, kvitteringer). Ett samlet steg for:
1. Avklar om Resend skal brukes i prosjektet
2. Opprett Resend-konto og hent API-nøkkel
3. Verifiser avsenderdomene (påkrevd for produksjon)
4. Installér `resend`-klienten og lag en test-sending
5. Autoriser Resend MCP i Claude Code

## Sjekkliste

- [ ] Pre-flight docs-sjekk kjørt
- [ ] `AskUserQuestion` stilt: bruk-Resend / hopp-over
- [ ] (Hvis bruk) Resend-konto klart og API-nøkkel samlet via `AskUserQuestion`
- [ ] (Hvis bruk) `RESEND_API_KEY` skrevet til `.env.local`
- [ ] (Hvis bruk) `AskUserQuestion` stilt om domain-verifisering (verifisert / bruker onboarding / senere)
- [ ] (Hvis bruk) `resend` installert via `pnpm add`
- [ ] (Hvis bruk) `src/lib/email.ts` opprettet (Resend-klient wrapper)
- [ ] (Hvis bruk) Resend MCP autorisert via `/mcp` → resend i Claude Code

Kryss av hver `[ ]` → `[x]` fortløpende. Hvis bruker valgte "hopp-over", marker bare første boks og gå til steg 09. Når alle relevante bokser er `[x]`, marker steg 08 i `oppstart/CHECKLIST.md` og gå til steg 09.

## 1. Avklar om Resend skal brukes

Bruk `AskUserQuestion`:

| Spørsmål | Header | Valg |
|----------|--------|------|
| Skal prosjektet sende e-post (velkomstmail, reset, varsler)? | E-post | Ja, bruk Resend · Nei, hopp over · Bruker Supabase Auth-mails foreløpig |

**Merk**: Supabase Auth sender allerede sine egne transaksjonelle mails (bekreftelses-lenker, reset-passord) uten Resend. Resend trengs kun hvis prosjektet skal sende egen-definerte mails (kvitteringer, varsler, digests osv.).

## 2. Hvis "hopp over" eller "bruker Supabase Auth-mails"

Behold `RESEND_API_KEY` som valgfri env-variabel (`.env.example` har den allerede), men skriv ingen kode. Fjern `resend`-oppføringen fra `.mcp.json` siden serveren vil feile uten API-nøkkel:

```bash
# Åpne .mcp.json og slett "resend"-blokken (linjene 20-26)
```

Hopp til "Forventet resultat".

## 3. Hvis "Ja" — opprett konto og hent API-nøkkel

Guide brukeren:

1. Si: "Gå til https://resend.com/signup og opprett konto (eller logg inn). Gratis-planen gir 100 mails/dag og 3000/måned — nok for utvikling."
2. Si: "Gå til https://resend.com/api-keys → `Create API Key`. Gi den et beskrivende navn (f.eks. `<prosjektnavn>-dev`) og kopier nøkkelen — den vises kun én gang."
3. Vent til brukeren bekrefter.

Samle inn nøkkelen via `AskUserQuestion` (Other-opsjonen):

| Spørsmål | Header |
|----------|--------|
| Oppgi `RESEND_API_KEY` (starter med `re_...`) | API-nøkkel |

## 4. Skriv til `.env.local`

Legg til i `.env.local` (opprett hvis ikke finnes — `.gitignore` dekker den):

```
RESEND_API_KEY=<verdi fra forrige spørsmål>
```

## 5. Domain-verifisering

Resend krever **verifisert domene** for å sende til adresser utenfor konto-eierens egen e-post. For utvikling er `onboarding@resend.dev` tilgjengelig som avsender (kun til brukerens registrerte adresse).

Bruk `AskUserQuestion`:

| Spørsmål | Header | Valg |
|----------|--------|------|
| Har du et eget domene du vil verifisere nå? | Domene | Ja, skal verifisere nå · Nei, bruk `onboarding@resend.dev` for utvikling · Senere (venter på DNS-tilgang) |

### Hvis "Ja, skal verifisere nå"

Guide brukeren:

1. Si: "Gå til https://resend.com/domains → `Add Domain`. Oppgi rot-domenet ditt (f.eks. `dittdomene.no`)."
2. Si: "Resend gir deg DNS-records (typisk 1 MX + 2-3 TXT for SPF, DKIM, DMARC). Legg dem inn hos din DNS-leverandør. Klikk `Verify` når propagering er ferdig (vanligvis minutter, noen ganger opptil 48 timer)."
3. Vent til brukeren bekrefter at domene er verifisert.

### Hvis "onboarding@resend.dev"

OK — templaten bruker denne som default. Bruker kan senere bytte til eget domene ved å verifisere i Resend-dashboardet og oppdatere `from`-feltet i `src/lib/email.ts`.

### Hvis "Senere"

Samme som over — templaten er konfigurert til å bruke `onboarding@resend.dev` inntil bruker endrer.

## 6. Installer Resend-klient

```bash
pnpm add resend
```

## 7. Lag `src/lib/email.ts`

Tynn wrapper rundt Resend-klienten. Sentraliserer sender-adresse og feilhåndtering:

```typescript
import { Resend } from "resend";
import { z } from "zod";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

const FROM = "onboarding@resend.dev"; // bytt til "noreply@dittdomene.no" etter domain-verify

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
}).refine((data) => data.html || data.text, {
  message: "Email må ha enten html eller text",
});

export async function sendEmail(input: z.infer<typeof emailSchema>) {
  const parsed = emailSchema.parse(input);

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: parsed.to,
    subject: parsed.subject,
    html: parsed.html,
    text: parsed.text,
  });

  if (error) {
    throw new Error(`Resend-feil: ${error.message}`);
  }

  return data;
}
```

**Bruk i Server Action / Route Handler**:

```typescript
"use server";
import { sendEmail } from "@/lib/email";

export async function sendWelcomeEmail(formData: FormData) {
  await sendEmail({
    to: formData.get("email") as string,
    subject: "Velkommen!",
    html: "<p>Takk for at du registrerte deg.</p>",
  });
}
```

**Viktig**: `resend`-klienten skal kun brukes i server-kode (Server Actions, Route Handlers, Edge Functions). API-nøkkelen er server-only.

## 8. Autoriser Resend MCP

Templaten har Resend MCP-serveren i `.mcp.json` (npx-basert, stdio). For at Claude Code skal få tilgang må MCP-serveren plukke opp `RESEND_API_KEY`:

1. Sjekk at `RESEND_API_KEY` finnes i `.env.local` (fra steg 4).
2. Informér brukeren: "Restart Claude Code etter bootstrap (steg 14) for at Resend MCP skal laste API-nøkkelen fra env."
3. Etter restart: kjør `/mcp` i Claude Code og verifiser at `resend` står som connected.

Resend MCP gir Claude tilgang til: sende mails, liste/hente mottatte mails, kontakter, broadcasts, domener, segmenter, og API-nøkler.

## Forventet resultat

Hvis Resend valgt:
- `RESEND_API_KEY` i `.env.local` (ignorert av git).
- `resend` i dependencies.
- `src/lib/email.ts` eksporterer `sendEmail(...)`.
- Domene verifisert eller `onboarding@resend.dev` brukt som placeholder.
- Resend MCP tilgjengelig etter Claude-restart.

Hvis hoppet over:
- `resend`-oppføringen fjernet fra `.mcp.json`.
- `RESEND_API_KEY` forblir valgfri env-variabel i `.env.example` (dokumentasjon for framtidig bruk).

## Sikkerhet

- **`RESEND_API_KEY`** er server-only. Aldri eksponer i Client Components eller browser-kode.
- **Rotér nøkkelen** hvis den lekker: Resend dashboard → API Keys → slett og opprett ny.
- **Rate limits**: gratis-plan 100/dag, 3000/måned. Paid fra $20/mnd for 50k/måned.

## Feilsøking

- **`Domain not verified`**: kan kun sende til konto-eierens egen e-post inntil DNS-verifisering er ferdig.
- **`Invalid API key`**: sjekk at nøkkelen i `.env.local` starter med `re_` og ikke har whitespace.
- **MCP-server connecter ikke**: bekreft at `.env.local` har `RESEND_API_KEY` og at Claude Code er restartet etter at nøkkelen ble lagt til. MCP leser env ved oppstart.
- **Rate limit exceeded**: gratis-plan 100/dag — oppgrader eller vent 24 timer.

## Avkrysning

Se `## Sjekkliste` øverst i denne filen. Når alle relevante bokser er `[x]`, kryss av steg 08 i `oppstart/CHECKLIST.md`.

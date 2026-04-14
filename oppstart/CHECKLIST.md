# Bootstrap-sjekkliste

Claude: Les hver fil under i rekkefølge, utfør stegene, og kryss av her når ferdig.
Stopp og spør brukeren hvis et steg feiler eller er uklart.

Oppdater denne filen ved å endre `[ ]` til `[x]` for hvert steg som fullføres.

## Før du starter: verifiser mot siste docs

**Stack beveger seg raskt.** Før du eksekverer et install-steg, hent alltid den relevante offisielle doksiden via WebFetch og bekreft at kommandoene/mønstrene i stegfilen fortsatt er gyldige. Hvis de ikke er det — følg docs, og rapporter avviket til brukeren slik at stegfilen kan oppdateres senere.

Canonical doc-URLer for denne stacken:

| Stack | URL | Relevant for steg |
|-------|-----|-------------------|
| Next.js | `https://nextjs.org/docs` | 02, 07 (build) |
| React | `https://react.dev/reference/react` | (generelt) |
| shadcn/ui | `https://ui.shadcn.com/docs/installation/next` | 03 |
| Prisma | `https://www.prisma.io/docs/getting-started/quickstart-prismaPostgres` | 04 |
| Auth.js v5 | `https://authjs.dev/getting-started/installation` | 05 |
| Supabase | `https://supabase.com/docs/guides/getting-started/quickstarts/nextjs` | 04, 06 |
| Resend | `https://resend.com/docs/send-with-nextjs` | 06 |
| Vercel | `https://vercel.com/docs/frameworks/nextjs` | (deploy) |
| T3 Env | `https://env.t3.gg/docs/nextjs` | 06 |

**Verifiseringsregel for hvert install-steg:**
1. Les stegfilen (hva den sier å gjøre).
2. WebFetch den tilhørende docs-URLen og se etter dagens anbefalte kommandoer/oppsett.
3. Hvis docs matcher stegfilen — kjør stegfilen som den er.
4. Hvis docs avviker — følg docs, men lag en kort kommentar i avkrysningen ("fulgte docs — stegfil er utdatert: …") så brukeren kan rette stegfilen etterpå.

## Steg

- [ ] [01 — Configure Claude](./01-configure-claude.md) — fyll inn prosjektnavn, GitHub-repo, Vercel-prosjekt i `CLAUDE.md` + `.claude/mcp-servers.json`
- [ ] [02 — create-next-app](./02-create-next-app.md) — generer Next.js-boilerplate
- [ ] [03 — shadcn/ui](./03-install-shadcn.md) — init shadcn og legg til basiskomponenter
- [ ] [04 — Prisma](./04-install-prisma.md) — installer og initialiser Prisma
- [ ] [05 — Auth.js](./05-install-authjs.md) — sett opp Auth.js v5 med én provider
- [ ] [06 — Environment](./06-configure-env.md) — lag `.env.example` med alle nødvendige nøkler dokumentert
- [ ] [07 — Verify](./07-verify.md) — kjør dev, build, lint, typecheck — alt grønt
- [ ] [08 — Cleanup](./08-cleanup.md) — slett `oppstart/`, gjør første commit

## Regler for Claude

- Kjør stegene i rekkefølge. Ikke hopp over.
- Etter hvert fullført steg: oppdater sjekklisten her (`[ ]` → `[x]`) og gå til neste.
- Hvis et steg feiler: stopp, rapporter feilen, og spør brukeren hvordan du skal fortsette.
- Hvis et steg krever input fra brukeren (f.eks. prosjektnavn i steg 01), spør før du fortsetter.
- Etter steg 08 er alt ferdig — ikke gjør noe ekstra.

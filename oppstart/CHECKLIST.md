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
| GitHub CLI | `https://cli.github.com/manual/` | 08 |
| Vercel CLI | `https://vercel.com/docs/cli` | 08 |
| React | `https://react.dev/reference/react` | (generelt) |
| shadcn/ui | `https://ui.shadcn.com/docs/installation/next` | 03 |
| ui-ux-pro-max | `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` | 04 |
| Supabase (Next.js) | `https://supabase.com/docs/guides/getting-started/quickstarts/nextjs` | 05, 06 |
| Supabase Auth SSR | `https://supabase.com/docs/guides/auth/server-side/nextjs` | 05 |
| Supabase CLI | `https://supabase.com/docs/guides/cli` | 05 (migrations) |
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
- [ ] [04 — UI/UX design system](./04-install-ui-ux.md) — installer ui-ux-pro-max og lås stil/palette/fonts
- [ ] [05 — Supabase](./05-install-supabase.md) — prosjekt-gjennomgang, klienter, auth-sider, RLS, (valgfritt) CLI + migrations
- [ ] [06 — Environment](./06-configure-env.md) — lag `.env.example` med alle nødvendige nøkler dokumentert
- [ ] [07 — Verify](./07-verify.md) — kjør dev, build, lint, typecheck — alt grønt
- [ ] [08 — Remote-oppsett](./08-git-setup.md) — reset git-historikk, GitHub-repo-gjennomgang (`gh auth`, opprett repo, push), Vercel-link (valgfritt)
- [ ] [09 — Cleanup](./09-cleanup.md) — slett `oppstart/`, final commit, push, informér om IDE/Claude-restart

## Regler for Claude

- Kjør stegene i rekkefølge. Ikke hopp over.
- **Hver stegfil har en egen `## Sjekkliste`-seksjon** med konkrete underaksjoner. Workflow per steg:
  1. Åpne stegfilen.
  2. Les `## Sjekkliste` øverst.
  3. Utfør hver handling i rekkefølge.
  4. **Kryss av hver `[ ]` → `[x]` fortløpende i stegfilen** mens du jobber — ikke på slutten.
  5. Når alle interne bokser er `[x]`, marker steget her i master-`CHECKLIST.md` som `[x]` og gå til neste steg.
- Hvis et steg feiler midtveis: den interne sjekklisten viser hvilke underaksjoner som er fullført og hvilke som gjenstår. Rapporter status til brukeren og bruk `AskUserQuestion` for å avklare veien videre — ikke start steget fra scratch.
- **Alle spørsmål til brukeren skal stilles via `AskUserQuestion`-verktøyet** — ikke fritekst-spørsmål. Gruppér relaterte spørsmål i samme kall (maks 4 spørsmål per kall, 2–4 svaralternativer per spørsmål).
- Stegfilene kan be deg stille enkeltvise spørsmål (f.eks. design-discovery i steg 04). Samle dem i ett eller flere `AskUserQuestion`-kall der det gir mening.
- Noen steg har deler markert som **valgfri** (f.eks. Del 4 i steg 05, Del 3 i steg 08). Valgfrie deler krever ikke avkrysning for at steget regnes som ferdig — men dokumentér i rapport hvis du hopper over dem.
- Etter steg 09 er alt ferdig — ikke gjør noe ekstra.

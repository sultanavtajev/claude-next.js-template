# Bootstrap-sjekkliste

Claude: Les hver fil under i rekkefølge, utfør stegene, og kryss av her når ferdig.
Stopp og spør brukeren hvis et steg feiler eller er uklart.

Oppdater denne filen ved å endre `[ ]` til `[x]` for hvert steg som fullføres.

## Før du starter: verifiser mot siste docs

**Stack beveger seg raskt.** Før du eksekverer et install-steg, hent alltid den relevante offisielle doksiden via WebFetch og bekreft at kommandoene/mønstrene i stegfilen fortsatt er gyldige. Hvis de ikke er det — følg docs, og rapporter avviket til brukeren slik at stegfilen kan oppdateres senere.

Canonical doc-URLer for denne stacken:

| Stack | URL | Relevant for steg |
|-------|-----|-------------------|
| Next.js | `https://nextjs.org/docs` | 02, 08 (build) |
| React | `https://react.dev/reference/react` | (generelt) |
| shadcn/ui | `https://ui.shadcn.com/docs/installation/next` | 03 |
| ui-ux-pro-max | `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` | 04 |
| Supabase (Next.js) | `https://supabase.com/docs/guides/getting-started/quickstarts/nextjs` | 05, 07 |
| Supabase Auth SSR | `https://supabase.com/docs/guides/auth/server-side/nextjs` | 06 |
| Supabase CLI | `https://supabase.com/docs/guides/cli` | 05 (migrations) |
| Resend | `https://resend.com/docs/send-with-nextjs` | 07 |
| Vercel | `https://vercel.com/docs/frameworks/nextjs` | (deploy) |
| T3 Env | `https://env.t3.gg/docs/nextjs` | 07 |

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
- [ ] [05 — Supabase](./05-install-supabase.md) — installer @supabase/ssr-klienter + proxy
- [ ] [06 — Supabase Auth](./06-install-supabase-auth.md) — login/signup-sider + RLS-retningslinjer
- [ ] [07 — Environment](./07-configure-env.md) — lag `.env.example` med alle nødvendige nøkler dokumentert
- [ ] [08 — Verify](./08-verify.md) — kjør dev, build, lint, typecheck — alt grønt
- [ ] [09 — Cleanup](./09-cleanup.md) — slett `oppstart/`, gjør første commit, informér om IDE/Claude-restart

## Regler for Claude

- Kjør stegene i rekkefølge. Ikke hopp over.
- Etter hvert fullført steg: oppdater sjekklisten her (`[ ]` → `[x]`) og gå til neste.
- Hvis et steg feiler: stopp, rapporter feilen, og spør brukeren hvordan du skal fortsette.
- Hvis et steg krever input fra brukeren (f.eks. prosjektnavn i steg 01, design-valg i steg 04), spør før du fortsetter.
- Etter steg 09 er alt ferdig — ikke gjør noe ekstra.

# Bootstrap-sjekkliste

Claude: Les hver fil under i rekkefølge, utfør stegene, og kryss av her når ferdig.
Stopp og spør brukeren hvis et steg feiler eller er uklart.

Oppdater denne filen ved å endre `[ ]` til `[x]` for hvert steg som fullføres.

## Før du starter: verifiser mot siste docs

**Stack beveger seg raskt.** Før du eksekverer et install-steg, hent alltid den relevante offisielle doksiden via WebFetch og bekreft at kommandoene/mønstrene i stegfilen fortsatt er gyldige. Hvis de ikke er det — følg docs, og rapporter avviket til brukeren slik at stegfilen kan oppdateres senere.

Canonical doc-URLer for denne stacken:

| Stack | URL | Relevant for steg |
|-------|-----|-------------------|
| Next.js | `https://nextjs.org/docs` | 02, 09 (build) |
| GitHub CLI | `https://cli.github.com/manual/` | 10 |
| Vercel CLI | `https://vercel.com/docs/cli` | 10 |
| React | `https://react.dev/reference/react` | (generelt) |
| shadcn/ui | `https://ui.shadcn.com/docs/installation/next` | 03 |
| ui-ux-pro-max | `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` | 04 |
| next-intl | `https://next-intl.dev/docs/getting-started/app-router` | 05 |
| Element Picker | `https://www.npmjs.com/package/@sultanavtajev/element-picker` | 06 |
| Supabase (Next.js) | `https://supabase.com/docs/guides/getting-started/quickstarts/nextjs` | 07, 08 |
| Supabase Auth SSR | `https://supabase.com/docs/guides/auth/server-side/nextjs` | 07 |
| Supabase CLI | `https://supabase.com/docs/guides/cli` | 07 (migrations) |
| Resend | `https://resend.com/docs/send-with-nextjs` | 08 |
| Vercel | `https://vercel.com/docs/frameworks/nextjs` | (deploy) |
| T3 Env | `https://env.t3.gg/docs/nextjs` | 08 |

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
- [ ] [05 — i18n](./05-install-i18n.md) — next-intl, locale-routing, messages, restrukturer `app/[locale]/...`
- [ ] [06 — Element Picker](./06-install-element-picker.md) — dev-only inspector (Ctrl+Shift+X) for AI-assistert UI-utvikling
- [ ] [07 — Supabase](./07-install-supabase.md) — prosjekt-gjennomgang, klienter, auth-sider, RLS, (valgfritt) CLI + migrations
- [ ] [08 — Environment](./08-configure-env.md) — lag `.env.example` med alle nødvendige nøkler dokumentert
- [ ] [09 — Verify](./09-verify.md) — kjør dev, build, lint, typecheck — alt grønt
- [ ] [10 — Remote-oppsett](./10-git-setup.md) — reset git-historikk, GitHub-repo-gjennomgang (`gh auth`, opprett repo, push), Vercel-link (valgfritt)
- [ ] [11 — Cleanup](./11-cleanup.md) — slett `oppstart/`, final commit, push, informér om IDE/Claude-restart

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
- Noen steg har deler markert som **valgfri** (f.eks. Del 4 i steg 07, Del 3 i steg 10). Valgfrie deler krever ikke avkrysning for at steget regnes som ferdig — men dokumentér i rapport hvis du hopper over dem.
- **Ikke bruk `sleep`-workarounds** for å vente på at servere/prosesser skal starte. Claude Code-miljøet blokkerer `sleep ≥ 2s`, og `sleep 1 && sleep 1 && sleep 1 && ...`-kjeder er en stygg omvei. Riktig mønster:
  - Start langvarige prosesser (f.eks. `pnpm dev`, `supabase start`) med `run_in_background: true`.
  - Bruk `Monitor`-verktøyet på task-ID-en for å vente på en spesifikk stdout-event (f.eks. "Ready", "Compiled", "Listening").
  - For HTTP-sjekker: kjør `curl` direkte — dev-servere er som regel oppe innen et sekund. Hvis connection-feil, retry en gang etter et kort `Monitor`-kall, ikke sleep-kjede.
- Etter steg 11 er alt ferdig — ikke gjør noe ekstra.

# Bootstrap-sjekkliste

Claude: Les hver fil under i rekkefølge, utfør stegene, og kryss av her når ferdig.
Stopp og spør brukeren hvis et steg feiler eller er uklart.

Oppdater denne filen ved å endre `[ ]` til `[x]` for hvert steg som fullføres.

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

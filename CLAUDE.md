# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Stack

- **Next.js** (seneste) — App Router, TypeScript, Turbopack
- **Tailwind CSS** — styling
- **shadcn/ui** — komponentbibliotek (basert på Radix + Tailwind)
- **Prisma** — ORM mot PostgreSQL
- **Auth.js (NextAuth v5)** — autentisering
- **Zod** — runtime-validering av input
- **ESLint + Prettier** — linting og formatering

## Mappestruktur

```
src/
├── app/                 # App Router — Server Components by default
│   ├── (auth)/          # route group for auth-sider
│   ├── api/             # route handlers
│   └── layout.tsx
├── components/
│   ├── ui/              # shadcn-komponenter
│   └── ...
├── lib/
│   ├── auth.ts          # Auth.js-config
│   ├── db.ts            # Prisma-client
│   └── utils.ts
└── middleware.ts
prisma/
└── schema.prisma
```

## Kommandoer

- `pnpm dev` — dev-server med Turbopack
- `pnpm build` — produksjonsbygg
- `pnpm start` — start produksjonsbygg
- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm db:migrate` — `prisma migrate dev`
- `pnpm db:studio` — Prisma Studio

## Harde regler

1. **Server Components by default.** Bruk `"use client"` kun når nødvendig (interaktivitet, hooks, browser-API).
2. **Zod for all input.** Alle Server Actions og route handlers skal validere input med Zod før videre prosessering.
3. **Ingen `any`.** Bruk `unknown` + narrowing hvis typen er ukjent.
4. **Env-variabler gjennom `src/env.ts`.** Aldri bruk `process.env` direkte utenfor env-fil — valider med Zod.
5. **Prisma-klient som singleton.** Importer fra `src/lib/db.ts`, ikke instansier nye.
6. **Auth.js v5-syntaks.** `auth()` fra `src/lib/auth.ts`, ikke `getServerSession`.
7. **Route handlers returnerer `Response` eller `NextResponse`.** Ingen direkte `res.json(...)`.

## Hvor ting hører hjemme

| Trenger | Plass |
|---------|-------|
| Ny shadcn-komponent | `src/components/ui/` via `npx shadcn@latest add` |
| Nytt API-endepunkt | `src/app/api/<rute>/route.ts` |
| Server Action | Inline i Server Component eller i `src/lib/actions/` |
| Databasemodell | `prisma/schema.prisma` + `pnpm db:migrate` |
| Ny auth-provider | `src/lib/auth.ts` |
| Shared utility | `src/lib/utils.ts` eller egen fil i `src/lib/` |

## Referanser

- GitHub: `{{GITHUB_REPO}}`
- Vercel: `{{VERCEL_PROJECT}}`

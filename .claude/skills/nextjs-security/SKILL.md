---
name: nextjs-security
description: Sikkerhetsmønstre for Next.js — auth-sjekker, input-validering, CSRF, env-håndtering, secrets. Bruk når du lager Server Actions, route handlers, auth-flyt, eller håndterer brukerinput.
---

# Next.js Security

## Auth-sjekker i Server Components og Actions

**Alltid sjekk `auth()` før sensitiv data vises eller mutation utføres.**

```tsx
import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await db.profile.findUnique({
    where: { userId: session.user.id },
  });
  return <Profile data={data} />;
}
```

I Server Actions:

```tsx
async function updateProfile(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  // ... fortsett
}
```

## Input-validering med Zod

**All input fra brukeren valideres med Zod.** Ikke stol på type-signaturer alene — de gir ikke runtime-garantier.

```tsx
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

async function createPost(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = createPostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  await db.post.create({
    data: { ...parsed.data, authorId: session.user.id },
  });
}
```

## CSRF

Server Actions har **innebygd CSRF-beskyttelse** via Next.js. Krever ingen egen handling.

Route handlers (`app/api/*/route.ts`) har **ingen** innebygd CSRF-beskyttelse. For state-mutating endpoints:
- Krever auth-token i header eller session-cookie
- Bekreft `Origin`-header mot forventet domene
- Unngå å akseptere cookies fra tredjeparts opprinnelse

## Env-variabler

**Aldri `process.env` direkte utenfor `src/env.ts`.**

```tsx
// ❌
const url = process.env.DATABASE_URL;

// ✅
import { env } from "@/env";
const url = env.DATABASE_URL;
```

Dette gir:
- Runtime-validering (build feiler hvis variabel mangler)
- TypeScript-typer på env-objektet
- Sentral oversikt over alle env-variabler

### Server-only vs client-side

- **Server-variabler**: uten prefiks (f.eks. `DATABASE_URL`) — aldri sendt til klient.
- **Client-variabler**: må ha `NEXT_PUBLIC_`-prefiks og defineres i `client`-seksjonen av `env.ts`.

## Secrets

- **Aldri commit .env** — bekreft at `.env`, `.env.local`, `.env.production` er i `.gitignore`.
- **`.env.example`** committes med tomme verdier (dokumentasjon).
- **Rotér secrets** hvis de er lekket — ikke bare slett fra git-historikk (de er allerede eksponert).

## SQL-injection

Prisma bruker parameteriserte queries by default. Unngå `$queryRawUnsafe` og `$executeRawUnsafe`.

```ts
// ✅ Safe — parametrisert
const user = await db.user.findUnique({ where: { email } });
const users = await db.$queryRaw`SELECT * FROM User WHERE email = ${email}`;

// ❌ Farlig
const users = await db.$queryRawUnsafe(`SELECT * FROM User WHERE email = '${email}'`);
```

## XSS

React escaper innhold by default. Farlig kun når du bruker `dangerouslySetInnerHTML` — sanitér først med `DOMPurify` eller tilsvarende.

## Proxy til route-beskyttelse (Next.js 16+)

`src/proxy.ts` (tidligere `middleware.ts` — deprecated fra Next.js 16) kjører før hver request. Bruk til å redirecte uautoriserte brukere før sider laster:

```ts
export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

**Viktig**: ikke bruk proxy som eneste autorisering. Valider alltid session også i Server Components og route handlers — server-handlers kan ikke alltid dekkes av matcher, og en refactor kan stille skru av proxy-beskyttelsen uten at du merker det.

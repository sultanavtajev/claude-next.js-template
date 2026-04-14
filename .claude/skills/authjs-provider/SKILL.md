---
name: authjs-provider
description: Legge til eller konfigurere Auth.js (NextAuth v5) providers. Bruk når brukeren ber om ny innloggingsmetode (Google, GitHub, credentials, magic link).
---

# Auth.js v5 — Providers

## Viktig: v5, ikke v4

Auth.js v5 (betegnet som `next-auth@beta`) har andre API enn v4. Unngå gamle patterns.

| v4 (utgående) | v5 (denne) |
|---------------|------------|
| `getServerSession` | `auth()` |
| `NextAuthOptions` | `NextAuthConfig` |
| `[...nextauth].ts`-fil med options | `auth.ts` med `NextAuth({...})` |

## OAuth-providers

### GitHub

```ts
// src/lib/auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [GitHub],
  session: { strategy: "database" },
});
```

Env:
```
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

### Google

```ts
import Google from "next-auth/providers/google";
// ...
providers: [Google],
```

Env:
```
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

### Flere providers samtidig

```ts
providers: [GitHub, Google],
```

Brukeren får en liste å velge fra på `/api/auth/signin`.

## Credentials (e-post + passord)

Krever manuell verifisering og er mer komplekst. Eksempel:

```ts
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

providers: [
  Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (credentials) => {
      const parsed = schema.safeParse(credentials);
      if (!parsed.success) return null;

      const user = await db.user.findUnique({ where: { email: parsed.data.email } });
      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!valid) return null;

      return { id: user.id, email: user.email, name: user.name };
    },
  }),
],
```

`session.strategy` må settes til `"jwt"` for credentials — database-strategi støtter ikke credentials by default.

### Passord-hashing

```bash
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

Hash ved opprettelse:
```ts
const passwordHash = await bcrypt.hash(password, 10);
await db.user.create({ data: { email, passwordHash } });
```

## Magic link (e-post)

```ts
import Resend from "next-auth/providers/resend";

providers: [
  Resend({
    from: "auth@ditt-domene.no",
  }),
],
```

Krever Resend-konto eller tilsvarende e-posttjener. Adapter må støtte `VerificationToken`-modellen (Prisma-adapter gjør).

## Callbacks — vanlige bruk

### Utvide session med custom felter

```ts
callbacks: {
  session({ session, user }) {
    if (session.user && user) {
      session.user.role = user.role; // custom felt
    }
    return session;
  },
},
```

Deklarer custom felter i `auth.d.ts`:

```ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: string } & DefaultSession["user"];
  }
  interface User {
    role: string;
  }
}
```

### Autorisering av sider

```ts
callbacks: {
  authorized({ auth, request: { nextUrl } }) {
    const isLoggedIn = !!auth?.user;
    const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
    if (isOnDashboard) return isLoggedIn;
    return true;
  },
},
```

Brukes sammen med proxy-export (Next.js 16+):
```ts
// src/proxy.ts
export { auth as proxy } from "@/lib/auth";
```

> **Merk**: I Next.js <16 het filen `middleware.ts` og eksporten `middleware`. Hvis brukeren er på eldre versjon, bruk den syntaksen i stedet.

## Bruk i komponenter

### Server Component
```tsx
import { auth } from "@/lib/auth";
const session = await auth();
```

### Client Component
```tsx
"use client";
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

For `useSession`: wrap appen i `<SessionProvider>` i en client-boundary.

### Sign in / out
```tsx
import { signIn, signOut } from "@/lib/auth";

<form action={async () => { "use server"; await signIn("github"); }}>
  <button>Logg inn med GitHub</button>
</form>
```

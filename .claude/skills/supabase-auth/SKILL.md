---
name: supabase-auth
description: Supabase Auth-mønstre — login/signup/logout, session-sjekk, OAuth, middleware/proxy, RLS-integrasjon. Bruk når brukeren ber om innlogging, auth-sider, eller beskyttet innhold.
---

# Supabase Auth

Supabase Auth er integrert med samme Postgres-database som appdata bor i. Sessions håndteres via cookies, som må refreshes på hver request via `src/proxy.ts`.

## Kjerne-regel: getUser vs getSession

**Alltid** bruk `supabase.auth.getUser()` for server-side auth-sjekker. Det validerer JWT-en med Supabase-serveren.

**Aldri** bruk `supabase.auth.getSession()` server-side — den leser bare cookien uten å verifisere at JWT-en faktisk er gyldig og ikke utløpt/revoked.

```typescript
// ✅ Server Component / Action / Route Handler
const { data: { user } } = await supabase.auth.getUser();

// ❌ Farlig — ingen JWT-verifisering
const { data: { session } } = await supabase.auth.getSession();
```

I Client Components er `useSession`/`getSession` OK fordi vi uansett stoler på browser-kontekst for UI-state.

## Sjekke auth i Server Components

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <div>Hei, {user.email}</div>;
}
```

## Sjekke auth i Server Actions

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({ title: z.string().min(1) });

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { error } = await supabase
    .from("posts")
    .insert({ ...parsed.data, author_id: user.id });

  if (error) return { error: error.message };
  return { ok: true };
}
```

**Merk**: RLS håndhever også `author_id = auth.uid()`, så selv om author_id blir manipulert vil insert feile på policy.

## Sjekke auth i Route Handlers

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("posts").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts: data });
}
```

## Providers

### E-post + passord
Default, ingen config. Brukes via `signInWithPassword`/`signUp` som vist i oppstart-steg 05.

### OAuth (GitHub/Google/etc.)

1. Aktiver i Supabase dashboard → Authentication → Providers.
2. Legg til callback-URL i provider (GitHub OAuth app → Authorization callback URL).
3. Kode:

```typescript
"use client";
import { createClient } from "@/lib/supabase/client";

async function loginWithGitHub() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${location.origin}/auth/callback` },
  });
}
```

Callback-route:
```typescript
// src/app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
```

### Magic link (passordløs)

```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: "bruker@eksempel.no",
  options: { emailRedirectTo: `${location.origin}/auth/callback` },
});
```

Krever at SMTP er konfigurert i Supabase dashboard (eller bruk Supabase sin innebygde e-post for dev).

## Proxy — session-refresh

`src/proxy.ts` må kjøre `updateSession` for hver request. Uten dette utløper cookies og brukeren blir logget ut.

Matcher-tips: ekskluder statiske filer og bilder:
```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## RLS + auth samspill

RLS-policies kan referere `auth.uid()` og `auth.jwt()`:

```sql
-- Bare eier kan lese
create policy "Eier leser" on public.posts for select
  using (auth.uid() = author_id);

-- Bare admin (via user metadata) kan slette
create policy "Admin sletter" on public.posts for delete
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
```

Uten auth-context (anonymt kall), returnerer `auth.uid()` `null` — policies som krever match vil feile. Dette er riktig oppførsel.

## Service role — bypass RLS

I noen tilfeller (admin-dashboards, backfills, webhooks) trenger du å omgå RLS. Bruk service role-klient:

```typescript
// src/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

export function createAdminClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

**Aldri** importer denne i Client Components eller send den til browser. Kun i Server Actions / Route Handlers / Edge Functions med godt begrunnet behov.

## Vanlige feil

| Symptom | Årsak | Fiks |
|---------|-------|------|
| `getUser()` returnerer `null` etter login | Proxy ikke kjørt | Sjekk at `src/proxy.ts` matcher ruten |
| "Row violates row-level security policy" | RLS blokkerer — korrekt sikkerhet | Sjekk policy, eller bruk service role hvis intent er admin |
| Session forsvinner mellom requests | Proxy setter ikke cookies | Bekreft at `response.cookies.set` kalles i `setAll`-callback |
| Client-komponent ser ikke innlogget bruker | Client trenger egen sjekk | Bruk `supabase.auth.onAuthStateChange` i useEffect |

## Anti-patterns

- ❌ Bruke `getSession()` server-side for auth-sjekk.
- ❌ Tro at proxy alene beskytter data — valider alltid i Server Component/Action.
- ❌ Service role-nøkkel i klient-kode.
- ❌ Tabeller uten RLS når publishable key er eksponert.

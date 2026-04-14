---
name: nextjs-security
description: Sikkerhetsmønstre for Next.js med Supabase — auth-sjekker, RLS, input-validering, CSRF, env-håndtering. Bruk når du lager Server Actions, route handlers, auth-flyt, eller håndterer brukerinput.
---

# Next.js + Supabase Security

## Auth-sjekker i Server Components og Actions

**Alltid bruk `supabase.auth.getUser()`.** Det validerer JWT med Supabase-serveren. `getSession()` leser bare cookien uten verifisering — aldri server-side.

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return <Profile data={profile} />;
}
```

I Server Actions:

```tsx
"use server";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  // ... fortsett
}
```

## Row Level Security (RLS)

**Alltid aktiver RLS på tabeller med brukerdata.** Publishable key eksponeres i browser — alle kan lage queries mot Supabase. Det eneste som beskytter data er RLS-policies.

```sql
alter table public.posts enable row level security;

create policy "Egen lesing" on public.posts for select
  using (auth.uid() = author_id);

create policy "Egen skriving" on public.posts for insert
  with check (auth.uid() = author_id);
```

### Verifiser at RLS er aktivert

Før du committer en migrasjon:
```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public';
```
Alle brukerdata-tabeller skal ha `rowsecurity = true`.

## Input-validering med Zod

Server Actions + route handlers må validere all input:

```tsx
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

async function createPost(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = createPostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const { error } = await supabase
    .from("posts")
    .insert({ ...parsed.data, author_id: user.id });

  if (error) return { error: error.message };
}
```

RLS vil håndheve `author_id = auth.uid()` uansett, men Zod gir bedre UX ved å fange feil tidlig.

## CSRF

Server Actions har **innebygd CSRF-beskyttelse** via Next.js. Krever ingen egen handling.

Route handlers (`app/api/*/route.ts`) har **ingen** innebygd CSRF-beskyttelse. For state-mutating endpoints:
- Krever auth-cookie (som Supabase bruker) ELLER Authorization-header
- Bekreft `Origin`-header mot forventet domene for eksterne kall
- Webhooks fra tredjeparter: verifiser signatur

## Env-variabler

**Aldri `process.env` direkte utenfor `src/env.ts`.**

```tsx
// ❌
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

// ✅
import { env } from "@/env";
const url = env.NEXT_PUBLIC_SUPABASE_URL;
```

### Server-only vs client-safe nøkler

| Nøkkel | Hvor | Kommentar |
|--------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Klient + server | Offentlig — bare en URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Klient + server | Offentlig — tilgang styres av RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **KUN SERVER** | Full DB-tilgang, bypass RLS. Aldri i client bundle. |

Service role-klient skal kun importeres fra `@/lib/supabase/admin`, og kun i Server Actions/Route Handlers/Edge Functions med klar grunn til å omgå RLS.

## Secrets

- **Aldri commit `.env.local`** — skal være i `.gitignore` (er det i templaten).
- **`.env.example`** committes med tomme verdier (dokumentasjon).
- **Rotér service role-key** umiddelbart hvis den lekker: Supabase dashboard → Project Settings → API → "Reset service_role key".

## SQL-injection

Supabase-klienten bygger parameteriserte queries. Dette er trygt:
```typescript
const { data } = await supabase.from("users").select("*").eq("email", userInput);
```

Unngå `rpc()`-funksjoner som bygger SQL med string-interpolation. Hvis nødvendig: bruk `$1`-parametere og send dem separat.

## XSS

React escaper innhold by default. Farlig kun når du bruker `dangerouslySetInnerHTML` — sanitér først med `DOMPurify` eller tilsvarende.

## Proxy til route-beskyttelse

`src/proxy.ts` refresher Supabase-session og kan redirecte:

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Viktig**: ikke bruk proxy som eneste autorisering. Valider alltid session også i Server Components og route handlers — en matcher-endring eller refactor kan stille fjerne proxy-beskyttelsen uten at du merker det.

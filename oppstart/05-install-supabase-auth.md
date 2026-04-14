# Steg 05 — Supabase Auth

## Pre-flight: sjekk docs

Hent `https://supabase.com/docs/guides/auth/server-side/nextjs` og bekreft:
- Anbefalte auth-metoder i gjeldende versjon.
- Login/signup-helper-funksjonene.
- Hvordan RLS skal settes opp i kombinasjon med auth.

## Mål

Konfigurer Supabase Auth med e-post+passord som default provider. OAuth (GitHub/Google) kan legges til senere via Supabase dashboard.

## Forutsetninger

- Steg 04 ferdig — Supabase-klientene finnes i `src/lib/supabase/`.
- `src/proxy.ts` kjører session-refresh.
- Supabase-prosjektet har Auth aktivert (default).

## Filer

### `src/app/login/page.tsx` — Innloggingsside (Server Component + Server Action)

```tsx
import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <form className="flex flex-col gap-4 max-w-sm mx-auto p-8">
      <label htmlFor="email">E-post</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Passord</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Logg inn</button>
      <button formAction={signup}>Registrer</button>
    </form>
  );
}
```

### `src/app/login/actions.ts` — Server Actions for login/signup/logout

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=invalid");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/login?error=invalid");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
```

### Auth-sjekk i Server Components

```tsx
// src/app/(protected)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <div>Hei, {user.email}</div>;
}
```

**Viktig**: bruk alltid `supabase.auth.getUser()` (validerer JWT) — ikke `getSession()` som bare leser cookie uten verifisering.

## Row Level Security (RLS)

**Alltid aktiver RLS på tabeller med brukerdata.** Legg det til i første migrasjon:

```sql
-- I supabase/migrations/<timestamp>_<navn>.sql
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brukere leser egne posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Brukere skriver egne posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);
```

Uten RLS er data tilgjengelig for alle med publishable key (som er offentlig).

## OAuth (valgfritt)

Legges til i Supabase dashboard → Authentication → Providers → GitHub/Google/etc. Ingen kode-endringer nødvendig utover login-button:

```tsx
const { error } = await supabase.auth.signInWithOAuth({
  provider: "github",
  options: { redirectTo: `${location.origin}/auth/callback` },
});
```

Og en callback-route: `src/app/auth/callback/route.ts` som håndterer code exchange. Se docs for detaljer.

## Forventet resultat

- `src/app/login/page.tsx` og `actions.ts` fungerer for e-post/passord.
- `supabase.auth.getUser()` kan kalles i Server Components/Actions.
- RLS planlagt for tabeller som opprettes senere.

## Feilsøking

- **`getUser()` returnerer `null` selv etter login**: proxy kjører ikke for ruten — sjekk matcher.
- **"Invalid JWT"**: JWT-secret i Supabase har rotert; logg ut og inn.
- **Passord-validering for svak**: justér i Supabase dashboard → Authentication → Policies.

## Avkrysning

Kryss av steg 05 i `oppstart/CHECKLIST.md` når ferdig.

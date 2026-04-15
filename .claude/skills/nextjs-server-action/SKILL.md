---
name: nextjs-server-action
description: Lag Server Action med Supabase auth + Zod-validering + strukturert feil-respons. Bruk når brukeren ber om en mutation (opprett/oppdater/slett) som skal kjøres fra en form.
---

# Server Action — standardmønster (Supabase)

## Oppskrift

Hver Server Action skal ha:

1. `"use server"`-direktiv (enten øverst i filen eller inline i funksjon)
2. Supabase-klient via `createClient()` fra `@/lib/supabase/server`
3. Auth-sjekk via `supabase.auth.getUser()` (ikke `getSession`)
4. Zod-validering av input
5. Strukturert retur `{ ok: true } | { ok: false, error }` (eller throw hvis du bruker form-libs som håndterer det)
6. `revalidatePath` eller `revalidateTag` ved suksess

RLS-policies på tabellen håndhever også eier-sjekker, men Zod + auth-sjekk gir raskere og tydeligere feilmeldinger.

## Mal: opprett-action i dedikert fil

```tsx
// src/lib/actions/create-post.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

export type CreatePostResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ ...parsed.data, author_id: user.id })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/posts");
  return { ok: true, id: data.id };
}
```

## Mal: inline action (enkel form)

```tsx
// src/app/posts/new/page.tsx
import { createPost } from "@/lib/actions/create-post";

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="body" />
      <button type="submit">Opprett</button>
    </form>
  );
}
```

## Med `useActionState` for progressiv enhancement

```tsx
"use client";
import { useActionState } from "react";
import { createPost } from "@/lib/actions/create-post";

export function CreatePostForm() {
  const [state, formAction, pending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input name="title" />
      {state?.fieldErrors?.title && <p>{state.fieldErrors.title[0]}</p>}
      <button disabled={pending}>Opprett</button>
    </form>
  );
}
```

## Regler

- **Aldri stol på type-signaturer for input** — `FormData` er `unknown` i praksis. Alltid Zod.
- **Aldri returner rådata fra Supabase-errors direkte** — kan lekke intern info. `error.message` er OK for debug, men vurder å mappe til generisk melding i produksjon.
- **`revalidatePath` / `revalidateTag`** etter mutations, ellers ser brukeren stale data.
- **Ikke la actions være i Client Components** — de må være server-sidig definert og importeres.
- **Stol ikke på at proxy beskytter alle muterende actions** — valider alltid `getUser()` her.

## Vanlige feil

| Feil | Fix |
|------|-----|
| `ReferenceError: action is not defined` i client | Sørg for `"use server"` øverst i action-filen |
| Data oppdateres ikke i UI etter action | Mangler `revalidatePath` eller `revalidateTag` |
| `Row violates row-level security policy` | RLS-policy blokkerer insert/update — sjekk at `author_id = auth.uid()` matcher |
| `getUser()` returnerer null | Proxy kjører ikke for denne ruten — sjekk matcher i `src/proxy.ts` |

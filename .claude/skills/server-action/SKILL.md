---
name: server-action
description: Lag Server Action med Zod-validering, auth-sjekk og strukturert feil-respons. Bruk når brukeren ber om en mutation (opprett/oppdater/slett) som skal kjøres fra en form.
---

# Server Action — standardmønster

## Oppskrift

Hver Server Action skal ha:

1. `"use server"`-direktiv (enten øverst i filen eller inline i funksjon)
2. Auth-sjekk via `auth()`
3. Zod-validering av input
4. Strukturert retur `{ data } | { error }` (eller throw hvis du bruker form-libs som håndterer det)
5. `revalidatePath` eller `revalidateTag` ved suksess

## Mal: opprett-action i dedikert fil

```tsx
// src/lib/actions/create-post.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

export type CreatePostResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const post = await db.post.create({
    data: { ...parsed.data, authorId: session.user.id },
  });

  revalidatePath("/posts");
  return { ok: true, id: post.id };
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

## Med `useFormState` / `useActionState` for progressiv enhancement

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
- **Aldri returner rådata fra exceptions** — kan lekke intern info. Returner generiske meldinger.
- **`revalidatePath` / `revalidateTag`** etter mutations, ellers ser brukeren stale data.
- **Ikke la actions være i Client Components** — de må være server-sidig definert og importeres.

## Vanlige feil

| Feil | Fix |
|------|-----|
| `ReferenceError: action is not defined` i client | Sørg for `"use server"` øverst i action-filen |
| Data oppdateres ikke i UI etter action | Mangler `revalidatePath` eller `revalidateTag` |
| TS-feil: `FormData` kan ikke passeres | Bekreft at action ikke er deklarert inline i Client Component uten `"use server"` |

---
name: form-patterns
description: Standard-mønster for forms i Next.js — react-hook-form + Zod + shadcn Form + Server Actions + useActionState. Bruk hver gang du skal lage en form (login, signup, create-post, edit-profile, osv.).
---

# Form Patterns

Forms er ~30 % av typisk Next.js-arbeid. Templaten har én standard-stack: **react-hook-form** for klient-side state, **Zod** for validering, **shadcn Form**-komponenter for UI, **Server Actions** for submit, og **`useActionState`** for progressiv enhancement.

## Installasjon (hvis ikke allerede gjort)

```bash
pnpm add react-hook-form @hookform/resolvers zod
npx shadcn@latest add form
```

## Standardmønster: Form med Server Action

### 1. Server Action med Zod-validering

`src/lib/actions/create-post.ts`:

```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

const schema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

export type CreatePostResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createPost(
  _prevState: CreatePostResult | null,
  formData: FormData
): Promise<CreatePostResult> {
  const t = await getTranslations("Forms.CreatePost");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: t("errors.unauthorized") };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.validation"),
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

### 2. Form-komponent med react-hook-form + shadcn + useActionState

`src/app/[locale]/posts/new/_components/create-post-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/lib/actions/create-post";

// Samme schema som action (dupliser eller eksporter)
const schema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function CreatePostForm() {
  const t = useTranslations("Forms.CreatePost");
  const [state, formAction, pending] = useActionState(createPost, null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", body: "" },
  });

  // Vis toast ved state-endring
  if (state?.ok) toast.success(t("success"));
  if (state && !state.ok) toast.error(state.error);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("title")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("body")}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
```

### 3. Messages-keys (i18n)

`messages/no.json`:
```json
{
  "Forms": {
    "CreatePost": {
      "title": "Tittel",
      "body": "Innhold",
      "submit": "Opprett",
      "submitting": "Oppretter…",
      "success": "Post opprettet",
      "errors": {
        "unauthorized": "Du må være logget inn",
        "validation": "Sjekk feltene"
      }
    }
  }
}
```

Samme keys i `en.json`, `sv.json` osv. (se `i18n-translations`-skill).

## Vanlige variasjoner

### A. Optimistic updates

Når brukeren ikke skal vente på server-respons:

```tsx
import { useOptimistic } from "react";

const [optimisticPosts, addOptimistic] = useOptimistic(
  posts,
  (state, newPost: Post) => [...state, newPost]
);

async function handleSubmit(data: FormValues) {
  const tempId = crypto.randomUUID();
  addOptimistic({ id: tempId, ...data, author_id: user.id, createdAt: new Date() });
  await createPost(data);
}
```

### B. File uploads

Bruk `input type="file"` + `FormData`:
```tsx
<Input type="file" name="avatar" accept="image/*" />
```

Server Action:
```typescript
const file = formData.get("avatar") as File;
const { data } = await supabase.storage.from("avatars").upload(path, file);
```

### C. Multi-step forms

Lagre partial state i server-state (Supabase draft-tabell) eller React Context. Ikke oppskede formData-objektet på tvers av steg — det er bare for submit.

### D. Dynamisk felt-array

Bruk `useFieldArray` fra react-hook-form:
```tsx
const { fields, append, remove } = useFieldArray({ control, name: "tags" });
```

## Anti-patterns

- ❌ `onSubmit={(e) => { e.preventDefault(); ... }}` — bruk Server Action direkte på `action={formAction}`
- ❌ Client-side fetch til egen API-rute når Server Action gjør samme jobb
- ❌ Duplisere validering (Zod på klient *og* server) uten å dele schema — del schema via `src/lib/schemas/*`
- ❌ Hardkodede strings i labels/placeholders — alle gjennom `useTranslations`
- ❌ Glemme `revalidatePath`/`revalidateTag` etter suksess — UI viser stale data
- ❌ `"use client"` i hele sider for å støtte ett skjema — bare skjema-komponenten trenger det

## Sjekkliste når du lager ny form

- [ ] Schema definert i `src/lib/schemas/` og importert både i action og form
- [ ] Server Action følger standardmønster (auth-sjekk, Zod, revalidate)
- [ ] Form bruker `useForm` + `zodResolver`
- [ ] `useActionState` for submit + pending state
- [ ] Toast ved suksess/feil
- [ ] Alle tekster oversatt (no + en minimum, se i18n)
- [ ] Fokus-indikatorer og ARIA via shadcn Form-komponenter (automatisk)
- [ ] Feilmeldinger er i18n-oversatte
- [ ] Submit-knapp disables under `pending`

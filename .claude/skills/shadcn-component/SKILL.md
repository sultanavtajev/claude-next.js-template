---
name: shadcn-component
description: Legg til eller tilpass shadcn/ui-komponenter. Bruk når brukeren ber om en knapp, dialog, form, eller annen UI-komponent.
---

# shadcn/ui — legge til og tilpasse komponenter

## Legge til ny komponent

```bash
npx shadcn@latest add <komponent-navn>
```

Eksempler:
- `npx shadcn@latest add button`
- `npx shadcn@latest add dialog sheet dropdown-menu`
- `npx shadcn@latest add form`

Komponenten legges i `src/components/ui/<navn>.tsx`. Den er **din kode** — rediger den direkte hvis du trenger å tilpasse.

## Sjekk først

Før du kjører `shadcn add`:

1. Finnes komponenten allerede? Sjekk `src/components/ui/`.
2. Finnes en eksisterende komponent som gjør samme jobb med annen stil? Foretrekk gjenbruk.
3. Hvis du er usikker på komponent-navnet, sjekk `ui.shadcn.com/docs/components` via WebFetch.

## Bruk

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MyForm() {
  return (
    <form>
      <Input name="email" />
      <Button type="submit">Send</Button>
    </form>
  );
}
```

## Forms: `react-hook-form` + Zod

shadcn sin `Form`-komponent er en wrapper rundt `react-hook-form`.

```bash
npx shadcn@latest add form
pnpm add react-hook-form @hookform/resolvers zod
```

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const schema = z.object({
  email: z.string().email(),
});

export function MyForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    // ...
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-post</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## Tema og farger

shadcn bruker CSS-variabler definert i `src/app/globals.css`. For å endre farger:

1. Gå til `ui.shadcn.com/themes`
2. Velg farger
3. Kopier CSS-variablene inn i `globals.css` (erstatt eksisterende `:root { --... }`).

## Varianter

shadcn-komponenter bruker `class-variance-authority` (`cva`). Eksempel fra `button.tsx`:

```ts
const buttonVariants = cva("...base-klasser...", {
  variants: {
    variant: { default: "...", outline: "...", ghost: "..." },
    size: { default: "h-10", sm: "h-9", lg: "h-11" },
  },
});
```

Legg til ny variant: utvid `variants`-objektet direkte i komponent-filen.

## Anti-patterns

- ❌ Installere `@shadcn/ui` som npm-pakke — det finnes ikke. Komponenten kopieres inn via CLI.
- ❌ `npm install` en shadcn-komponent — bruk `npx shadcn@latest add`.
- ❌ Redigere `components.json` for hånd — bruk init.

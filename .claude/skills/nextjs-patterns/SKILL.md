---
name: nextjs-patterns
description: Kjerne-mønstre for Next.js App Router — Server vs Client Components, data fetching, caching, streaming. Bruk når du skal lage nye sider/komponenter eller treffer beslutninger om rendering-grense.
---

# Next.js App Router — kjerne-mønstre

## Server vs Client Components

**Server Components er default.** Bruk `"use client"` kun når du trenger:
- State (`useState`, `useReducer`)
- Effects (`useEffect`, `useLayoutEffect`)
- Event handlers (`onClick`, `onChange`)
- Browser-only API (`window`, `localStorage`)
- React Context som er klient-sidig

Ikke legg `"use client"` "for sikkerhets skyld" — det river ned hele treet under komponenten til client bundle.

### Mønster: Server-komponent som wrapper rundt client-komponent

```tsx
// app/dashboard/page.tsx — Server Component
import { db } from "@/lib/db";
import { InteractiveChart } from "./interactive-chart";

export default async function Page() {
  const data = await db.metric.findMany();
  return <InteractiveChart data={data} />;
}

// app/dashboard/interactive-chart.tsx — Client Component
"use client";
import { useState } from "react";
export function InteractiveChart({ data }: { data: Metric[] }) {
  const [filter, setFilter] = useState("all");
  return <div>...</div>;
}
```

Data hentes på server, interaktivitet skjer på client. Ikke fetch i client når du kan gjøre det i server.

## Data fetching

**I Server Components**: `async`-komponenter, direkte kall til DB eller fetch.

```tsx
export default async function Page() {
  const users = await db.user.findMany();
  return <UserList users={users} />;
}
```

**I Server Actions**: for mutations (POST/PUT/DELETE).

```tsx
async function createUser(formData: FormData) {
  "use server";
  const parsed = createUserSchema.parse(Object.fromEntries(formData));
  await db.user.create({ data: parsed });
}
```

**I Route Handlers** (`app/api/*/route.ts`): for tredjeparts clients, webhooks, ikke-form data.

## Caching (Next.js 15+)

Next 15 **opt-in-caching**: `fetch` cacher ikke by default lenger. Bruk eksplisitt:

```tsx
// Cache med tag for revalidering
const data = await fetch(url, { next: { tags: ["users"] } });

// Ingen cache (alltid fersk)
const data = await fetch(url, { cache: "no-store" });

// Cache med tidsbasert revalidering
const data = await fetch(url, { next: { revalidate: 60 } });
```

**`revalidateTag("users")`** for å invalidere etter en mutation.

## Streaming og Suspense

Langsomme komponenter: wrap i `<Suspense>` med en fallback.

```tsx
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>
```

`loading.tsx` ved siden av `page.tsx` gir automatisk streaming for hele siden.

## Metadata

```tsx
export const metadata: Metadata = {
  title: "Side",
  description: "...",
};

// eller dynamisk:
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchData(params.slug);
  return { title: data.title };
}
```

## Vanlige feil å unngå

- ❌ `useEffect` for data fetching i Server Components (bruk `async` direkte).
- ❌ Importere server-only moduler (`@/lib/db`) i Client Components.
- ❌ Glemme `"use server"` på Server Actions.
- ❌ Passere funksjoner som props fra Server til Client (ikke serialiserbart — bruk Server Actions i stedet).
- ❌ Anta at `fetch` cacher som i Next 14.

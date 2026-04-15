---
name: nextjs-caching
description: Next.js 15+ caching-semantikk — fetch-cache, unstable_cache, revalidateTag/Path, dynamic/static, ISR. Bruk når du skal bestemme cache-strategi for en rute, eller feilsøke "hvorfor vises stale data?".
---

# Caching Strategy (Next.js 15+)

Next.js 15 gjorde **opt-in-caching** default: `fetch` cacher IKKE lenger automatisk. Dette brøt mange antagelser fra Next.js 14. Denne skillen gir deg et systematisk rammeverk for cache-valg.

## Kjerneprinsippet

Fire spørsmål å svare på for hver data-henting:

1. **Kan denne dataen endres?** Hvis ja → dynamisk eller revalidasjons-strategi.
2. **Hvor ofte endres den?** Bestemmer `revalidate`-intervall.
3. **Hvem ser dataen?** Generell (cacheable) vs per-bruker (ikke cacheable).
4. **Når endres den?** Via `revalidatePath`/`revalidateTag` etter mutation, eller tidsbasert?

## Beslutnings-tre

```
Data henter du?
├─ Statisk (aldri endres etter build): ingen config, default cache
│     └─ Build-time rendering
├─ Oppdateres ved mutations (posts, brukere, etc.)
│     └─ `fetch(url, { next: { tags: ["posts"] } })`
│        + `revalidateTag("posts")` etter mutation
├─ Tidsbasert (aksjekurser, vær, osv.)
│     └─ `fetch(url, { next: { revalidate: 60 } })`
├─ Per-bruker (auth-data, cookies)
│     └─ `fetch(url, { cache: "no-store" })` eller `dynamic = "force-dynamic"`
└─ Ekte sanntid (chat, live notifikasjoner)
      └─ Supabase Realtime eller SSE, ikke fetch
```

## Praktiske mønstre

### 1. Statisk side med data fra DB

Posts-listen endres ved insert/update/delete. Bruk tag-revalidation:

```tsx
// src/app/[locale]/posts/page.tsx — Server Component
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const getPosts = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    return data ?? [];
  },
  ["posts"],         // cache-key
  { tags: ["posts"], revalidate: 3600 } // 1 time fallback
);

export default async function PostsPage() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
```

Etter en mutation:
```tsx
// src/lib/actions/create-post.ts
import { revalidateTag } from "next/cache";

export async function createPost(...) {
  // ... insert ...
  revalidateTag("posts");  // alle kall med tag "posts" fornyes
  return { ok: true };
}
```

### 2. Per-bruker-data (aldri cache)

```tsx
// Profile-side — alltid fersk
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // ...
}
```

`auth.getUser()` og `cookies()` i seg selv gjør ruten dynamisk. `force-dynamic` er bare eksplisitt.

### 3. Tidsbasert revalidering

```tsx
// src/app/[locale]/dashboard/page.tsx
export const revalidate = 60; // ny data minst hvert 60. sek

export default async function Dashboard() {
  const metrics = await fetch("https://api.example.com/metrics", {
    next: { revalidate: 60 }
  }).then(r => r.json());
  return <DashboardView metrics={metrics} />;
}
```

### 4. Eksterne fetch-kall

Standard-regel siden Next.js 15:

```tsx
// Cache eksplisitt med tag
await fetch(url, { next: { tags: ["users"], revalidate: 3600 } });

// Ikke cache
await fetch(url, { cache: "no-store" });

// Tidsbasert
await fetch(url, { next: { revalidate: 300 } });
```

Ikke stol på default-oppførsel — sett alltid eksplisitt.

### 5. `generateStaticParams` for dynamiske ruter

```tsx
// src/app/[locale]/posts/[slug]/page.tsx
export async function generateStaticParams() {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("slug");
  return (data ?? []).flatMap(({ slug }) => [
    { locale: "no", slug },
    { locale: "en", slug },
  ]);
}

export const dynamicParams = true; // tillat ruter som ikke er pre-rendret
export const revalidate = 3600;    // eller revalidateTag("posts")
```

## Når `dynamic = "force-dynamic"` er riktig

Bruk det eksplisitt når:
- Ruten leser fra `cookies()` / `headers()` / `searchParams`
- Per-bruker-data (authenticated pages)
- Admin-dashboards hvor friskhet er kritisk

**Ikke** bruk det som "safety net" når du er usikker — bedre å tenke gjennom caching.

## `revalidatePath` vs `revalidateTag`

| | `revalidatePath(path)` | `revalidateTag(tag)` |
|---|------------------------|----------------------|
| Treffer | Alle cached data for ruten | Alle kall som brukte tag-en |
| Presisjon | Grov (hele ruten) | Fin (spesifikke kall) |
| Når | Muterer én rute | Muterer data som brukes flere steder |

**Best practice**: bruk `revalidateTag` som default, `revalidatePath` kun når hele siden må re-rendres (f.eks. etter auth-endring: `revalidatePath("/", "layout")`).

## Supabase Realtime-alternativ

For ekte sanntid (chat, notifikasjoner): ikke kjemp mot caching. Bruk Supabase Realtime:

```tsx
"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function LiveMessages({ chatId }: { chatId: string }) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        // ... oppdatér UI
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatId]);
}
```

## Vanlige feil

| Symptom | Årsak | Fix |
|---------|-------|-----|
| Stale data etter mutation | Glemt `revalidateTag`/`revalidatePath` | Kall en av dem i Server Action |
| Brukerens data vises for andre | Cachet per-bruker-data | `dynamic = "force-dynamic"` eller `cache: "no-store"` |
| Alle ruter er dynamiske | Import av `@/lib/supabase/server` i `layout.tsx` | Flytt auth-sjekk til per-rute, bruk `force-dynamic` bare der nødvendig |
| Build feiler: "Dynamic server usage" | `cookies()` i en forventet statisk rute | Legg til `export const dynamic = "force-dynamic"` eller fjern avhengigheten |
| Inkremental build tar evig | For aggressiv `generateStaticParams` | Begrens til top N rute-verdier, bruk `dynamicParams = true` for resten |

## Sjekkliste for ny rute

- [ ] Bestem om ruten er statisk, ISR (revalidate), eller dynamic
- [ ] Hvis fetch brukes: eksplisitt `cache` eller `next.tags`/`next.revalidate` satt
- [ ] Hvis DB-queries i Server Component: bruk `unstable_cache` med passende tag
- [ ] Etter mutation i Server Action: `revalidateTag` eller `revalidatePath`
- [ ] Per-bruker-data: ikke cache (eller cache med user-id i tag-en)
- [ ] Realtime-behov: bruk Supabase Realtime, ikke polling

## Anti-patterns

- ❌ `fetch(url)` uten cache-config i Next.js 15+ (du får no-store default)
- ❌ `revalidate = 0` — bruk `dynamic = "force-dynamic"` i stedet
- ❌ Manuell invalidering via API-kall fra klient — bruk `revalidateTag` i Server Action
- ❌ `noStore()` uten å tenke gjennom konsekvensen (hele ruten blir dynamisk)
- ❌ Polling klient-side med `setInterval` når Realtime finnes

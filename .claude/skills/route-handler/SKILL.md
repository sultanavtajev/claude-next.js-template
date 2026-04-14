---
name: route-handler
description: Lag Next.js route handler (app/api/*/route.ts) med Supabase auth, typesikker input, og NextResponse. Bruk når brukeren ber om et API-endepunkt — f.eks. for webhooks, tredjeparts klienter, eller ikke-form data.
---

# Route Handler — standardmønster (Supabase)

## Når bruke route handler vs Server Action

| Bruk Server Action når | Bruk route handler når |
|------------------------|------------------------|
| Form-submit fra egen UI | Ekstern klient (mobil, webhook) |
| Mutation fra Server/Client Component i samme app | Tredjeparts integrasjon |
| Du vil ha innebygd CSRF-beskyttelse | Du trenger full kontroll over HTTP-metoder/headers |

## Mal: GET + POST handler

```ts
// src/app/api/posts/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({ ...parsed.data, author_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ post }, { status: 201 });
}
```

## Dynamiske ruter

```ts
// src/app/api/posts/[id]/route.ts
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Next 15+ — params er Promise
  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}
```

## HTTP-statuskoder — cheatsheet

| Kode | Når |
|------|-----|
| 200 | OK (GET) |
| 201 | Created (POST med ny ressurs) |
| 204 | No Content (DELETE suksess) |
| 400 | Bad Request (ugyldig JSON, manglende felt) |
| 401 | Unauthorized (ikke innlogget) |
| 403 | Forbidden (innlogget, men mangler tilgang — RLS-blokkering) |
| 404 | Not Found |
| 422 | Unprocessable Entity (Zod-validering feilet) |
| 429 | Too Many Requests (rate limit) |
| 500 | Server feil (uventet) |

## Runtime

Default er **Node.js runtime**. Supabase-klienten kjører også på **edge runtime** (i motsetning til Prisma):

```ts
export const runtime = "edge";
```

Nyttig for rask tilgang fra kanten hvis handleren ikke trenger Node-only API-er.

## Revalidering

For å invalidere cache etter mutation:

```ts
import { revalidateTag } from "next/cache";
// ...
revalidateTag("posts");
```

## Webhooks

For eksterne webhooks (Stripe, GitHub, Resend): verifiser signatur FØR du prosesserer body.

```ts
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // For webhooks som skal skrive uansett bruker-context:
  const supabase = createAdminClient(); // service role
  // ... oppdater data
}
```

## Service role — når det er OK

Hvis handleren må bypasse RLS (f.eks. admin-oppgaver, webhooks fra Stripe som oppdaterer user-data):

```ts
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  // Etter å ha verifisert webhook-signatur:
  const supabase = createAdminClient();
  await supabase.from("subscriptions").insert({ ... });
}
```

**Aldri** bruk admin-klienten uten at handleren først har verifisert at caller faktisk har autoritet (webhook-signatur, admin-rolle i JWT, osv.).

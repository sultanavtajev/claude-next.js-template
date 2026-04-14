---
name: nextjs-testing
description: Test-oppsett for Next.js — Vitest for unit/component, Playwright for E2E. Bruk når du skal legge til tester eller sette opp testing for første gang.
---

# Next.js Testing

## Vitest (unit + component)

### Installasjon

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

### `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### `vitest.setup.ts`

```ts
import "@testing-library/jest-dom/vitest";
```

### `package.json`-scripts

```json
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui"
```

### Eksempel: komponent-test

```tsx
// src/components/counter.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Counter } from "./counter";

describe("Counter", () => {
  it("incrementer på klikk", async () => {
    render(<Counter />);
    await userEvent.click(screen.getByRole("button", { name: /\+/ }));
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
```

### Testing av Server Components

Server Components kan ikke rendres direkte med React Testing Library. Alternativer:

1. **Test underliggende logikk** (data fetching, business-funksjoner) som vanlige funksjoner.
2. **Test via Playwright E2E** for full-stack-oppførsel.
3. Split ut Client Components og test dem isolert.

## Playwright (E2E)

### Installasjon

```bash
pnpm create playwright
```

Velg:
- TypeScript
- `tests/` eller `e2e/` som testmappe
- Inkluder GitHub Actions-workflow (valgfritt)

### `playwright.config.ts` — kritiske innstillinger

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Eksempel: E2E-test

```ts
import { test, expect } from "@playwright/test";

test("landing page laster", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
```

### Auth i E2E

For tester som krever innlogget bruker: bruk `storageState` for å gjenbruke en innlogget sesjon:

```ts
// e2e/auth.setup.ts
import { test as setup } from "@playwright/test";

setup("autentiser", async ({ page }) => {
  await page.goto("/login");
  // ... gjør innlogging
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
```

Referer til `storageState` i relevant projects i `playwright.config.ts`.

## Test-strategi

| Type | Dekker | Bruk når |
|------|--------|----------|
| Unit (Vitest) | Ren logikk, utils, funksjoner | Alltid — billigst og raskest |
| Component (Vitest + RTL) | Client Components | Når komponenten har kompleks interaktivitet |
| E2E (Playwright) | Full flyt (auth, DB, UI) | Kritiske user journeys — ikke alle ruter |

Dekningsmål: ~70% på kritisk forretningslogikk. Ikke jakt på 100%.

# add payment ui page

> **When to use:** the wish adds a new navigable page inside `payment_ui` — e.g., `/payment/dashboard`, `/payment/analytics`, `/payment/closed-invoices`. Not for tweaking an existing page (`/payment/invoices`) and not for a widget injected into someone else's surface.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters in `frontend/plugins/payment_ui/`:

| Sister page | File | Why |
|---|---|---|
| `InvoicesIndexPage` | `src/pages/InvoicesIndexPage.tsx` | the main `/payment` / `/payment/invoices` page — canonical layout with `PageHeader`, `PageContainer`, `Breadcrumb` |
| `InvoicesSettingsIndexPage` | `src/pages/InvoicesSettingsIndexPage.tsx` | settings-area page (exposed under a separate federation key) |
| `PosIndexPage` | `src/pages/PosIndexPage.tsx` | sibling top-level page in the same federation surface |

**Read these files in full** before writing any code:

- `frontend/plugins/payment_ui/src/pages/InvoicesIndexPage.tsx` — canonical page shape: `Breadcrumb`, `PageHeader`, `PageContainer`, `PageSubHeader`
- `frontend/plugins/payment_ui/src/modules/invoices/Main.tsx` — how routes inside the invoices module are declared (`<Route path="invoices" element={<InvoicesMain />} />`)
- `frontend/plugins/payment_ui/src/config.tsx` — `modules[]`, `path`, exposed navigation entries
- `frontend/plugins/payment_ui/module-federation.config.ts` — `exposes` map; how pages become host-mountable
- `frontend/plugins/payment_ui/src/MainNavigation.tsx`, `src/InvoicesSubNavigation.tsx` — where the new page's nav link lives
- [`../../docs/payment/module-federation.md`](../../docs/payment/module-federation.md) — host/remote conventions and shared-library rules

If the page lives inside `payment` (e.g., `/payment/dashboard`), mirror `Main.tsx` routing. If it's a new top-level path the host should mount (e.g., `/payment-reports`), you must extend `module-federation.config.ts` `exposes` and update `config.tsx` `modules[]`.

## Phase 4 — PLAN

Default plan for an in-`/payment/*` sub-page (e.g., `/payment/dashboard`):

1. **create the page component** — files: `frontend/plugins/payment_ui/src/pages/<NewPage>.tsx`
2. **add the route** — files: `frontend/plugins/payment_ui/src/modules/invoices/Main.tsx`
3. **add a nav entry** — files: `frontend/plugins/payment_ui/src/InvoicesSubNavigation.tsx` or `src/MainNavigation.tsx`
4. **(if the page needs data) add GraphQL queries + hook** — files: `src/modules/invoices/graphql/queries/...Queries.ts`, hook under `cards/hooks/` or a new directory if the page introduces a new entity surface
5. **playwright spec navigates to the new route** — files: `.agents/plugins/payment/tests/invoices.spec.ts`

If the page is host-exposed (rare), add one more commit:

6. **expose page in module-federation.config.ts + register in config.tsx** — files: `frontend/plugins/payment_ui/module-federation.config.ts`, `frontend/plugins/payment_ui/src/config.tsx`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`<NewPage>.tsx`** — start from `InvoicesIndexPage.tsx`. Keep the same shell: `Breadcrumb`, `PageHeader`, `PageContainer`. Components come from `erxes-ui` and `ui-modules` only. Do not import from another plugin ([`../../rules/20-architecture-boundaries.md`](../../rules/20-architecture-boundaries.md)).
2. **`Main.tsx`** — add a `<Route path="<new-segment>" element={<LazyNewPage />} />`. Use `lazy(() => import(...))` so the page chunks separately. Wrap the `<Routes>` in `Suspense` (already done — just add the route).
3. **Navigation** — `InvoicesSubNavigation.tsx` (sub-nav under payment group) or `MainNavigation.tsx` (top-level). Use `<Link to="/payment/<new-segment>">` and a Tabler icon.
4. **Data** — if the page needs invoices/pipelines, mirror an existing query in `graphql/queries/InvoicesQueries.ts` (see [`./add-payment-graphql-query.md`](./add-payment-graphql-query.md)).
5. **State** — local UI with `useState`; cross-component with a Jotai atom under `src/modules/invoices/states/` (the dir already has `invoicesBoardState`, `invoicesViewState`, etc.). No new state library.
6. **Forms** — React Hook Form + Zod, schema under `src/modules/invoices/schemas/`. See `boardFormSchema.ts` and the existing pattern in `cards/components/AddCardForm.tsx`.
7. Run `.agents/evals/run.sh payment`. Exit 0.

If host-exposed, restart `payment_ui` so Rspack rebuilds `mf-manifest.json` (see [`../../docs/payment/module-federation.md`](../../docs/payment/module-federation.md) "Verifying").

## Phase 6 — VERIFY

Add to `.agents/plugins/payment/tests/invoices.spec.ts`:

- a test that `page.goto('/payment/<new-segment>')` and asserts the unique heading/breadcrumb is visible
- a test that asserts the nav link is reachable from `/payment/invoices` (click it, expect the URL change)
- if the page renders data, a test that the data area renders (or a `test.skip` with the seeding-required reason — see the existing skips in `invoices.spec.ts` lines 80–88)

Run: `cd .agents && pnpm test plugins/payment/tests/invoices.spec.ts`

## Pitfalls (specific to this skill)

- **Don't add to `shared:`** in `module-federation.config.ts`. Singletons are reserved for libraries already host-shared. Adding a new one silently breaks every other plugin that doesn't share the same version. See [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `module-federation.config.ts`".
- A new exposed page MUST be lazy-loaded by the consumer. Static imports in the host bloat the initial bundle.
- Routes must live inside the existing `<Routes>` in `Main.tsx` if the page is under `/payment/*`. Adding a sibling `<Routes>` at the page level causes React Router to mount/unmount incorrectly.
- Do not import a UI component from `frontend/plugins/operation_ui/` etc. Cross-plugin UI is illegal here — if you need a component from another plugin, promote it to `frontend/libs/ui-modules/` first.
- The page is multi-tenant transparently — `Apollo Client` already injects subdomain via the gateway. You almost never write subdomain code in the UI ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md) "if you're writing code that does NOT touch models").

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `console.log` left in the page
- [ ] No `as any` casts to silence Apollo types
- [ ] No defensive `invoice?.name ?? ''` where the type already guarantees `string`
- [ ] No new shared deps in `module-federation.config.ts`
- [ ] No commented-out section ("might use this later")
- [ ] `Suspense` boundary wraps every `lazy()` import

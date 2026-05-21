# add sales ui page

> **When to use:** the wish adds a new navigable page inside `sales_ui` — e.g., `/sales/dashboard`, `/sales/analytics`, `/sales/closed-deals`. Not for tweaking an existing page (`/sales/deals`) and not for a widget injected into someone else's surface.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters in `frontend/plugins/sales_ui/`:

| Sister page | File | Why |
|---|---|---|
| `SalesIndexPage` | `src/pages/SalesIndexPage.tsx` | the main `/sales` / `/sales/deals` page — canonical layout with `PageHeader`, `PageContainer`, `Breadcrumb` |
| `SalesSettingsIndexPage` | `src/pages/SalesSettingsIndexPage.tsx` | settings-area page (exposed under a separate federation key) |
| `PosIndexPage` | `src/pages/PosIndexPage.tsx` | sibling top-level page in the same federation surface |

**Read these files in full** before writing any code:

- `frontend/plugins/sales_ui/src/pages/SalesIndexPage.tsx` — canonical page shape: `Breadcrumb`, `PageHeader`, `PageContainer`, `PageSubHeader`
- `frontend/plugins/sales_ui/src/modules/deals/Main.tsx` — how routes inside the deals module are declared (`<Route path="deals" element={<DealsMain />} />`)
- `frontend/plugins/sales_ui/src/config.tsx` — `modules[]`, `path`, exposed navigation entries
- `frontend/plugins/sales_ui/module-federation.config.ts` — `exposes` map; how pages become host-mountable
- `frontend/plugins/sales_ui/src/MainNavigation.tsx`, `src/SalesSubNavigation.tsx` — where the new page's nav link lives
- [`../../docs/sales/module-federation.md`](../../docs/sales/module-federation.md) — host/remote conventions and shared-library rules

If the page lives inside `sales` (e.g., `/sales/dashboard`), mirror `Main.tsx` routing. If it's a new top-level path the host should mount (e.g., `/sales-reports`), you must extend `module-federation.config.ts` `exposes` and update `config.tsx` `modules[]`.

## Phase 4 — PLAN

Default plan for an in-`/sales/*` sub-page (e.g., `/sales/dashboard`):

1. **create the page component** — files: `frontend/plugins/sales_ui/src/pages/<NewPage>.tsx`
2. **add the route** — files: `frontend/plugins/sales_ui/src/modules/deals/Main.tsx`
3. **add a nav entry** — files: `frontend/plugins/sales_ui/src/SalesSubNavigation.tsx` or `src/MainNavigation.tsx`
4. **(if the page needs data) add GraphQL queries + hook** — files: `src/modules/deals/graphql/queries/...Queries.ts`, hook under `cards/hooks/` or a new directory if the page introduces a new entity surface
5. **playwright spec navigates to the new route** — files: `.agents/plugins/sales/tests/deals.spec.ts`

If the page is host-exposed (rare), add one more commit:

6. **expose page in module-federation.config.ts + register in config.tsx** — files: `frontend/plugins/sales_ui/module-federation.config.ts`, `frontend/plugins/sales_ui/src/config.tsx`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`<NewPage>.tsx`** — start from `SalesIndexPage.tsx`. Keep the same shell: `Breadcrumb`, `PageHeader`, `PageContainer`. Components come from `erxes-ui` and `ui-modules` only. Do not import from another plugin ([`../../rules/20-architecture-boundaries.md`](../../rules/20-architecture-boundaries.md)).
2. **`Main.tsx`** — add a `<Route path="<new-segment>" element={<LazyNewPage />} />`. Use `lazy(() => import(...))` so the page chunks separately. Wrap the `<Routes>` in `Suspense` (already done — just add the route).
3. **Navigation** — `SalesSubNavigation.tsx` (sub-nav under sales group) or `MainNavigation.tsx` (top-level). Use `<Link to="/sales/<new-segment>">` and a Tabler icon.
4. **Data** — if the page needs deals/pipelines, mirror an existing query in `graphql/queries/DealsQueries.ts` (see [`./add-sales-graphql-query.md`](./add-sales-graphql-query.md)).
5. **State** — local UI with `useState`; cross-component with a Jotai atom under `src/modules/deals/states/` (the dir already has `dealsBoardState`, `dealsViewState`, etc.). No new state library.
6. **Forms** — React Hook Form + Zod, schema under `src/modules/deals/schemas/`. See `boardFormSchema.ts` and the existing pattern in `cards/components/AddCardForm.tsx`.
7. Run `.agents/evals/run.sh sales`. Exit 0.

If host-exposed, restart `sales_ui` so Rspack rebuilds `mf-manifest.json` (see [`../../docs/sales/module-federation.md`](../../docs/sales/module-federation.md) "Verifying").

## Phase 6 — VERIFY

Add to `.agents/plugins/sales/tests/deals.spec.ts`:

- a test that `page.goto('/sales/<new-segment>')` and asserts the unique heading/breadcrumb is visible
- a test that asserts the nav link is reachable from `/sales/deals` (click it, expect the URL change)
- if the page renders data, a test that the data area renders (or a `test.skip` with the seeding-required reason — see the existing skips in `deals.spec.ts` lines 80–88)

Run: `cd .agents && pnpm test plugins/sales/tests/deals.spec.ts`

## Pitfalls (specific to this skill)

- **Don't add to `shared:`** in `module-federation.config.ts`. Singletons are reserved for libraries already host-shared. Adding a new one silently breaks every other plugin that doesn't share the same version. See [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `module-federation.config.ts`".
- A new exposed page MUST be lazy-loaded by the consumer. Static imports in the host bloat the initial bundle.
- Routes must live inside the existing `<Routes>` in `Main.tsx` if the page is under `/sales/*`. Adding a sibling `<Routes>` at the page level causes React Router to mount/unmount incorrectly.
- Do not import a UI component from `frontend/plugins/operation_ui/` etc. Cross-plugin UI is illegal here — if you need a component from another plugin, promote it to `frontend/libs/ui-modules/` first.
- The page is multi-tenant transparently — `Apollo Client` already injects subdomain via the gateway. You almost never write subdomain code in the UI ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md) "if you're writing code that does NOT touch models").

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `console.log` left in the page
- [ ] No `as any` casts to silence Apollo types
- [ ] No defensive `deal?.name ?? ''` where the type already guarantees `string`
- [ ] No new shared deps in `module-federation.config.ts`
- [ ] No commented-out section ("might use this later")
- [ ] `Suspense` boundary wraps every `lazy()` import

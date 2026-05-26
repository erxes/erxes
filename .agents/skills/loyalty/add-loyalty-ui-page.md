# add loyalty ui page

> **When to use:** the wish adds a new navigable page inside `loyalty_ui` — e.g., `/loyalty/dashboard`, `/loyalty/analytics`, `/loyalty/closed-vouchers`. Not for tweaking an existing page (`/loyalty/vouchers`) and not for a widget injected into someone else's surface.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters in `frontend/plugins/loyalty_ui/`:

| Sister page | File | Why |
|---|---|---|
| `VouchersIndexPage` | `src/pages/VouchersIndexPage.tsx` | the main `/loyalty` / `/loyalty/vouchers` page — canonical layout with `PageHeader`, `PageContainer`, `Breadcrumb` |
| `VouchersSettingsIndexPage` | `src/pages/VouchersSettingsIndexPage.tsx` | settings-area page (exposed under a separate federation key) |
| `PosIndexPage` | `src/pages/PosIndexPage.tsx` | sibling top-level page in the same federation surface |

**Read these files in full** before writing any code:

- `frontend/plugins/loyalty_ui/src/pages/VouchersIndexPage.tsx` — canonical page shape: `Breadcrumb`, `PageHeader`, `PageContainer`, `PageSubHeader`
- `frontend/plugins/loyalty_ui/src/modules/vouchers/Main.tsx` — how routes inside the vouchers module are declared (`<Route path="vouchers" element={<VouchersMain />} />`)
- `frontend/plugins/loyalty_ui/src/config.tsx` — `modules[]`, `path`, exposed navigation entries
- `frontend/plugins/loyalty_ui/module-federation.config.ts` — `exposes` map; how pages become host-mountable
- `frontend/plugins/loyalty_ui/src/MainNavigation.tsx`, `src/VouchersSubNavigation.tsx` — where the new page's nav link lives
- [`../../docs/loyalty/module-federation.md`](../../docs/loyalty/module-federation.md) — host/remote conventions and shared-library rules

If the page lives inside `loyalty` (e.g., `/loyalty/dashboard`), mirror `Main.tsx` routing. If it's a new top-level path the host should mount (e.g., `/loyalty-reports`), you must extend `module-federation.config.ts` `exposes` and update `config.tsx` `modules[]`.

## Phase 4 — PLAN

Default plan for an in-`/loyalty/*` sub-page (e.g., `/loyalty/dashboard`):

1. **create the page component** — files: `frontend/plugins/loyalty_ui/src/pages/<NewPage>.tsx`
2. **add the route** — files: `frontend/plugins/loyalty_ui/src/modules/vouchers/Main.tsx`
3. **add a nav entry** — files: `frontend/plugins/loyalty_ui/src/VouchersSubNavigation.tsx` or `src/MainNavigation.tsx`
4. **(if the page needs data) add GraphQL queries + hook** — files: `src/modules/vouchers/graphql/queries/...Queries.ts`, hook under `cards/hooks/` or a new directory if the page introduces a new entity surface
5. **playwright spec navigates to the new route** — files: `.agents/plugins/loyalty/tests/vouchers.spec.ts`

If the page is host-exposed (rare), add one more commit:

6. **expose page in module-federation.config.ts + register in config.tsx** — files: `frontend/plugins/loyalty_ui/module-federation.config.ts`, `frontend/plugins/loyalty_ui/src/config.tsx`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`<NewPage>.tsx`** — start from `VouchersIndexPage.tsx`. Keep the same shell: `Breadcrumb`, `PageHeader`, `PageContainer`. Components come from `erxes-ui` and `ui-modules` only. Do not import from another plugin ([`../../rules/20-architecture-boundaries.md`](../../rules/20-architecture-boundaries.md)).
2. **`Main.tsx`** — add a `<Route path="<new-segment>" element={<LazyNewPage />} />`. Use `lazy(() => import(...))` so the page chunks separately. Wrap the `<Routes>` in `Suspense` (already done — just add the route).
3. **Navigation** — `VouchersSubNavigation.tsx` (sub-nav under loyalty group) or `MainNavigation.tsx` (top-level). Use `<Link to="/loyalty/<new-segment>">` and a Tabler icon.
4. **Data** — if the page needs vouchers/pipelines, mirror an existing query in `graphql/queries/VouchersQueries.ts` (see [`./add-loyalty-graphql-query.md`](./add-loyalty-graphql-query.md)).
5. **State** — local UI with `useState`; cross-component with a Jotai atom under `src/modules/vouchers/states/` (the dir already has `vouchersBoardState`, `vouchersViewState`, etc.). No new state library.
6. **Forms** — React Hook Form + Zod, schema under `src/modules/vouchers/schemas/`. See `boardFormSchema.ts` and the existing pattern in `cards/components/AddCardForm.tsx`.
7. Run `.agents/evals/run.sh loyalty`. Exit 0.

If host-exposed, restart `loyalty_ui` so Rspack rebuilds `mf-manifest.json` (see [`../../docs/loyalty/module-federation.md`](../../docs/loyalty/module-federation.md) "Verifying").

## Phase 6 — VERIFY

Add to `.agents/plugins/loyalty/tests/vouchers.spec.ts`:

- a test that `page.goto('/loyalty/<new-segment>')` and asserts the unique heading/breadcrumb is visible
- a test that asserts the nav link is reachable from `/loyalty/vouchers` (click it, expect the URL change)
- if the page renders data, a test that the data area renders (or a `test.skip` with the seeding-required reason — see the existing skips in `vouchers.spec.ts` lines 80–88)

Run: `cd .agents && pnpm test plugins/loyalty/tests/vouchers.spec.ts`

## Pitfalls (specific to this skill)

- **Don't add to `shared:`** in `module-federation.config.ts`. Singletons are reserved for libraries already host-shared. Adding a new one silently breaks every other plugin that doesn't share the same version. See [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `module-federation.config.ts`".
- A new exposed page MUST be lazy-loaded by the consumer. Static imports in the host bloat the initial bundle.
- Routes must live inside the existing `<Routes>` in `Main.tsx` if the page is under `/loyalty/*`. Adding a sibling `<Routes>` at the page level causes React Router to mount/unmount incorrectly.
- Do not import a UI component from `frontend/plugins/operation_ui/` etc. Cross-plugin UI is illegal here — if you need a component from another plugin, promote it to `frontend/libs/ui-modules/` first.
- The page is multi-tenant transparently — `Apollo Client` already injects subdomain via the gateway. You almost never write subdomain code in the UI ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md) "if you're writing code that does NOT touch models").

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `console.log` left in the page
- [ ] No `as any` casts to silence Apollo types
- [ ] No defensive `voucher?.name ?? ''` where the type already guarantees `string`
- [ ] No new shared deps in `module-federation.config.ts`
- [ ] No commented-out section ("might use this later")
- [ ] `Suspense` boundary wraps every `lazy()` import

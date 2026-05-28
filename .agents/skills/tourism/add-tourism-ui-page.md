# add tourism ui page

> **When to use:** the wish adds a new navigable page inside `tourism_ui` — e.g., `/tourism/dashboard`, `/tourism/analytics`, `/tourism/closed-tours`. Not for tweaking an existing page (`/tourism/tours`) and not for a widget injected into someone else's surface.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters in `frontend/plugins/tourism_ui/`:

| Sister page | File | Why |
|---|---|---|
| `ToursIndexPage` | `src/pages/ToursIndexPage.tsx` | the main `/tourism` / `/tourism/tours` page — canonical layout with `PageHeader`, `PageContainer`, `Breadcrumb` |
| `ToursSettingsIndexPage` | `src/pages/ToursSettingsIndexPage.tsx` | settings-area page (exposed under a separate federation key) |
| `PosIndexPage` | `src/pages/PosIndexPage.tsx` | sibling top-level page in the same federation surface |

**Read these files in full** before writing any code:

- `frontend/plugins/tourism_ui/src/pages/ToursIndexPage.tsx` — canonical page shape: `Breadcrumb`, `PageHeader`, `PageContainer`, `PageSubHeader`
- `frontend/plugins/tourism_ui/src/modules/tours/Main.tsx` — how routes inside the tours module are declared (`<Route path="tours" element={<ToursMain />} />`)
- `frontend/plugins/tourism_ui/src/config.tsx` — `modules[]`, `path`, exposed navigation entries
- `frontend/plugins/tourism_ui/module-federation.config.ts` — `exposes` map; how pages become host-mountable
- `frontend/plugins/tourism_ui/src/MainNavigation.tsx`, `src/ToursSubNavigation.tsx` — where the new page's nav link lives
- [`../../docs/tourism/module-federation.md`](../../docs/tourism/module-federation.md) — host/remote conventions and shared-library rules

If the page lives inside `tourism` (e.g., `/tourism/dashboard`), mirror `Main.tsx` routing. If it's a new top-level path the host should mount (e.g., `/tourism-reports`), you must extend `module-federation.config.ts` `exposes` and update `config.tsx` `modules[]`.

## Phase 4 — PLAN

Default plan for an in-`/tourism/*` sub-page (e.g., `/tourism/dashboard`):

1. **create the page component** — files: `frontend/plugins/tourism_ui/src/pages/<NewPage>.tsx`
2. **add the route** — files: `frontend/plugins/tourism_ui/src/modules/tours/Main.tsx`
3. **add a nav entry** — files: `frontend/plugins/tourism_ui/src/ToursSubNavigation.tsx` or `src/MainNavigation.tsx`
4. **(if the page needs data) add GraphQL queries + hook** — files: `src/modules/tours/graphql/queries/...Queries.ts`, hook under `cards/hooks/` or a new directory if the page introduces a new entity surface
5. **playwright spec navigates to the new route** — files: `.agents/plugins/tourism/tests/tours.spec.ts`

If the page is host-exposed (rare), add one more commit:

6. **expose page in module-federation.config.ts + register in config.tsx** — files: `frontend/plugins/tourism_ui/module-federation.config.ts`, `frontend/plugins/tourism_ui/src/config.tsx`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`<NewPage>.tsx`** — start from `ToursIndexPage.tsx`. Keep the same shell: `Breadcrumb`, `PageHeader`, `PageContainer`. Components come from `erxes-ui` and `ui-modules` only. Do not import from another plugin ([`../../rules/20-architecture-boundaries.md`](../../rules/20-architecture-boundaries.md)).
2. **`Main.tsx`** — add a `<Route path="<new-segment>" element={<LazyNewPage />} />`. Use `lazy(() => import(...))` so the page chunks separately. Wrap the `<Routes>` in `Suspense` (already done — just add the route).
3. **Navigation** — `ToursSubNavigation.tsx` (sub-nav under tourism group) or `MainNavigation.tsx` (top-level). Use `<Link to="/tourism/<new-segment>">` and a Tabler icon.
4. **Data** — if the page needs tours/pipelines, mirror an existing query in `graphql/queries/ToursQueries.ts` (see [`./add-tourism-graphql-query.md`](./add-tourism-graphql-query.md)).
5. **State** — local UI with `useState`; cross-component with a Jotai atom under `src/modules/tours/states/` (the dir already has `toursBoardState`, `toursViewState`, etc.). No new state library.
6. **Forms** — React Hook Form + Zod, schema under `src/modules/tours/schemas/`. See `boardFormSchema.ts` and the existing pattern in `cards/components/AddCardForm.tsx`.
7. Run `.agents/evals/run.sh tourism`. Exit 0.

If host-exposed, restart `tourism_ui` so Rspack rebuilds `mf-manifest.json` (see [`../../docs/tourism/module-federation.md`](../../docs/tourism/module-federation.md) "Verifying").

## Phase 6 — VERIFY

Add to `.agents/plugins/tourism/tests/tours.spec.ts`:

- a test that `page.goto('/tourism/<new-segment>')` and asserts the unique heading/breadcrumb is visible
- a test that asserts the nav link is reachable from `/tourism/tours` (click it, expect the URL change)
- if the page renders data, a test that the data area renders (or a `test.skip` with the seeding-required reason — see the existing skips in `tours.spec.ts` lines 80–88)

Run: `cd .agents && pnpm test plugins/tourism/tests/tours.spec.ts`

## Pitfalls (specific to this skill)

- **Don't add to `shared:`** in `module-federation.config.ts`. Singletons are reserved for libraries already host-shared. Adding a new one silently breaks every other plugin that doesn't share the same version. See [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `module-federation.config.ts`".
- A new exposed page MUST be lazy-loaded by the consumer. Static imports in the host bloat the initial bundle.
- Routes must live inside the existing `<Routes>` in `Main.tsx` if the page is under `/tourism/*`. Adding a sibling `<Routes>` at the page level causes React Router to mount/unmount incorrectly.
- Do not import a UI component from `frontend/plugins/operation_ui/` etc. Cross-plugin UI is illegal here — if you need a component from another plugin, promote it to `frontend/libs/ui-modules/` first.
- The page is multi-tenant transparently — `Apollo Client` already injects subdomain via the gateway. You almost never write subdomain code in the UI ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md) "if you're writing code that does NOT touch models").

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `console.log` left in the page
- [ ] No `as any` casts to silence Apollo types
- [ ] No defensive `tour?.name ?? ''` where the type already guarantees `string`
- [ ] No new shared deps in `module-federation.config.ts`
- [ ] No commented-out section ("might use this later")
- [ ] `Suspense` boundary wraps every `lazy()` import

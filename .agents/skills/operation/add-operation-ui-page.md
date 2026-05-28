# add operation ui page

> **When to use:** the wish adds a new navigable page inside `operation_ui` — e.g., `/operation/dashboard`, `/operation/analytics`, `/operation/closed-tasks`. Not for tweaking an existing page (`/operation/tasks`) and not for a widget injected into someone else's surface.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters in `frontend/plugins/operation_ui/`:

| Sister page | File | Why |
|---|---|---|
| `OperationIndexPage` | `src/pages/OperationIndexPage.tsx` | the main `/operation` / `/operation/tasks` page — canonical layout with `PageHeader`, `PageContainer`, `Breadcrumb` |
| `OperationSettingsIndexPage` | `src/pages/OperationSettingsIndexPage.tsx` | settings-area page (exposed under a separate federation key) |
| `PosIndexPage` | `src/pages/PosIndexPage.tsx` | sibling top-level page in the same federation surface |

**Read these files in full** before writing any code:

- `frontend/plugins/operation_ui/src/pages/OperationIndexPage.tsx` — canonical page shape: `Breadcrumb`, `PageHeader`, `PageContainer`, `PageSubHeader`
- `frontend/plugins/operation_ui/src/modules/tasks/Main.tsx` — how routes inside the tasks module are declared (`<Route path="tasks" element={<TasksMain />} />`)
- `frontend/plugins/operation_ui/src/config.tsx` — `modules[]`, `path`, exposed navigation entries
- `frontend/plugins/operation_ui/module-federation.config.ts` — `exposes` map; how pages become host-mountable
- `frontend/plugins/operation_ui/src/MainNavigation.tsx`, `src/OperationSubNavigation.tsx` — where the new page's nav link lives
- [`../../docs/operation/module-federation.md`](../../docs/operation/module-federation.md) — host/remote conventions and shared-library rules

If the page lives inside `operation` (e.g., `/operation/dashboard`), mirror `Main.tsx` routing. If it's a new top-level path the host should mount (e.g., `/operation-reports`), you must extend `module-federation.config.ts` `exposes` and update `config.tsx` `modules[]`.

## Phase 4 — PLAN

Default plan for an in-`/operation/*` sub-page (e.g., `/operation/dashboard`):

1. **create the page component** — files: `frontend/plugins/operation_ui/src/pages/<NewPage>.tsx`
2. **add the route** — files: `frontend/plugins/operation_ui/src/modules/tasks/Main.tsx`
3. **add a nav entry** — files: `frontend/plugins/operation_ui/src/OperationSubNavigation.tsx` or `src/MainNavigation.tsx`
4. **(if the page needs data) add GraphQL queries + hook** — files: `src/modules/tasks/graphql/queries/...Queries.ts`, hook under `cards/hooks/` or a new directory if the page introduces a new entity surface
5. **playwright spec navigates to the new route** — files: `.agents/plugins/operation/tests/tasks.spec.ts`

If the page is host-exposed (rare), add one more commit:

6. **expose page in module-federation.config.ts + register in config.tsx** — files: `frontend/plugins/operation_ui/module-federation.config.ts`, `frontend/plugins/operation_ui/src/config.tsx`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`<NewPage>.tsx`** — start from `OperationIndexPage.tsx`. Keep the same shell: `Breadcrumb`, `PageHeader`, `PageContainer`. Components come from `erxes-ui` and `ui-modules` only. Do not import from another plugin ([`../../rules/20-architecture-boundaries.md`](../../rules/20-architecture-boundaries.md)).
2. **`Main.tsx`** — add a `<Route path="<new-segment>" element={<LazyNewPage />} />`. Use `lazy(() => import(...))` so the page chunks separately. Wrap the `<Routes>` in `Suspense` (already done — just add the route).
3. **Navigation** — `OperationSubNavigation.tsx` (sub-nav under operation group) or `MainNavigation.tsx` (top-level). Use `<Link to="/operation/<new-segment>">` and a Tabler icon.
4. **Data** — if the page needs tasks/pipelines, mirror an existing query in `graphql/queries/TasksQueries.ts` (see [`./add-operation-graphql-query.md`](./add-operation-graphql-query.md)).
5. **State** — local UI with `useState`; cross-component with a Jotai atom under `src/modules/tasks/states/` (the dir already has `tasksBoardState`, `tasksViewState`, etc.). No new state library.
6. **Forms** — React Hook Form + Zod, schema under `src/modules/tasks/schemas/`. See `boardFormSchema.ts` and the existing pattern in `cards/components/AddCardForm.tsx`.
7. Run `.agents/evals/run.sh operation`. Exit 0.

If host-exposed, restart `operation_ui` so Rspack rebuilds `mf-manifest.json` (see [`../../docs/operation/module-federation.md`](../../docs/operation/module-federation.md) "Verifying").

## Phase 6 — VERIFY

Add to `.agents/plugins/operation/tests/tasks.spec.ts`:

- a test that `page.goto('/operation/<new-segment>')` and asserts the unique heading/breadcrumb is visible
- a test that asserts the nav link is reachable from `/operation/tasks` (click it, expect the URL change)
- if the page renders data, a test that the data area renders (or a `test.skip` with the seeding-required reason — see the existing skips in `tasks.spec.ts` lines 80–88)

Run: `cd .agents && pnpm test plugins/operation/tests/tasks.spec.ts`

## Pitfalls (specific to this skill)

- **Don't add to `shared:`** in `module-federation.config.ts`. Singletons are reserved for libraries already host-shared. Adding a new one silently breaks every other plugin that doesn't share the same version. See [`../../rules/40-safety.md`](../../rules/40-safety.md) "Touching `module-federation.config.ts`".
- A new exposed page MUST be lazy-loaded by the consumer. Static imports in the host bloat the initial bundle.
- Routes must live inside the existing `<Routes>` in `Main.tsx` if the page is under `/operation/*`. Adding a sibling `<Routes>` at the page level causes React Router to mount/unmount incorrectly.
- Do not import a UI component from `frontend/plugins/operation_ui/` etc. Cross-plugin UI is illegal here — if you need a component from another plugin, promote it to `frontend/libs/ui-modules/` first.
- The page is multi-tenant transparently — `Apollo Client` already injects subdomain via the gateway. You almost never write subdomain code in the UI ([`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md) "if you're writing code that does NOT touch models").

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `console.log` left in the page
- [ ] No `as any` casts to silence Apollo types
- [ ] No defensive `task?.name ?? ''` where the type already guarantees `string`
- [ ] No new shared deps in `module-federation.config.ts`
- [ ] No commented-out section ("might use this later")
- [ ] `Suspense` boundary wraps every `lazy()` import

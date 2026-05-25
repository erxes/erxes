# add operation ui page

> **When to use:** the wish adds a new view, sub-page, or settings tab within `operation_ui` (e.g. a "Triage detail" page or a new tab under Tasks).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Router/Entry | Path |
|---|---|---|
| `/operation/tasks` | `OperationMain.tsx` | `frontend/plugins/operation_ui/src/pages/TasksPage.tsx` |
| `/operation/projects` | `OperationMain.tsx` | `frontend/plugins/operation_ui/src/pages/ProjectsPage.tsx` |

**Read these files in full** before writing any code:

- `frontend/plugins/operation_ui/src/modules/OperationMain.tsx` — the main routes switcher.
- `frontend/plugins/operation_ui/src/modules/navigation/MainNavigation.tsx` — navigation menu item registrations.
- `frontend/plugins/operation_ui/src/pages/TasksPage.tsx` — a typical page component utilizing PageContainer, PageHeader, PageSubHeader.

## Phase 4 — PLAN

1. **create page component** — files: `frontend/plugins/operation_ui/src/pages/<pageName>Page.tsx`
2. **register route** — files: `frontend/plugins/operation_ui/src/modules/OperationMain.tsx`
3. **register navigation link** — files: `frontend/plugins/operation_ui/src/modules/navigation/MainNavigation.tsx`
4. **playwright spec asserts navigation works** — files: `.agents/plugins/operation/tests/task.spec.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **Create the page component** utilizing common layout blocks from `erxes-ui` or `ui-modules`.
2. **`OperationMain.tsx`** — add a `<Route>` entry for your page.
3. **`MainNavigation.tsx`** — add a `<NavigationMenuLinkItem>` for your path.
4. Run `.agents/evals/run.sh operation`.
5. Add a Playwright test to verify routing.

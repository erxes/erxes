# add frontline ui page

> **When to use:** the wish adds a new view, sub-page, or settings tab within `frontline_ui` (e.g. a "Canned Responses Details" page or a new tab under Tickets).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Router/Entry | Path |
|---|---|---|
| `/frontline/tickets` | `FrontlineMain.tsx` | `frontend/plugins/frontline_ui/src/pages/TicketIndexPage.tsx` |
| `/frontline/forms` | `FrontlineMain.tsx` | `frontend/plugins/frontline_ui/src/pages/FormsPage.tsx` |

**Read these files in full** before writing any code:

- `frontend/plugins/frontline_ui/src/modules/FrontlineMain.tsx` — the main routes switcher.
- `frontend/plugins/frontline_ui/src/modules/FrontlineNavigation.tsx` — navigation menu item registrations.
- `frontend/plugins/frontline_ui/src/pages/TicketIndexPage.tsx` — a typical page component utilizing PageContainer, PageHeader, PageSubHeader.

## Phase 4 — PLAN

1. **create page component** — files: `frontend/plugins/frontline_ui/src/pages/<pageName>Page.tsx`
2. **register route** — files: `frontend/plugins/frontline_ui/src/modules/FrontlineMain.tsx`
3. **register navigation link** — files: `frontend/plugins/frontline_ui/src/modules/FrontlineNavigation.tsx`
4. **playwright spec asserts navigation works** — files: `.agents/plugins/frontline/tests/ticket.spec.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **Create the page component** utilizing common layout blocks from `erxes-ui` or `ui-modules`.
2. **`FrontlineMain.tsx`** — add a `<Route>` entry for your page.
3. **`FrontlineNavigation.tsx`** — add a `<NavigationMenuLinkItem>` for your path.
4. Run `.agents/evals/run.sh frontline`.
5. Add a Playwright test to verify routing.

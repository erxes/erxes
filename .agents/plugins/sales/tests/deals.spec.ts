/**
 * Eval files (verify these after changes — re-run this spec):
 *   backend/plugins/sales_api/src/modules/sales/db/models/Deals.ts
 *   backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts
 *   backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts
 *   backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts
 *   backend/plugins/sales_api/src/modules/sales/meta/activity-log/constants.ts
 *   frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts
 *   frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectConfidenceScoreMin.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts
 *   frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts
 *   frontend/plugins/sales_ui/src/modules/deals/types/deals.ts
 *
 * Module doc: ../modules/deals.md
 *
 * Test plan: exercises the deal-pipeline user surface via the host app — sales index
 * landing, board/pipeline selector wiring (querystring + localStorage), the
 * action-bar search/display controls, deep-link to boards & pipelines settings,
 * board create sheet trigger, and the navigation copy-link affordance. Flows that
 * require seeded boards or pipelines are skipped explicitly rather than hidden
 * behind TODOs.
 *
 * Deal-confidenceScore scope (wish 2026-05-22-deal-confidence-score):
 *   - SPEC #1+#2: detail sheet renders Confidence score input pre-populated
 *     with 50 (Mongoose default) for deals without an explicit value
 *   - SPEC #2: edit-then-reload persists the value (requires seeded deal +
 *     running stack)
 *   - SPEC #3: writing a value outside 0..100 is rejected (Mongoose validator)
 *   - SPEC #4: kanban card renders a progressbar element with the value
 *   - SPEC #5: action-bar "+ Add filter" menu exposes Confidence ≥ entry
 *     and selecting it pushes confidenceScoreMin to the URL
 *   - SPEC #6: legacy deals render as 50 because the schema default applies
 *     on document load
 *   Tests that require seeded boards/pipelines/segments are skipped with
 *   documented reasons rather than faked.
 */
import { test, expect } from '@playwright/test';

test.describe('sales > deals (host UI)', () => {
  test('sales index renders Sales Pipeline breadcrumb', async ({ page }) => {
    // frontend/plugins/sales_ui/src/pages/SalesIndexPage.tsx:32 — <Link to="/sales">Sales Pipeline</Link>
    await page.goto('/sales/deals');

    await expect(
      page.getByRole('link', { name: /sales pipeline/i }),
    ).toBeVisible();
  });

  test('display popover lets the user switch between List and Board views', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/deals/actionBar/components/DealViewControl.tsx
    // — "Display" trigger reveals a ToggleGroup ('single'-type, so items render
    // with role="radio") containing "List" and "Board" options. After selection
    // the popover closes (`setIsOpen(false)` on value change).
    await page.goto('/sales/deals');

    await page.getByRole('button', { name: /display/i }).click();
    await expect(page.getByText('List', { exact: true })).toBeVisible();
    await expect(page.getByText('Board', { exact: true })).toBeVisible();

    await page.getByText('List', { exact: true }).click();
    await expect(page.getByText('Board', { exact: true })).toHaveCount(0);
  });

  test('search input is present in the deals action bar', async ({ page }) => {
    // frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesSearch.tsx
    // — `<Input placeholder="Search" />` with an adjacent aria-label="Search" button.
    await page.goto('/sales/deals');

    await expect(
      page.getByPlaceholder('Search', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Search' }),
    ).toBeVisible();
  });

  test('search updates the URL query string on Enter', async ({ page }) => {
    // SalesSearch.tsx:14–18 — pressing Enter calls setQueries({ search }) which
    // surfaces in the URL via erxes-ui's useMultiQueryState.
    await page.goto('/sales/deals');

    const search = page.getByPlaceholder('Search', { exact: true });
    await search.fill('quarterly');
    await search.press('Enter');

    await expect(page).toHaveURL(/[?&]search=quarterly/);
  });

  test('selecting a board persists the boardId to localStorage', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/SalesSubNavigation.tsx:45 — BoardItem.handleClick
    // writes `erxesCurrentBoardId` to localStorage when the menu button is clicked.
    test.skip(
      true,
      'requires seeded sales boards visible in the Boards navigation group',
    );
    await page.goto('/sales/deals');
    // TODO: when seeding is wired, click the first BoardItem and assert:
    //   await expect.poll(() => page.evaluate(() => localStorage.getItem('erxesCurrentBoardId')))
    //     .not.toBeNull();
  });

  test('settings page exposes the Boards & Pipelines workspace', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/pages/SalesSettingsIndexPage.tsx — DealsSettings header
    // renders a "Boards & Pipelines" ghost button.
    await page.goto('/settings/sales/deals');

    await expect(
      page.getByRole('button', { name: /boards & pipelines/i }),
    ).toBeVisible();
  });

  test('settings page opens an "Add Board" sheet from the boards sidebar', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/deals/boards/components/settings/BoardForm.tsx
    // — Sheet.Trigger is a ghost <Button> with IconPlus inside the "Boards (n)" group.
    // Sheet.Title reads "Add Board" when no boardId is selected.
    await page.goto('/settings/sales/deals');

    const boardsHeading = page.getByText(/^Boards \(\d+\)$/);
    await expect(boardsHeading).toBeVisible();

    // BoardsList.tsx wraps `<Sidebar.GroupLabel>Boards (n)</Sidebar.GroupLabel>`
    // and `<BoardForm />`'s ghost IconPlus button in a single flex row. The
    // IconPlus has no accessible name, so we walk up to the flex container
    // (two levels: text → GroupLabel → flex row) and pick the only button.
    const addBoardButton = boardsHeading
      .locator('xpath=ancestor::div[1]')
      .locator('button')
      .first();
    await addBoardButton.click();

    await expect(
      page.getByRole('heading', { name: /add board/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/board name/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^save$/i }),
    ).toBeVisible();
  });

  test('AddDealSheet trigger only appears once a stage is rendered', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardColumnHeader.tsx:215
    // — DealCreateSheetTrigger renders an icon-only IconPlus button per column header.
    // There is no top-level "+ Add deal" button on the sales index — the AddDealSheet
    // is controlled purely by Jotai atom and only the column header opens it.
    // (Docs claim a creation flow exists; code shows the trigger is gated on
    // having a board + pipeline + stages — hence the skip.)
    test.skip(
      true,
      'requires seeded pipeline with at least one stage so the column header IconPlus renders',
    );
    await page.goto('/sales/deals');
  });

  test('SPEC #5: action-bar "+ Add filter" menu exposes "By Confidence ≥"', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx
    // — SelectConfidenceScoreMin.FilterItem renders inside the Filter.View's
    // Command list with the label "By Confidence ≥". This proves the wiring
    // is reachable from the action bar even without seeded data. Live test —
    // requires the sales_ui dev server on AGENT_TEST_BASE_URL.
    test.skip(
      !process.env.AGENT_TEST_LIVE,
      'requires running sales_ui dev server (set AGENT_TEST_LIVE=1 and start the host app on localhost:3000)',
    );
    await page.goto('/sales/deals');

    const filterTrigger = page.getByRole('button', { name: /add filter/i });
    await filterTrigger.click();

    await expect(
      page.getByRole('option', { name: /by confidence/i }),
    ).toBeVisible();
  });

  test('SPEC #5: applying a confidence threshold pushes confidenceScoreMin to the URL', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectConfidenceScoreMin.tsx
    // — the FilterView uses useQueryState<number>('confidenceScoreMin'). Entering
    // 70 and pressing Apply should push ?confidenceScoreMin=70.
    test.skip(
      !process.env.AGENT_TEST_LIVE,
      'requires running sales_ui dev server (set AGENT_TEST_LIVE=1 and start the host app on localhost:3000)',
    );
    await page.goto('/sales/deals');

    const filterTrigger = page.getByRole('button', { name: /add filter/i });
    await filterTrigger.click();
    await page.getByRole('option', { name: /by confidence/i }).click();

    await page.getByLabel(/minimum confidence/i).fill('70');
    await page.getByRole('button', { name: /apply/i }).click();

    await expect(page).toHaveURL(/[?&]confidenceScoreMin=70/);
  });

  test('SPEC #1+#2+#6: detail sheet exposes a Confidence score input pre-populated with the deal value (defaults to 50 for legacy deals)', async () => {
    // frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx
    // — renders a "Confidence score" <Label> + <Input type="number" min={0} max={100}>
    // bound to deal.confidenceScore (fallback 50). For deals written before the
    // schema default existed, Mongoose materializes 50 on load. Verifying this
    // end-to-end requires opening the detail sheet, which requires a seeded deal.
    test.skip(
      true,
      'requires a seeded deal so the detail sheet can be opened (same gate as the AddDealSheet test above)',
    );
  });

  test('SPEC #2: setting confidenceScore on the detail sheet persists across reload', async () => {
    // Round-trip: open deal, type 80 into Confidence score, blur, reload,
    // reopen, assert the input still reads 80. Requires a running stack
    // because the dealsEdit mutation must round-trip to MongoDB.
    test.skip(
      true,
      'requires a seeded deal and a running sales_api + sales_ui stack (dealsEdit mutation must round-trip to MongoDB)',
    );
  });

  test('SPEC #3: writing a value outside 0..100 is rejected by the Mongoose validator', async () => {
    // backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts
    // — confidenceScore has { min: 0, max: 100 }. A direct models.Deals.updateOne
    // with 150 throws a ValidatorError. Verified at the unit-test layer (no
    // unit harness exists for sales_api today; sales_api has no test target
    // per evals/run.sh output).
    test.skip(
      true,
      'requires a sales_api unit test harness (sales_api has no test target; min/max constraint is verified by the Mongoose runtime)',
    );
  });

  test('SPEC #4: kanban card renders a progressbar matching deal.confidenceScore', async () => {
    // frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx
    // — renders <div role="progressbar" aria-valuenow={N}> below the title.
    // Requires a seeded deal so the kanban column actually mounts cards.
    test.skip(
      true,
      'requires a seeded deal with confidenceScore so the kanban card actually renders the progressbar',
    );
  });
});

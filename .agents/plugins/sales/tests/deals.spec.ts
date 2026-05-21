/**
 * Eval files (verify these after changes — re-run this spec):
 *   backend/plugins/sales_api/src/modules/sales/db/models/Deals.ts
 *   backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts
 *   backend/plugins/sales_api/src/modules/sales/graphql/resolvers/mutations/deals.ts
 *   backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts
 *   backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts
 *   backend/plugins/sales_api/src/modules/sales/graphql/schemas/extensions.ts
 *   backend/plugins/sales_api/src/modules/sales/meta/segments/segmentConfigs.ts
 *   frontend/plugins/sales_ui/src/modules/deals/Main.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/actionBar/constants/Filters.ts
 *   frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/boards/hooks/useBoardDetails.ts
 *   frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/cards/hooks/useDeals.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/RiskLevelInline.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealRiskLevel.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectRiskLevel.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/constants/riskLevel.ts
 *   backend/plugins/sales_api/src/main.ts:71–129
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
 * Deal-risk-level scope (wish 2026-05-22-deal-risk-level):
 *   - SPEC #1: setting riskLevel on the detail sheet persists across reload
 *   - SPEC #2: default 'low' applies to deals created before the field existed
 *   - SPEC #3: kanban card renders a colored badge matching the level
 *   - SPEC #4: action-bar "Risk level" filter narrows the deal list
 *   - SPEC #5: riskLevel appears in the segment-builder field picker
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

  test('SPEC #4: action-bar "+ Add filter" menu exposes Risk level', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx
    // — SelectRiskLevel.FilterItem renders inside the Filter.View's Command list
    // with the label "By Risk level". This proves SPEC #4 wiring is reachable
    // from the action bar even without seeded data. Live test — requires the
    // sales_ui dev server on AGENT_TEST_BASE_URL (default localhost:3000).
    test.skip(
      !process.env.AGENT_TEST_LIVE,
      'requires running sales_ui dev server (set AGENT_TEST_LIVE=1 and start the host app on localhost:3000)',
    );
    await page.goto('/sales/deals');

    const filterTrigger = page.getByRole('button', { name: /add filter/i });
    await filterTrigger.click();

    await expect(
      page.getByRole('option', { name: /by risk level/i }),
    ).toBeVisible();
  });

  test('SPEC #4: choosing a riskLevel reflects in the URL query', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectRiskLevel.tsx
    // — SelectRiskLevelFilterView uses useQueryState<TRiskLevel[]>('riskLevel'),
    // so picking a value should push ?riskLevel=high to the URL the same way
    // the priority filter does today. Same live-stack gate as the menu test above.
    test.skip(
      !process.env.AGENT_TEST_LIVE,
      'requires running sales_ui dev server (set AGENT_TEST_LIVE=1 and start the host app on localhost:3000)',
    );
    await page.goto('/sales/deals');

    const filterTrigger = page.getByRole('button', { name: /add filter/i });
    await filterTrigger.click();
    await page.getByRole('option', { name: /by risk level/i }).click();

    await page.getByRole('option', { name: /^high$/i }).click();

    await expect(page).toHaveURL(/[?&]riskLevel=.*high/);
  });

  test('SPEC #1: detail sheet exposes a Risk level row when a deal is open', async () => {
    // frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx
    // renders a "Risk level" <Label> + <SelectDealRiskLevel> directly below the
    // Priority row. Verifying this end-to-end requires opening a deal detail
    // sheet, which in turn requires a seeded deal (boards/pipelines/stages).
    test.skip(
      true,
      'requires a seeded deal so the detail sheet can be opened (same gate as the AddDealSheet test above)',
    );
  });

  test('SPEC #1+#2: setting riskLevel on the detail sheet persists across reload', async () => {
    // Round-trip test: open deal, pick "high" in the SelectDealRiskLevel
    // dropdown, reload the page, reopen the deal, assert "high" is still
    // selected. Also covers SPEC #2 because a freshly seeded deal has no
    // riskLevel and the picker should render the 'low' default.
    test.skip(
      true,
      'requires a seeded deal and a running sales_api + sales_ui stack (dealsEdit mutation must round-trip to MongoDB)',
    );
  });

  test('SPEC #3: kanban card renders a colored badge matching the deal riskLevel', async () => {
    // frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx
    // — <RiskLevelBadge level={riskLevel} /> sits next to the priority chip.
    // The badge sets data-risk-level="low|medium|high" and the Badge variant
    // maps to success/warning/destructive (green/amber/red).
    test.skip(
      true,
      'requires a seeded deal with riskLevel set so the kanban card actually renders the badge',
    );
  });

  test('SPEC #5: segment builder lists riskLevel as a filterable Deal field', async () => {
    // backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts
    // — riskLevel path has esType: 'keyword', which makes generateSalesFields
    // surface it in the segment builder's field picker for content type
    // sales:deal. End-to-end check needs the segments service + a running ES.
    test.skip(
      true,
      'requires a running segments service with the sales:deal content type registered and an ES index',
    );
  });
});

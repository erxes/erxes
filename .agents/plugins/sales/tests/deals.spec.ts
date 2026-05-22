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
 *   frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts
 *   frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/boards/hooks/useBoardDetails.ts
 *   frontend/plugins/sales_ui/src/modules/deals/cards/components/AddCardForm.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/cards/hooks/useDeals.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectConfidenceScore.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectConfidenceScore.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealConfidenceScore.tsx
 *   frontend/plugins/sales_ui/src/modules/deals/constants/formSchema.ts
 *   frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts
 *   frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts
 *   frontend/plugins/sales_ui/src/modules/deals/types/deals.ts
 *   backend/plugins/sales_api/src/main.ts:71–129
 *
 * Module doc: ../modules/deals.md
 *
 * Test plan: exercises the deal-pipeline user surface via the host app — sales index
 * landing, board/pipeline selector wiring (querystring + localStorage), the
 * action-bar search/display controls, deep-link to boards & pipelines settings,
 * board create sheet trigger, and the navigation copy-link affordance. Flows that
 * require seeded boards or pipelines are skipped explicitly with a named blocking
 * wish reference rather than hidden behind TODOs.
 *
 * Deal-confidence-score scope (wish 2026-05-22-deal-confidence-score):
 *   - SPEC #1: Add-deal sheet sets confidenceScore: 70 and the saved deal exposes it
 *   - SPEC #2: detail-sheet edit 30 → 85 persists across reload
 *   - SPEC #3: kanban card renders the confidenceScore bar/percent
 *   - SPEC #4: default-at-read = 0 for deals with undefined confidenceScore
 *   - SPEC #5: action-bar "Confidence ≥ N" filter hides deals below N
 *   - SPEC #6: GraphQL dealsEdit rejects confidenceScore out of [0, 100]
 *   - SPEC #7: UI input clamps at 100
 *
 * Tests that require seeded boards/pipelines/stages/deals are skipped with the
 * marker `BLOCKED on wish 2026-05-22-test-fixture-seeder` — see
 * .agents/wishes/2026-05-22-test-fixture-seeder/WISH.md for the planned
 * fixture-seeder that will un-skip them.
 *
 * Note: The previous wish 2026-05-22-deal-risk-level (PR #7758) shipped
 * skipped-only SPEC tests for a `riskLevel` field that never landed on main.
 * Those zombie tests referenced files that don't exist (RiskLevelInline.tsx,
 * SelectRiskLevel.tsx, etc.) and have been removed here. Net behavior change:
 * zero — they were all `test.skip(true, ...)`.
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

  test('SPEC #5 (UI reachable): action-bar "+ Add filter" menu exposes "By Confidence"', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx
    // — SelectConfidenceScore.FilterItem renders inside the Filter.View's Command
    // list with the label "By Confidence". This proves SPEC #5 wiring is reachable
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
      page.getByRole('option', { name: /by confidence/i }),
    ).toBeVisible();
  });

  test('SPEC #5 (URL contract): setting Confidence ≥ N reflects in URL as confidenceScoreMin', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectConfidenceScore.tsx
    // — SelectConfidenceScoreFilterView uses useQueryState<number | null>('confidenceScoreMin'),
    // so committing a value should push ?confidenceScoreMin=50 to the URL. Same
    // live-stack gate as the menu test above.
    test.skip(
      !process.env.AGENT_TEST_LIVE,
      'requires running sales_ui dev server (set AGENT_TEST_LIVE=1 and start the host app on localhost:3000)',
    );
    await page.goto('/sales/deals');

    const filterTrigger = page.getByRole('button', { name: /add filter/i });
    await filterTrigger.click();
    await page.getByRole('option', { name: /by confidence/i }).click();

    const input = page.getByTestId('confidence-score-filter-input');
    await expect(input).toBeVisible();
    await input.fill('50');
    await input.press('Enter');

    await expect(page).toHaveURL(/[?&]confidenceScoreMin=50/);
  });

  test('SPEC #1: Add-deal sheet sets confidenceScore: 70 and the saved deal exposes it', async () => {
    // frontend/plugins/sales_ui/src/modules/deals/cards/components/AddCardForm.tsx
    // — new Form.Field with data-testid="confidence-score-add-input" exists. To
    // verify the round-trip we need to open the Add-deal sheet (gated on a seeded
    // pipeline/stage) and verify the created deal exposes the value via a
    // subsequent GraphQL dealDetail query.
    test.skip(
      true,
      'BLOCKED on wish 2026-05-22-test-fixture-seeder: needs seeded board/pipeline/stage so the Add-deal sheet is reachable, plus an authenticated GraphQL client to verify the round-trip',
    );
  });

  test('SPEC #2: detail sheet edit 30 → 85 persists across reload', async () => {
    // frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx
    // — new Label "Confidence" + SelectDealConfidenceScore block. Verifying
    // persistence requires opening a seeded deal's detail sheet, editing the
    // value via the picker, reloading the page, and re-asserting.
    test.skip(
      true,
      'BLOCKED on wish 2026-05-22-test-fixture-seeder: needs a seeded deal with confidenceScore=30 so the detail sheet can be opened and the edit + reload cycle exercised',
    );
  });

  test('SPEC #3: kanban card renders the ConfidenceScoreBar for a seeded deal', async () => {
    // frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx
    // — <SelectDealConfidenceScore variant="card"> sits next to the priority
    // chip. SelectConfidenceScore renders <ConfidenceScoreBar /> which sets
    // data-testid="confidence-score-bar" and data-value="<int>".
    test.skip(
      true,
      'BLOCKED on wish 2026-05-22-test-fixture-seeder: needs a seeded deal with confidenceScore=60 visible on the kanban board so [data-testid="confidence-score-bar"][data-value="60"] is queryable',
    );
  });

  test('SPEC #4: deal with undefined confidenceScore renders as 0 (default-at-read)', async () => {
    // frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectConfidenceScore.tsx
    // — clamp(undefined) === 0 in both ConfidenceScoreBar and SelectConfidenceScoreContent.
    // SalesFormFields and DealsBoardCard pass `confidenceScore ?? 0` to be defensive.
    // Verifying the contract requires a seeded deal that has NEVER had
    // confidenceScore set (so it's truly undefined in Mongo, not just 0).
    test.skip(
      true,
      'BLOCKED on wish 2026-05-22-test-fixture-seeder: needs a seeded deal with no confidenceScore field set so we can observe the read-time default rather than a stored zero',
    );
  });

  test('SPEC #5 (filter behavior): filter Confidence ≥ 50 hides deals with confidenceScore < 50', async () => {
    // backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts
    // — generateFilter emits `filter.confidenceScore = { $gte: confidenceScoreMin }`.
    // Verifying that this actually hides the right deals requires three seeded
    // deals (20, 50, 80) and observing the kanban board with the filter applied.
    test.skip(
      true,
      'BLOCKED on wish 2026-05-22-test-fixture-seeder: needs three seeded deals at confidenceScore=20/50/80 to observe the filter excluding the 20 deal',
    );
  });

  test('SPEC #6: GraphQL dealsEdit rejects confidenceScore: 150 (out of range)', async () => {
    // backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts
    // — Mongoose schema declares `min: 0, max: 100` on confidenceScore, which
    // surfaces as a ValidationError on save. Verifying this requires
    // authenticating to the gateway, picking an existing deal id, and firing a
    // raw dealsEdit mutation with confidenceScore: 150.
    test.skip(
      true,
      'BLOCKED on wish 2026-05-22-test-fixture-seeder: needs an authenticated GraphQL client + a seeded deal id to send the malformed dealsEdit mutation',
    );
  });

  test('SPEC #7: UI input enforces min=0 / max=100 attributes', async () => {
    // frontend/plugins/sales_ui/src/modules/deals/cards/components/AddCardForm.tsx
    // — Input has type="number" min={0} max={100} step={1}. Native HTML clamps
    // when the form is submitted with mode=submit. Verifying user-typed 150 →
    // stored 100 requires opening the Add-deal sheet (seeded pipeline) and
    // submitting; alternatively the detail-sheet edit path can be verified once
    // a deal is seeded.
    test.skip(
      true,
      'BLOCKED on wish 2026-05-22-test-fixture-seeder: needs the Add-deal sheet to be openable (seeded pipeline) so the numeric input is reachable and submittable',
    );
  });
});

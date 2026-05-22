/**
 * Eval files (verify these after changes — re-run this spec):
 *   backend/plugins/sales_api/src/modules/pos/db/models/Pos.ts
 *   backend/plugins/sales_api/src/modules/pos/graphql/resolvers/mutations/pos.ts
 *   backend/plugins/sales_api/src/modules/pos/graphql/resolvers/mutations/orders.ts
 *   backend/plugins/sales_api/src/modules/pos/routes.ts
 *   backend/plugins/sales_api/src/modules/pos/graphql/schemas/extendTypes.ts
 *   frontend/plugins/sales_ui/src/modules/pos/Main.tsx
 *   frontend/plugins/sales_ui/src/modules/pos/orders/hooks/useOrderInfo.ts
 *   frontend/plugins/sales_ui/src/modules/pos/hooks/useGetPos.ts
 *   frontend/plugins/sales_ui/src/modules/pos/hooks/usePayments.ts
 *   frontend/plugins/sales_ui/src/modules/pos/hooks/useCategories.ts
 *   frontend/plugins/sales_ui/src/modules/pos/hooks/usePosSlots.ts
 *   frontend/plugins/sales_ui/src/modules/pos/hooks/useProductGroups.ts
 *   frontend/plugins/sales_ui/src/modules/pos/hooks/useSalesStages.ts
 *
 * Module doc: ../modules/pos.md
 *
 * Test plan: exercises the POS shell in the host app — the POS index landing
 * with breadcrumb + "Go to settings" link, the POS settings list with
 * "Create POS" affordance and PosCreate sheet validation (name >= 2 chars
 * before Submit enables), and the auto-redirect from /sales/pos to the first
 * POS's orders page when one exists.
 */
import { test, expect } from '@playwright/test';

test.describe('sales > pos (host UI)', () => {
  test('POS index renders breadcrumb and Go to settings link', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/pages/PosIndexPage.tsx:27,40 — Breadcrumb
    // text is lowercase "pos" and the right-side <Button> wraps a Link to
    // "/settings/sales/pos".
    await page.goto('/sales/pos');

    await expect(page.getByRole('link', { name: /^pos$/i })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /go to settings/i }),
    ).toBeVisible();
  });

  test('Go to settings link points at /settings/sales/pos', async ({ page }) => {
    // Confirms the href of the link rendered by PosIndexPage.tsx:40-44
    await page.goto('/sales/pos');

    const link = page.getByRole('link', { name: /go to settings/i });
    await expect(link).toHaveAttribute('href', /\/settings\/sales\/pos$/);
  });

  test('POS settings page exposes a Create POS button', async ({ page }) => {
    // frontend/plugins/sales_ui/src/pages/PosSettingsPage.tsx:24 — Create POS button.
    await page.goto('/settings/sales/pos');

    await expect(
      page.getByRole('button', { name: /create pos/i }),
    ).toBeVisible();
  });

  test('Create POS sheet opens with Name + Description fields and disabled submit', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/pos/components/pos-create/PosCreate.tsx
    // — Sheet.Title "Create POS", Name input (required, min 2), Description textarea,
    // submit button reads "Create POS" and is disabled until Name length >= 2.
    await page.goto('/settings/sales/pos');
    await page.getByRole('button', { name: /create pos/i }).first().click();

    await expect(
      page.getByRole('heading', { name: /create pos/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/^name/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();

    // Two "Create POS" elements live on the page once the sheet is open:
    // the page-level header trigger and the submit button inside the sheet.
    // The submit is the only one rendered as type="submit".
    const submit = page.locator('button[type="submit"]');
    await expect(submit).toBeDisabled();

    await page.getByLabel(/^name/i).fill('Front counter');
    await expect(submit).toBeEnabled();
  });

  test('Create POS sheet can be cancelled', async ({ page }) => {
    // PosCreate.tsx:264 — Cancel button calls handleCancel -> onOpenChange(false).
    await page.goto('/settings/sales/pos');
    await page.getByRole('button', { name: /create pos/i }).first().click();

    await expect(
      page.getByRole('heading', { name: /create pos/i }),
    ).toBeVisible();

    await page.getByRole('button', { name: /^cancel$/i }).click();

    await expect(
      page.getByRole('heading', { name: /create pos/i }),
    ).toHaveCount(0);
  });

  test('settings sidebar advertises both Deals and POS entries', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/modules/SalesSettingsNavigation.tsx —
    // surface link items named "Deals" and "POS" under the "Sales" group label.
    await page.goto('/settings/sales/pos');

    await expect(page.getByText('Sales', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /^deals$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^pos$/i })).toBeVisible();
  });

  test('POS index auto-redirects to first POS orders view when one exists', async ({
    page,
  }) => {
    // PosIndexPage.tsx:12-17 — useEffect navigates to `/sales/pos/{firstPos._id}/orders`
    // once usePosList finishes loading with at least one entry. Cannot verify
    // without seeded POS records.
    test.skip(true, 'requires seeded POS records via usePosList');
    await page.goto('/sales/pos');
    // TODO: await expect(page).toHaveURL(/\/sales\/pos\/[^/]+\/orders$/);
  });

  test('order detail side widget loads when navigating to a POS orders page', async ({
    page,
  }) => {
    // frontend/plugins/sales_ui/src/pages/OrdersPage.tsx + PosOrderSideWidget.tsx
    // — order detail widget only mounts once a posId param is present in the URL.
    test.skip(true, 'requires a known posId — no fixture is available');
    await page.goto('/sales/pos/_seeded_pos_id_/orders');
  });
});

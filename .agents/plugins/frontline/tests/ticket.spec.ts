/**
 * Eval files (verify these after changes — re-run this spec):
 *   backend/plugins/frontline_api/src/modules/ticket/db/models/Ticket.ts
 *   backend/plugins/frontline_api/src/modules/ticket/db/definitions/ticket.ts
 *   backend/plugins/frontline_api/src/modules/ticket/graphql/schemas/ticket.ts
 *   frontend/plugins/frontline_ui/src/pages/TicketIndexPage.tsx
 *   frontend/plugins/frontline_ui/src/modules/ticket/components/TicketsFilter.tsx
 *   frontend/plugins/frontline_ui/src/modules/ticket/hooks/useGetTickets.tsx
 *
 * Module doc: ../modules/ticket.md
 *
 * Test plan: exercises the ticket-pipeline user surface via the host app — frontline tickets
 * landing page, checking the breadcrumb, presence of filters, export/import trigger controls,
 * and view controls.
 */
import { test, expect } from '@playwright/test';

test.describe('frontline > tickets (host UI)', () => {
  test('tickets index renders Tickets breadcrumb', async ({ page }) => {
    // frontend/plugins/frontline_ui/src/pages/TicketIndexPage.tsx:31 — <Link to="/frontline/tickets">Tickets</Link>
    await page.goto('/frontline/tickets');

    await expect(
      page.getByRole('link', { name: /tickets/i }),
    ).toBeVisible();
  });

  test('export and import buttons are present on the subheader', async ({ page }) => {
    // TicketIndexPage.tsx:46-56 — <Import ... /> and <Export ... />
    await page.goto('/frontline/tickets');

    await expect(
      page.getByRole('button', { name: /import/i }),
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /export/i }),
    ).toBeVisible();
  });

  test('filter popover trigger is present', async ({ page }) => {
    // TicketsFilter.tsx — popover trigger button
    await page.goto('/frontline/tickets');

    await expect(
      page.getByRole('button', { name: /filter/i }),
    ).toBeVisible();
  });
});

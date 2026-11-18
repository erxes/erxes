import type { Page } from '@playwright/test';
import { expect, expectAccessible, test, unique } from './fixtures';

/** A word too long to break, as a long email or a hyphenated title is. */
const LONG = 'senior-accountant-financial-reporting-tax-returns-internal-control-budgets';

/** The record's side panel, beside the list. */
const panelOf = (page: Page) =>
  page.getByRole('complementary').filter({ has: page.getByRole('tab', { name: 'Detail' }) });

test("a long line in a record's panel doesn't widen its fields or their editors", async ({
  page,
  api,
}) => {
  const lastName = unique();

  const customer = await api.customers.create({
    firstName: 'Wide',
    lastName,
    primaryEmail: `${LONG}-${lastName}@example.test`,
  });

  await api.customers.update({ id: customer.id, position: LONG });
  await page.goto(`/contacts/customers?panel=/detail/core:customer/${customer.id}`);

  const panel = panelOf(page);

  await expect(panel.getByText(`Wide ${customer.lastName}`).first()).toBeVisible();

  const panelWidth = (await panel.boundingBox())?.width ?? 0;

  // The Code editor opens over its row, no wider than the panel the row is in.
  await panel.getByRole('button', { name: 'Code' }).click();

  const editor = page.getByRole('textbox', { name: 'Empty' });

  await expect(editor).toBeFocused();
  expect((await editor.boundingBox())?.width ?? Infinity).toBeLessThanOrEqual(panelWidth);
  await page.keyboard.press('Escape');

  // The row labels stay in view: the content isn't scrolled sideways past them.
  await expect(panel.getByText('Position', { exact: true })).toBeInViewport();
});

test("a customer's birth date opens straight to the calendar and saves the day picked", async ({
  page,
  api,
}) => {
  const customer = await api.customers.create({ firstName: 'Born', lastName: unique() });
  const today = new Date();
  const day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-15`;

  await page.goto(`/contacts/customers?panel=/detail/core:customer/${customer.id}`);

  const panel = panelOf(page);

  await panel.getByRole('button', { name: 'Birth date' }).click();
  // One click shows the typed date and the calendar, with no second field to open.
  await expect(page.getByRole('grid')).toBeVisible();
  await expect(page.getByPlaceholder('Pick a date')).toHaveCount(1);
  await expectAccessible(page);

  await page.locator(`[data-day="${day}"] button`).click();
  await expect(page.getByRole('grid')).toBeHidden();
  await expect.poll(async () => (await api.customers.get({ id: customer.id })).birthDate).toBe(day);
});

import { openAssistant } from './assistantPanel';
import { expect, test } from './fixtures';

test('the assistant floats below the page header, leaving the page its width and header buttons', async ({
  page,
}) => {
  await page.goto('/contacts/customers');

  const main = page.locator('#main-content');
  const header = main.locator('header').first();
  const add = page.getByRole('button', { name: /Add Customer/ });

  await expect(add).toBeVisible();
  const before = (await main.boundingBox())?.width;

  await page.getByRole('button', { name: 'Assistant', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'Assistant' });

  await expect(panel).toBeVisible();
  expect((await main.boundingBox())?.width).toBe(before);
  expect((await panel.boundingBox())?.y ?? 0).toBeGreaterThanOrEqual(
    ((await header.boundingBox())?.y ?? 0) + ((await header.boundingBox())?.height ?? 0),
  );
  await add.click({ trial: true });
});

test('back from the assistant page returns to the page it opened from, with the panel open', async ({
  page,
}) => {
  const panel = await openAssistant(page, '/contacts/customers');

  await panel.getByRole('button', { name: 'Open as a page' }).click();
  await expect(page).toHaveURL(/\/assistant$/);
  await expect(panel).toBeHidden();

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(/\/contacts\/customers$/);
  await expect(panel).toBeVisible();
});

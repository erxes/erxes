import { expect, test } from './fixtures';

// Settings › General's other currencies are found by code, as the main currency is, and Enter
// picks the first match instead of saving the form without it. Nothing is saved here: every spec
// shares the organisation (the API tests check that the list saves).

test('picks other currencies by code, by pointer or Enter', async ({ page }) => {
  const saves: string[] = [];

  page.on('request', (request) => {
    if (request.method() === 'PATCH' && request.url().includes('/core/v1/organization')) {
      saves.push(request.url());
    }
  });

  await page.goto('/settings/general');

  const field = page.getByRole('combobox', { name: 'Other currencies' });

  await field.click();
  await field.fill('eur');
  await page.getByRole('option', { name: 'EUR · Euro' }).click();
  await field.fill('jpy');
  await page.keyboard.press('Enter');

  const euro = page.getByRole('button', { name: 'Remove EUR · Euro' });

  await expect(euro).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove JPY · Japanese Yen' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeEnabled();
  expect(saves).toEqual([]);

  await page.getByRole('button', { name: 'Discard' }).click();
  await expect(euro).toBeHidden();
});

import { expect, expectAccessible, test, unique } from './fixtures';

test('the selected customers’ Actions and Merge open named, readable dialogs', async ({
  page,
  api,
}) => {
  const ada = `Ada ${unique()}`;
  const grace = `Grace ${unique()}`;

  await api.customers.create({ firstName: ada });
  await api.customers.create({ firstName: grace });

  await page.goto('/contacts/customers');

  for (const name of [ada, grace]) {
    await page
      .getByRole('row', { name: new RegExp(name, 'u') })
      .getByRole('checkbox')
      .check();
  }

  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Actions on the selected customers' }),
  ).toBeVisible();
  await expectAccessible(page);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: /^Merge/ }).click();
  await expect(page.getByRole('dialog', { name: 'Merge 2 customers' })).toBeVisible();
  await expectAccessible(page);
});

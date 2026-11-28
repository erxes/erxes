import { expect, expectAccessible, test, unique } from './fixtures';

test('a customer’s own page merges another customer, field by field', async ({ page, api }) => {
  const ada = `Ada ${unique()}`;
  const grace = `Grace ${unique()}`;

  const first = await api.customers.create({ firstName: ada, lastName: 'Lovelace' });
  const second = await api.customers.create({ firstName: grace, lastName: 'Hopper' });

  await page.goto(`/contacts/customers/${first.id}`);

  const header = page.getByRole('region', { name: 'Contact actions' });

  await expect(header.getByRole('button', { name: 'Merge' })).toBeVisible();
  await expect(header.getByRole('button', { name: 'Delete' })).toBeVisible();

  await header.getByRole('button', { name: 'Merge' }).click();

  const dialog = page.getByRole('dialog', { name: 'Merge 2 customers' });
  const mergeButton = dialog.getByRole('button', { name: 'Merge', exact: true });

  await expect(dialog).toBeVisible();
  await expect(mergeButton).toBeDisabled();

  await dialog.getByRole('button', { name: 'Merge with' }).click();
  await page.getByRole('option', { name: new RegExp(grace, 'u') }).click();

  // Keep Grace, but with Ada's last name.
  await dialog
    .getByRole('group', { name: 'The customer to keep' })
    .getByRole('radio', { name: new RegExp(grace, 'u') })
    .check({ force: true });
  await dialog
    .getByRole('group', { name: 'Last name' })
    .getByRole('radio', { name: 'Lovelace' })
    .check({ force: true });
  await expectAccessible(page);

  await mergeButton.click();

  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(new RegExp(`/contacts/customers/${second.id}$`, 'u'));
  expect(await api.customers.get({ id: second.id })).toMatchObject({
    firstName: grace,
    lastName: 'Lovelace',
  });
});

import { expect, expectAccessible, test, unique } from './fixtures';

test('a member creates a contact, edits it and adds a note', async ({ page, api }) => {
  const name = `Ada ${unique()}`;

  await page.goto('/contacts/customers');
  await expect(page.getByRole('columnheader', { name: 'NAME' })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: /^Add Customer/ }).click();
  await page.getByRole('textbox', { name: 'First name' }).fill(name);
  await page.getByRole('textbox', { name: 'Last name' }).fill('Lovelace');
  await page.getByRole('textbox', { name: 'Email' }).fill(`${name.replace(' ', '.')}@example.test`);
  await expectAccessible(page);
  await page.getByRole('button', { name: 'Create customer' }).click();

  let id = '';

  await expect
    .poll(async () => {
      id = (await api.customers.list({ search: name })).data[0]?.id ?? '';

      return id;
    })
    .not.toBe('');

  await page.goto(`/contacts/customers/${id}`);
  await expect(page.getByRole('heading', { name: `${name} Lovelace` })).toBeVisible();
  await expectAccessible(page);

  // Click a value to edit it; Enter saves, as in the list.
  await page.getByRole('button', { name: 'Position' }).click();
  await page.keyboard.type('Analyst');
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await api.customers.get({ id })).position).toBe('Analyst');

  await page.getByRole('tab', { name: 'Activity' }).click();
  await page.getByRole('textbox', { name: /^Write a note/ }).fill('Called about the engine');
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(page.getByText('Called about the engine')).toBeVisible();
  await expectAccessible(page);

  // Both survive a reload.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Analyst' })).toBeVisible();
  await page.getByRole('tab', { name: 'Activity' }).click();
  await expect(page.getByText('Called about the engine')).toBeVisible();
});

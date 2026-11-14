import { DESCRIPTION_MAX } from '@erxes/core-contract';
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
  // The form holds the description to the contract's limit before it sends anything.
  const description = page.getByRole('textbox', { name: 'Description' });

  await description.fill('word '.repeat(DESCRIPTION_MAX / 5));
  await page.getByRole('button', { name: 'Create customer' }).click();
  await expect(page.getByText('The description is too long')).toBeVisible();
  // Saved straight after typing: the editor hands over every edit at once.
  await description.fill('Met at the trade fair');
  await page.getByRole('button', { name: 'Create customer' }).click();

  let id = '';

  await expect
    .poll(async () => {
      id = (await api.customers.list({ search: name })).data[0]?.id ?? '';

      return id;
    })
    .not.toBe('');
  expect((await api.customers.get({ id })).description).toContain('Met at the trade fair');

  await page.goto(`/contacts/customers/${id}`);
  await expect(page.getByRole('heading', { name: `${name} Lovelace` })).toBeVisible();
  await expectAccessible(page);

  // Click a value to edit it; Enter saves, as in the list.
  await page.getByRole('button', { name: 'Position' }).click();
  await page.keyboard.type('Analyst');
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await api.customers.get({ id })).position).toBe('Analyst');

  // A description change reads as its text in the timeline, not as the editor's JSON.
  await page.getByRole('tab', { name: 'Description' }).click();
  await page.getByRole('tabpanel').getByRole('textbox').fill('Met at the fair twice');
  await page.getByRole('tab', { name: 'Activity' }).click();
  await expect(page.getByText('Met at the trade fair', { exact: true })).toBeVisible();

  const note = page.getByRole('textbox', { name: /^Write a note/ });

  await note.fill('Called about the engine');
  await page.getByRole('button', { name: 'Add note' }).click();
  // The box empties once the note is saved; until then its text is a second match.
  await expect(note).toHaveValue('');
  await expect(page.getByText('Called about the engine')).toBeVisible();
  await expectAccessible(page);

  // Both survive a reload.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Analyst' })).toBeVisible();
  await page.getByRole('tab', { name: 'Activity' }).click();
  await expect(page.getByText('Called about the engine')).toBeVisible();
});

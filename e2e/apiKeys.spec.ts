import { expect, expectAccessible, test, unique } from './fixtures';

test('an owner makes a read-only key and tries it', async ({ page }) => {
  const name = `Sync ${unique()}`;

  await page.goto('/settings/api-keys/new');
  await page.getByRole('textbox', { name: 'Name' }).fill(name);
  await page.getByRole('textbox', { name: 'Only from these addresses' }).fill('203.0.113.7');

  const sentence = page.getByTestId('key-sentence');

  await expect(sentence).toContainText('Reads contacts');
  await expect(sentence).toContainText('payments');
  await expect(sentence).toContainText('only from 203.0.113.7');

  await page.getByText('Only mine', { exact: true }).click();
  await expect(sentence).toContainText('only your own contacts');
  await expect(sentence).not.toContainText('payments');
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Create key' }).click();
  const shown = page.getByRole('dialog', { name: 'Your API key' });

  await expect(shown.getByRole('textbox')).toHaveValue(/^erxes_/);
  await shown.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('heading', { name: 'Try this key' })).toBeVisible();
  await expect(page.getByRole('radio', { name: /^Read only/ })).toBeChecked();

  await page.getByRole('button', { name: /Choose a call/ }).click();
  await page.keyboard.type('customers newest');
  await page.getByRole('option', { name: /Customers of the organisation/ }).click();

  const result = page.getByTestId('try-result');

  await page.getByRole('button', { name: 'Check' }).click();
  await expect(result).toContainText('Allowed');

  await page.getByRole('textbox', { name: 'From address (optional)' }).fill('10.0.0.5');
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(result).toContainText('Refused');
  await expect(result).toContainText('Decided by: Only from these addresses');
  await expectAccessible(page);

  await page.goto('/settings/api-keys');
  await expect(page.getByRole('link', { name: new RegExp(name) })).toContainText(
    'only from 203.0.113.7',
  );
});

test('a read-only key is refused a write', async ({ page }) => {
  await page.goto('/settings/api-keys/new');
  await page.getByRole('textbox', { name: 'Name' }).fill(`Reader ${unique()}`);
  await page.getByRole('button', { name: 'Create key' }).click();
  await page
    .getByRole('dialog', { name: 'Your API key' })
    .getByRole('button', { name: 'Close' })
    .click();

  await page.getByRole('button', { name: /Choose a call/ }).click();
  await page.keyboard.type('create customer');
  await page.getByRole('option', { name: /^Create a customer/ }).click();
  await page.getByRole('button', { name: 'Check' }).click();

  const result = page.getByTestId('try-result');

  await expect(result).toContainText('Refused');
  await expect(result).toContainText('Decided by: Contacts');
});

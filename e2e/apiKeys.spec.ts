import { expect, expectAccessible, test, unique } from './fixtures';

test('an owner makes a read-only key and tries it', async ({ page }) => {
  const name = `Sync ${unique()}`;

  await page.goto('/settings/api-keys/new');
  await page.getByRole('textbox', { name: 'Name' }).fill(name);
  await page.getByRole('textbox', { name: 'Only from these addresses' }).fill('203.0.113.7');
  await page.keyboard.press('Enter');

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

  await expect(page.getByRole('radio', { name: /^Read only/ })).toBeChecked();
  await page.getByRole('tab', { name: 'Check access' }).click();
  await expect(page.getByTestId('check-headline')).toContainText(`${name} can make`);
  await page.getByRole('textbox', { name: 'Search calls' }).fill('customers.list');

  const list = page.getByTestId('call-customers.list');

  await expect(list).toHaveAttribute('data-allowed', 'true');

  await page.getByRole('textbox', { name: 'Calling from' }).fill('10.0.0.5');
  await expect(list).toHaveAttribute('data-allowed', 'false');
  await expect(page.getByTestId('area-contacts')).toContainText('Not from this address');
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

  await page.getByRole('tab', { name: 'Check access' }).click();
  await page.getByRole('textbox', { name: 'Search calls' }).fill('customers.create');

  await expect(page.getByTestId('call-customers.create')).toHaveAttribute('data-allowed', 'false');
  await expect(page.getByTestId('area-contacts')).toContainText('Contacts is read only');
});

test('a key given one call makes only that one', async ({ page }) => {
  await page.goto('/settings/api-keys/new');
  await page.getByRole('textbox', { name: 'Name' }).fill(`Website form ${unique()}`);

  const contacts = page.getByRole('group', { name: 'Contacts' });

  await contacts.getByRole('button', { name: 'Choose' }).click();
  await page.getByRole('checkbox', { name: /^Read/ }).click();
  await page.getByRole('textbox', { name: 'Search calls' }).fill('create a customer');
  await page.getByRole('checkbox', { name: /^Create a customer/ }).click();

  await expect(page.getByTestId('key-sentence')).toContainText(
    'in contacts only create a customer',
  );
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Create key' }).click();
  await page
    .getByRole('dialog', { name: 'Your API key' })
    .getByRole('button', { name: 'Close' })
    .click();

  await expect(contacts.getByRole('button', { name: 'Choose' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.getByRole('tab', { name: 'Check access' }).click();

  const checked = page.getByTestId('area-contacts');

  await expect(checked).toContainText('1 of');
  await expect(page.getByTestId('call-customers.create')).toHaveAttribute('data-allowed', 'true');
  await expect(checked).toContainText('refused: Not one of its chosen calls');
  await expectAccessible(page);
});

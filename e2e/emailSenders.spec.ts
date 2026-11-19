import { expect, expectAccessible, test, unique } from './fixtures';

test('an owner adds a sender, which waits for its link, and removes it', async ({ page }) => {
  const address = `sales-${unique()}@e2e.test`;

  await page.goto('/settings/integrations/email?tab=senders');
  await expect(page.getByRole('tab', { name: 'Senders', selected: true })).toBeVisible();

  // A wrong address is refused in the dialog, next to the field.
  await page.getByRole('button', { name: 'Add sender' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add a sender' });

  await dialog.getByRole('textbox', { name: 'Name people see' }).fill('Sales team');
  await dialog.getByRole('textbox', { name: 'Address' }).fill('not-an-address');
  await dialog.getByRole('button', { name: 'Send confirmation link' }).click();
  await expect(dialog.getByText('Enter a valid email address.')).toBeVisible();
  await expectAccessible(page);

  await dialog.getByRole('textbox', { name: 'Address' }).fill(address);
  await dialog.getByRole('button', { name: 'Send confirmation link' }).click();
  await expect(dialog).toBeHidden();

  // Listed, waiting for someone to open the link, which can be sent again.
  const row = page.getByRole('listitem').filter({ hasText: address });

  await expect(row.getByText('Waiting for the link')).toBeVisible();
  await expect(row.getByRole('button', { name: 'Send the link again' })).toBeVisible();
  await expectAccessible(page);

  await page.reload();
  await expect(row.getByText('Waiting for the link')).toBeVisible();

  await row.getByRole('button', { name: 'Remove' }).click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByText(address)).toBeHidden();
});

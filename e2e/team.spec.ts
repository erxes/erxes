import { expect, expectAccessible, test, unique } from './fixtures';

test('an owner invites a member', async ({ page }) => {
  const email = `member-${unique()}@example.test`;

  await page.goto('/settings/team-members');
  await expect(page.getByRole('button', { name: 'Invite team members' })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Invite team members' }).click();
  // By name: a toast is a dialog too, and the success toast opens as this one closes.
  const dialog = page.getByRole('dialog', { name: 'Invite team members' });

  await dialog.getByRole('textbox').first().fill(email);
  await expectAccessible(page);
  await dialog.getByRole('button', { name: 'Send invites' }).click();
  await expect(dialog).toBeHidden();

  // The invitation waits until they accept it.
  const row = page.getByRole('row', { name: new RegExp(email) });

  await expect(row).toBeVisible();
  await expect(row.getByText('Not verified')).toBeVisible();
  await page.reload();
  await expect(row.getByText('Not verified')).toBeVisible();
  await expectAccessible(page);
});

import { expect, expectAccessible, OWNER, test } from './fixtures';

// Signs in on its own, so signing out never ends the session other specs share.
test.use({ storageState: { cookies: [], origins: [] } });

test('a member signs in and signs out', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('textbox', { name: 'Email' }).fill(OWNER.email);
  await page.getByRole('textbox', { name: 'Enter your password' }).fill(OWNER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { level: 1, name: /^Good / })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Profile' }).click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

  // The server ended the session: a reload stays signed out.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

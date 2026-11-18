import { expect, expectAccessible, test } from './fixtures';
import { OWNER } from './owner';

// Signs in on its own, so signing out never ends the session other specs share.
test.use({ storageState: { cookies: [], origins: [] } });

test('a refused sign-in says why in red the member can read', async ({ page }) => {
  await page.goto('/');
  // An address no one has: wrong passwords on a real one count toward its lock.
  await page.getByRole('textbox', { name: 'Email' }).fill(`nobody-${Date.now()}@e2e.test`);
  await page.getByLabel('Password', { exact: true }).fill('Not-the-password-1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expectAccessible(page);
});

test('a member signs in and signs out', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('textbox', { name: 'Email' }).fill(OWNER.email);
  await page.getByLabel('Password', { exact: true }).fill(OWNER.password);
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

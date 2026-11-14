import { expect, expectAccessible, test } from './fixtures';

test('an admin turns on code mode and sees what a program may do', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('link', { name: 'Assistant code mode' }).click();

  await expect(page).toHaveURL(/\/settings\/assistant-code-mode$/);

  const toggle = page.getByRole('switch', { name: /Let the assistant run code/ });

  await expect(toggle).toBeVisible();
  await expect(
    page.getByText('Changes that need approval are refused inside a program'),
  ).toBeVisible();
  await expectAccessible(page);

  if (!(await toggle.isChecked())) await toggle.click();

  await expect(toggle).toBeChecked();
  await page.reload();
  await expect(page.getByRole('switch', { name: /Let the assistant run code/ })).toBeChecked();
  await expectAccessible(page);
});

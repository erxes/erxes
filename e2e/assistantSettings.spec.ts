import { openAssistant } from './assistantPanel';
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

test('a member picks how the assistant looks, and it looks that way in the panel', async ({
  page,
}) => {
  await page.goto('/settings');
  await page.getByRole('link', { name: 'Assistant appearance' }).click();

  await expect(page).toHaveURL(/\/settings\/assistant-appearance$/);
  const sidebar = page.getByRole('complementary');

  await expect(sidebar.getByRole('link', { name: 'Assistant appearance' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(sidebar.getByRole('link', { name: 'Assistant', exact: true })).not.toHaveAttribute(
    'aria-current',
  );
  await expect(page.getByRole('img', { name: 'Preview' })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Cloud', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cloud', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Teal', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Teal', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Curious', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Curious', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.reload();

  for (const name of ['Cloud', 'Teal', 'Curious']) {
    await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }

  await expectAccessible(page);

  const panel = await openAssistant(page);

  const avatar = panel.getByRole('img', { name: 'Assistant' });

  await expect(avatar).toBeVisible();
  await expect(avatar.locator('path').first()).toHaveAttribute('fill', '#2fbfa0');
});

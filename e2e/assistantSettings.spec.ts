import { connectFakeModel, openAssistant } from './assistantPanel';
import { expect, expectAccessible, test } from './fixtures';

test('an admin picks the default model, and the assistant starts on it', async ({ page, api }) => {
  await connectFakeModel({ api });
  await page.goto('/settings');
  await page.getByRole('link', { name: 'Default model' }).click();

  await expect(page).toHaveURL(/\/settings\/assistant-model$/);
  await expect(page.getByText('Connected: Kimi Moonshot API.')).toBeVisible();
  await expectAccessible(page);

  const picker = page.getByRole('button', { name: 'Default model' });

  await picker.click();
  await page.getByRole('option', { name: 'Kimi K3' }).click();
  await expect(page.getByText('Default model saved')).toBeVisible();
  await expect(picker).toHaveText('Kimi Moonshot API · Kimi K3');
  await expect.poll(async () => (await api.assistant.settings()).defaultModel).toBe('kimi-k3');

  const panel = await openAssistant(page, '/settings/assistant-model');

  await expect(
    panel.getByRole('button', { name: 'Model: Kimi Moonshot API · Kimi K3' }),
  ).toBeVisible();

  await picker.click();
  await page.getByRole('option', { name: 'Automatic' }).click();
  await expect(picker).toHaveText('Automatic');
  await expect.poll(async () => (await api.assistant.settings()).defaultProvider).toBeNull();
});

test('an admin turns on code mode and sees what a program may do', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('link', { name: 'Code mode' }).click();

  await expect(page).toHaveURL(/\/settings\/assistant-code-mode$/);

  const toggle = page.getByRole('switch', { name: /Let the assistant run code/ });

  await expect(toggle).toBeVisible();
  await expect(
    page.getByText('Only search and call the API, as the member who asked and within their role.'),
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
  await page.getByRole('link', { name: 'Appearance' }).click();

  await expect(page).toHaveURL(/\/settings\/assistant-appearance$/);
  const sidebar = page.getByRole('complementary');

  await expect(sidebar.getByRole('link', { name: 'Appearance' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(sidebar.getByRole('link', { name: 'Default model' })).not.toHaveAttribute(
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

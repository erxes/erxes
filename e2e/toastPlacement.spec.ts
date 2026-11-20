import type { Locator } from '@playwright/test';
import { expect, test } from './fixtures';

// A toast never covers the bar with Save and Discard, so the next save stays in reach.

const box = async (locator: Locator) => {
  const found = await locator.boundingBox();

  if (!found) throw new Error('not on screen');

  return found;
};

test('the toast after a save sits above the save bar', async ({ page }) => {
  // Short enough that the save bar sits at the bottom of the window, where toasts show.
  await page.setViewportSize({ width: 1280, height: 480 });
  await page.goto('/settings/file-upload');

  const size = page.getByRole('textbox', { name: 'Largest file (MB)' });
  const before = await size.inputValue();
  const save = page.getByRole('button', { name: 'Save', exact: true });
  const bar = save.locator('..');

  await size.fill(before === '5' ? '6' : '5');
  await save.click();

  const toast = page.getByRole('dialog', { name: 'Upload settings saved' });

  await expect(toast).toBeVisible();

  const { y: barTop } = await box(bar);

  // Polled: the toast slides in before it settles.
  await expect
    .poll(async () => {
      const { y, height } = await box(toast);

      return y + height;
    })
    .toBeLessThanOrEqual(barTop);

  await size.fill(before);
  await save.click();
  await expect(save).toBeDisabled();
});

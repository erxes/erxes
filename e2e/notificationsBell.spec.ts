import { expect, expectAccessible, test } from './fixtures';

test('the bell’s unread count is readable and named as shown', async ({ page }) => {
  // Unread notifications, without waiting for something to send them. axe checks a count of
  // two characters or more; a single digit is too short for it to call text.
  await page.route('**/core/v1/notifications/unread-count*', (route) =>
    route.fulfill({ json: { count: 120, bySource: { core: 120 } } }),
  );

  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Notifications, 99+ unread' })).toContainText(
    '99+',
  );
  await expectAccessible(page);
});

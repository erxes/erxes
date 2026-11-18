import { expect, test } from './fixtures';

// Each page's breadcrumb, as the settings menu names it, in Mongolian.
const PAGES = [
  ['/settings/profile', 'Профайл'],
  ['/settings/webhooks', 'Вэбхүүк'],
  ['/settings/audit-log', 'Аудитын бүртгэл'],
] as const;

test('settings pages title their breadcrumb in the member’s language', async ({ page }) => {
  // The language erxes-ui keeps for this browser, read before the first render.
  await page.addInitScript(() => localStorage.setItem('erxes:ui:language', JSON.stringify('mn')));

  for (const [path, title] of PAGES) {
    await page.goto(path);
    await expect(page.getByRole('navigation', { name: 'Замын мөр' })).toContainText(title);
  }
});

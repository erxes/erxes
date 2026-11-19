import { expect, expectAccessible, test, unique } from './fixtures';

test('an owner adds a field group, then a field to it from its menu', async ({ page, api }) => {
  const group = `Billing ${unique()}`;
  const field = `Account code ${unique()}`;

  await page.goto('/contacts/settings/properties/company');
  await page.getByRole('button', { name: 'Add group' }).click();
  await page.getByRole('textbox', { name: 'Group name' }).fill(group);
  await page.getByRole('button', { name: 'Create' }).click();

  // The group's menu button is named for the group.
  const menu = page.getByRole('button', { name: `Actions for ${group}` });

  await expect(menu).toBeVisible();
  await expectAccessible(page);

  await menu.click();
  await page.getByRole('menuitem', { name: 'Add field' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(field);
  await page.getByRole('button', { name: 'Add property' }).click();

  await expect(page.getByRole('button', { name: `Actions for ${group}` })).toBeVisible();
  await expect
    .poll(async () =>
      (await api.fields.list({ contentType: 'company' })).data.map(({ label }) => label),
    )
    .toContain(field);
});

import { expect, expectAccessible, test, unique } from './fixtures';

test('an owner adds a field group to companies in the data model', async ({ page, api }) => {
  const group = `Billing ${unique()}`;

  await page.goto('/settings/data-model/fields/core.company');
  await page.getByRole('button', { name: 'Add group' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(group);
  await page.getByRole('button', { name: 'Save' }).click();

  // The group's menu button is named for the group.
  await expect(page.getByRole('button', { name: `Actions for ${group}` })).toBeVisible();
  await expectAccessible(page);

  await expect
    .poll(async () =>
      (await api.dataFieldGroups.list({ recordType: 'core.company' })).data.map(
        ({ label }) => label,
      ),
    )
    .toContain(group);
});

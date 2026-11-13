import { expect, expectAccessible, test, unique } from './fixtures';

test('a member links a contact to a company', async ({ page, api }) => {
  const suffix = unique();
  const company = await api.companies.create({ primaryName: `Analytical Engines ${suffix}` });
  const customer = await api.customers.create({ firstName: `Charles ${suffix}` });

  await page.goto(`/contacts/customers/${customer.id}`);
  await page.getByRole('button', { name: 'Link a company' }).click();
  await page.keyboard.type(`Analytical Engines ${suffix}`);
  await page.getByRole('option', { name: `Analytical Engines ${suffix}` }).click();
  await expect(page.getByRole('button', { name: `Analytical Engines ${suffix}` })).toBeVisible();
  await expectAccessible(page);

  await expect
    .poll(async () =>
      (await api.customers.companies({ id: customer.id })).data.map((row) => row.id),
    )
    .toEqual([company.id]);

  // The company lists the person too.
  await page.goto(`/contacts/companies/${company.id}`);
  await expect(page.getByRole('button', { name: `Charles ${suffix}` })).toBeVisible();
  await expectAccessible(page);
});

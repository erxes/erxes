import { expect, expectAccessible, test, unique } from './fixtures';

// Red text (errors, invalid labels, delete buttons and items) reads at 4.5:1 in both themes.

test('a form error and its label read in red the member can read', async ({ page }) => {
  await page.goto('/settings/profile');

  await page.getByRole('textbox', { name: 'Email' }).fill('');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Enter your email')).toBeVisible();
  await expectAccessible(page);
});

test('a side panel form’s error reads in red the member can read', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add product', exact: true }).click();
  await page.getByRole('button', { name: 'Create product' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expectAccessible(page);
});

test('delete buttons and items read in red the member can read', async ({ page, api }) => {
  const company = `Acme ${unique()}`;
  const customer = `Grace ${unique()}`;

  await api.companies.create({ primaryName: company });
  const { id } = await api.customers.create({ firstName: customer });

  await page.goto('/contacts/companies');
  await page
    .getByRole('row', { name: new RegExp(company, 'u') })
    .getByRole('checkbox')
    .check();
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  await expectAccessible(page);

  await page.goto(`/contacts/customers/${id}`);

  const note = page.getByRole('textbox', { name: /^Write a note/ });

  await note.fill('Called about the engine');
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(note).toHaveValue('');
  await page.getByRole('button', { name: 'Note actions' }).click();
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible();
  await expectAccessible(page);
});

import { DESCRIPTION_MAX } from '@erxes/core-contract';
import { expect, expectAccessible, test, unique } from './fixtures';

test('a member creates a contact, edits it and adds a note', async ({ page, api }) => {
  // A long flow with axe at each step: near the default 30s on a busy runner.
  test.setTimeout(60_000);

  const name = `Ada ${unique()}`;

  // A row with two tags: axe checks the tag cell's spoken name still holds the text it shows.
  const vip = await api.tags.create({ type: 'customer', name: `VIP ${unique()}` });
  const partner = await api.tags.create({ type: 'customer', name: `Partner ${unique()}` });
  const grace = `Grace ${unique()}`;

  await api.customers.create({ firstName: grace, tagIds: [vip.id, partner.id] });

  await page.goto('/contacts/customers');
  await expect(page.getByRole('button', { name: `Name ${grace}` })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'NAME' })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: /^Add Customer/ }).click();
  await page.getByRole('textbox', { name: 'First name' }).fill(name);
  await page.getByRole('textbox', { name: 'Last name' }).fill('Lovelace');
  await page.getByRole('textbox', { name: 'Email' }).fill(`${name.replace(' ', '.')}@example.test`);
  await expectAccessible(page);
  // The form holds the description to the contract's limit before it sends anything.
  const description = page.getByRole('textbox', { name: 'Description' });

  await description.fill('word '.repeat(DESCRIPTION_MAX / 5));
  await page.getByRole('button', { name: 'Create customer' }).click();
  await expect(page.getByText('The description is too long')).toBeVisible();
  // Saved straight after typing: the editor hands over every edit at once.
  await description.fill('Met at the trade fair');
  await page.getByRole('button', { name: 'Create customer' }).click();

  let id = '';

  await expect
    .poll(async () => {
      id = (await api.customers.list({ search: name })).data[0]?.id ?? '';

      return id;
    })
    .not.toBe('');
  expect((await api.customers.get({ id })).description).toContain('Met at the trade fair');

  await page.goto(`/contacts/customers/${id}`);
  await expect(page.getByRole('heading', { name: `${name} Lovelace` })).toBeVisible();
  await expectAccessible(page);

  // Click a value to edit it; Enter saves, as in the list.
  await page.getByRole('button', { name: 'Position' }).click();
  await page.keyboard.type('Analyst');
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await api.customers.get({ id })).position).toBe('Analyst');

  await page.getByRole('button', { name: 'Add tags' }).click();
  await page.getByRole('option', { name: vip.name }).click();
  await expect.poll(async () => (await api.customers.get({ id })).tagIds).toEqual([vip.id]);
  await expectAccessible(page);
  await page.keyboard.press('Escape');

  // A description change reads as its text in the timeline, not as the editor's JSON.
  await page.getByRole('tab', { name: 'Description' }).click();
  await page.getByRole('tabpanel').getByRole('textbox').fill('Met at the fair twice');
  await page.getByRole('tab', { name: 'Activity' }).click();
  await expect(page.getByText('Met at the trade fair', { exact: true })).toBeVisible();

  const note = page.getByRole('textbox', { name: /^Write a note/ });

  await note.fill('Called about the engine');
  await page.getByRole('button', { name: 'Add note' }).click();
  // The box empties once the note is saved; until then its text is a second match.
  await expect(note).toHaveValue('');
  await expect(page.getByText('Called about the engine')).toBeVisible();
  await expectAccessible(page);

  // Both survive a reload.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Analyst' })).toBeVisible();
  await page.getByRole('tab', { name: 'Activity' }).click();
  await expect(page.getByText('Called about the engine')).toBeVisible();
});

test('a member filters customers by a tag, opens the advanced filter and clears an empty result', async ({
  page,
  api,
}) => {
  const tag = await api.tags.create({ type: 'customer', name: `Gold ${unique()}` });
  const tagged = `Tagged ${unique()}`;
  const other = `Other ${unique()}`;

  await api.customers.create({ firstName: tagged, tagIds: [tag.id] });
  await api.customers.create({ firstName: other });

  await page.goto('/contacts/customers');
  await expect(page.getByRole('button', { name: `Name ${other}` })).toBeVisible();

  // Field, then value: the chip joins the row under the view bar and the list follows.
  await page.getByRole('button', { name: 'Filter', exact: true }).click();
  await page.getByRole('option', { name: 'Tags', exact: true }).click();
  await page.getByRole('option', { name: tag.name }).click();
  await page.keyboard.press('Escape');

  const row = page.getByRole('toolbar', { name: 'Filters' });

  await expect(row.getByText(tag.name)).toBeVisible();
  await expect(page.getByRole('button', { name: `Name ${tagged}` })).toBeVisible();
  await expect(page.getByRole('button', { name: `Name ${other}` })).toBeHidden();
  await expectAccessible(page);

  // The advanced filter opens over the row and shows the same rule.
  await row.getByRole('button', { name: 'Filter', exact: true }).click();
  await page.getByRole('option', { name: 'Advanced filter' }).click();

  const advanced = page.getByRole('dialog', { name: 'Advanced filter' });

  await expect(advanced.getByText('Where')).toBeVisible();
  await expect(advanced.getByText(/match/)).toBeVisible();
  await expectAccessible(page);
  await advanced.getByRole('button', { name: 'Done' }).click();

  // A search nothing matches: the list says so and clears the filters.
  await row.getByRole('button', { name: 'Filter', exact: true }).click();
  await page.getByRole('option', { name: 'Search' }).click();
  await page.getByPlaceholder('Search…').fill(`nobody ${unique()}`);
  await page.keyboard.press('Enter');
  await expect(page.getByText('No customers match these filters')).toBeVisible();
  await expectAccessible(page);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(row).toBeHidden();
  await expect(page.getByRole('button', { name: `Name ${other}` })).toBeVisible();
});

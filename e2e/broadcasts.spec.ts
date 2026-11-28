import { expect, expectAccessible, test, unique } from './fixtures';

test('a member writes an email broadcast, sends it to a filter and reads its numbers', async ({
  page,
  api,
}) => {
  // Delivery runs in the background at the deployment's pace.
  test.setTimeout(90_000);

  const suffix = unique();
  const group = `bc${suffix}-`;

  await Promise.all(
    ['Ada', 'Grace'].map((name, index) =>
      api.customers.create({
        firstName: `${name} ${suffix}`,
        primaryEmail: `${name.toLowerCase()}-${suffix}@e2e.test`,
        code: `${group}${index}`,
      }),
    ),
  );

  await page.goto('/broadcasts');
  await expect(page.getByRole('button', { name: 'New email' })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'New email' }).click();
  await page.waitForURL(/\/broadcasts\/\w+$/);
  const id = new URL(page.url()).pathname.split('/').at(-1) ?? '';

  // erxes-ui's conditions editor has its own tests; the audience is set through the API here.
  await api.broadcasts.update({
    id,
    filter: { match: 'all', rules: [{ path: 'subject.code', op: 'starts_with', value: group }] },
  });
  await page.reload();
  await expect(page.getByText('Reaches 2 of 2 matching customers')).toBeVisible();

  // Sending saves what is typed first.
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(`News ${suffix}`);
  await page.getByRole('textbox', { name: 'Subject' }).fill('Hello {{ firstName | friend }}');
  const message = page.getByRole('group', { name: 'Message', exact: true });
  const editor = message.getByRole('textbox', { name: 'Message', exact: true });

  await editor.click();
  await page.keyboard.type('Hi ');
  await message.getByRole('button', { name: 'Insert a field' }).click();
  await page.getByRole('menuitem', { name: 'First name' }).click();
  await editor.focus();
  await page.keyboard.press('End');
  await page.keyboard.type(', read the news.');
  await expect(page.getByText('Unsaved changes')).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Send now' }).click();
  const confirm = page.getByRole('alertdialog');

  await expect(confirm.getByText('It goes to 2 people and can’t be unsent.')).toBeVisible();
  await confirm.getByRole('button', { name: 'Send now' }).click();

  await expect
    .poll(async () => (await api.broadcasts.get({ id })).status, { timeout: 30_000 })
    .toBe('sent');
  expect((await api.broadcasts.get({ id })).body).toContain('Hi {{ firstName }}, read the news.');
  await page.reload();
  await expect(page.getByRole('link', { name: `Ada ${suffix}` })).toBeVisible();
  await expect(page.getByText('Recipients', { exact: true })).toBeVisible();
  await expectAccessible(page);
});

test('a member keeps an email’s message as a template and starts another email from it', async ({
  page,
  api,
}) => {
  const suffix = unique();
  const name = `Welcome ${suffix}`;
  const source = await api.broadcasts.create({ name: `Source ${suffix}`, channel: 'email' });

  await page.goto(`/broadcasts/${source.id}`);
  const message = page.getByRole('group', { name: 'Message', exact: true });

  await message.getByRole('textbox', { name: 'Message', exact: true }).click();
  await page.keyboard.type(`Welcome aboard ${suffix}.`);
  await message.getByRole('button', { name: 'Templates' }).click();
  await page.getByPlaceholder('Find a template, or name a new one').fill(name);
  await page.getByRole('option', { name: `Save this message as “${name}”` }).click();
  await expect(page.getByText('Saved as a template')).toBeVisible();

  await page.goto('/broadcasts/templates');
  await expect(page.getByRole('link', { name: new RegExp(name) })).toBeVisible();
  await expectAccessible(page);

  const next = await api.broadcasts.create({ name: `Next ${suffix}`, channel: 'email' });

  await page.goto(`/broadcasts/${next.id}`);
  const empty = page.getByRole('group', { name: 'Message', exact: true });

  await empty.getByRole('button', { name: 'Templates' }).click();
  await page.getByRole('option', { name, exact: true }).click();
  await expect(empty.getByText(`Welcome aboard ${suffix}.`)).toBeVisible();
  await expect(page.getByText('Unsaved changes')).toBeVisible();
  await expectAccessible(page);
});

test('a member stops broadcasts to an address by hand and allows it again', async ({ page }) => {
  const address = `quiet-${unique()}@e2e.test`;

  await page.goto('/broadcasts/suppressions');
  await page.getByRole('button', { name: 'Add addresses' }).click();
  await page.getByRole('textbox', { name: 'Emails' }).fill(address);
  await page.getByRole('button', { name: 'Suppress' }).click();

  await page.getByRole('textbox', { name: 'Search addresses' }).fill(address);
  await expect(page.getByText(address)).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Allow again' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Allow again' }).click();
  await expect(page.getByText(address)).toBeHidden();
});

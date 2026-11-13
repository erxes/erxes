import { expect, expectAccessible, test, unique } from './fixtures';

test('a member creates an automation, turns it on and it runs', async ({ page, api }) => {
  const suffix = unique();

  await page.goto('/automations');
  await expect(page.getByRole('button', { name: 'New automation' })).toBeVisible();
  await expectAccessible(page);

  // A new automation starts as "Customer created → Add a note".
  await page.getByRole('button', { name: 'New automation' }).click();
  await page.waitForURL(/\/automations\/\w+$/);
  const automationId = new URL(page.url()).pathname.split('/').at(-1) ?? '';

  await page.getByRole('textbox', { name: 'Name' }).fill(`Welcome note ${suffix}`);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Turn on' }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await expectAccessible(page);

  const customer = await api.customers.create({ firstName: `Ada ${suffix}` });

  await expect
    .poll(
      async () => {
        const { data } = await api.automations.runs({ id: automationId });

        return data.find((run) => run.subject?.id === customer.id)?.status;
      },
      { timeout: 20_000 },
    )
    .toBe('succeeded');

  await page.getByRole('tab', { name: /^Runs/ }).click();
  await page.getByRole('button', { name: new RegExp(`^Done ${customer.id}`) }).click();
  await expect(page.getByText('core.note.add')).toBeVisible();
  await expectAccessible(page);

  // The step's note is on the customer's timeline.
  await page.getByRole('link', { name: 'Open the customer' }).click();
  await page.getByRole('tab', { name: 'Activity' }).click();
  // first(): on a reused local database, automations from earlier runs add the same note.
  await expect(page.getByText(`Welcome Ada ${suffix}!`).first()).toBeVisible();
});

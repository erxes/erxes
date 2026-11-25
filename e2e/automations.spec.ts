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
  await expect(page.getByText('Live', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Turn on' })).toHaveCount(0);
  await expectAccessible(page);

  const customer = await api.customers.create({ firstName: `Ada ${suffix}` });

  await expect
    .poll(
      async () => {
        const { data } = await api.automations.runs({ id: automationId });

        return data.find((run) => run.subjectId === customer.id)?.status;
      },
      { timeout: 20_000 },
    )
    .toBe('succeeded');

  // The tab counts the runs its list shows, without a reload.
  await expect(page.getByRole('tab', { name: /^Runs \([1-9]\d*\)$/ })).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole('tab', { name: /^Runs/ }).click();
  await page.getByRole('button', { name: new RegExp(`^Done Ada ${suffix}`) }).click();
  await expect(page.getByRole('listitem').filter({ hasText: /^Done\s*Add a note/ })).toBeVisible();
  await expectAccessible(page);

  // The step's note is on the customer's timeline.
  await page.getByRole('link', { name: 'Open the customer' }).click();
  await page.getByRole('tab', { name: 'Activity' }).click();
  // first(): on a reused local database, automations from earlier runs add the same note.
  await expect(page.getByText(`Welcome Ada ${suffix}!`).first()).toBeVisible();
});

test('a reload keeps edits that are not ready to save', async ({ page }) => {
  const suffix = unique();

  await page.goto('/automations');
  await page.getByRole('button', { name: 'New automation' }).click();
  await page.waitForURL(/\/automations\/\w+$/);

  await page.getByRole('textbox', { name: 'Name' }).fill(`Half done ${suffix}`);
  await page.getByRole('button', { name: /^Do this Add a note/i }).click();
  await page.getByRole('button', { name: 'Step actions' }).last().click();
  await page.getByRole('menuitem', { name: 'Remove step' }).click();
  await expect(page.getByRole('button', { name: /^Do this Add a note/i })).toHaveCount(0);

  await page.reload();

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue(`Half done ${suffix}`);
  await expect(page.getByRole('button', { name: /^Do this Add a note/i })).toHaveCount(0);
});

test('switching triggers with no steps keeps the draft without an error and accepts webhook samples', async ({
  page,
  api,
  request,
}) => {
  await page.goto('/automations');
  await page.getByRole('button', { name: 'New automation' }).click();
  await page.waitForURL(/\/automations\/\w+$/);
  const automationId = new URL(page.url()).pathname.split('/').at(-1) ?? '';
  const starts = page.getByRole('radiogroup', { name: 'Starts' });

  await starts.getByText('Webhook', { exact: true }).click();
  await page.getByRole('button', { name: 'Change and fix them' }).click();
  await expect(
    page.getByRole('button', { name: /^When When its webhook is called/i }),
  ).toBeVisible();
  await expect(page.getByText('Something went wrong')).toHaveCount(0);

  for (const label of ['Schedule', 'Date', 'Manual', 'Event', 'Webhook']) {
    await starts.getByText(label, { exact: true }).click();
  }

  await expect(
    page.getByRole('button', { name: /^When When its webhook is called/i }),
  ).toBeVisible();
  await expect(page.getByText('Something went wrong')).toHaveCount(0);
  await expect(page.getByText('Unsaved changes')).toBeVisible();

  const { hookUrl } = await api.automations.get({ id: automationId });

  const response = await request.post(new URL(hookUrl).pathname, {
    data: { orderId: 'ord_42' },
  });

  expect(response.status()).toBe(202);
  await expect(page.getByText('Got a call')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Order id')).toBeVisible({ timeout: 10_000 });
  await expectAccessible(page);
});

test('a member sees TypeSafe and OpenAI in Decision model integrations and adds a decision node', async ({
  page,
}) => {
  const suffix = unique();

  await page.goto('/settings/integrations?tab=browse');
  await expect(page.getByRole('heading', { name: 'AI Provider' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Decision model' })).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Decision model' }).click();
  await expect(page.getByRole('heading', { name: 'Decision model' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AI Provider' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /TypeSafe/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /OpenAI/ })).toBeVisible();
  await expectAccessible(page);

  await page.goto('/automations');
  await page.getByRole('button', { name: 'New automation' }).click();
  await page.waitForURL(/\/automations\/\w+$/);

  await page.getByRole('textbox', { name: 'Name' }).fill(`Triage ${suffix}`);
  await page.getByRole('button', { name: 'Add a step' }).first().click();
  await page.getByRole('option', { name: /Decision model/ }).click();

  await expect(page.getByRole('complementary', { name: 'Data' })).toBeVisible();
  const inspector = page.getByRole('complementary').last();

  await expect(inspector.getByRole('button', { name: /^TypeSafe/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(inspector.getByRole('button', { name: /^OpenAI/ })).toBeVisible();
  await expect(inspector.getByRole('textbox', { name: 'Model' })).toHaveCount(0);
  await expect(inspector.getByRole('button', { name: /^Model:/ })).toBeDisabled();
  await expect(inspector.getByRole('button', { name: /^Model:/ })).toContainText('Connect first');
  await inspector.getByRole('combobox', { name: 'Minimum confidence' }).click();
  await page.getByRole('option', { name: '80%' }).click();
  await inspector.getByRole('textbox', { name: 'Question' }).click();
  await page.keyboard.type('Which team should take this?');
  await inspector.getByRole('button', { name: /^OpenAI/ }).click();
  await expect(inspector.getByRole('button', { name: /^OpenAI/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  // OpenAI decide steps return a confidence too since #11043, so the threshold stays.
  await expect(inspector.getByRole('combobox', { name: 'Minimum confidence' })).toBeVisible();
  await inspector.getByRole('button', { name: /^TypeSafe/ }).click();
  await inspector.getByRole('combobox', { name: 'Minimum confidence' }).click();
  await page.getByRole('option', { name: '80%' }).click();
  await expect(page.getByText('Otherwise')).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();

  await page.reload();
  await page.getByRole('button', { name: /Which team should take this\?/ }).click();
  await expect(inspector.getByRole('combobox', { name: 'Minimum confidence' })).toContainText(
    '80%',
  );
  await expectAccessible(page);
});

test('the canvas moves by dragging, zooms at the pointer and keeps the opened step in view', async ({
  page,
}) => {
  await page.goto('/automations');
  await page.getByRole('button', { name: 'New automation' }).click();
  await page.waitForURL(/\/automations\/\w+$/);

  const step = page.getByRole('button', { name: /^Do this Add a note/i });
  const start = await step.boundingBox();

  if (!start) throw new Error('the step card has no box');

  await page.mouse.move(start.x - 60, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(start.x + 140, start.y + start.height / 2 + 40, { steps: 8 });
  await page.mouse.up();

  const moved = await step.boundingBox();

  expect(Math.round((moved?.x ?? 0) - start.x)).toBe(200);
  expect(Math.round((moved?.y ?? 0) - start.y)).toBe(40);

  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -100);
  await page.keyboard.up('Control');
  await expect(page.getByRole('button', { name: '150%' })).toBeVisible();
  await page.getByRole('button', { name: '150%' }).click();
  await expect(page.getByRole('button', { name: '100%' })).toBeVisible();

  await step.click();
  const data = page.getByRole('complementary', { name: 'Data' });

  await expect(data).toBeVisible();
  await expect
    .poll(async () => {
      const [card, panel] = await Promise.all([step.boundingBox(), data.boundingBox()]);

      return (card?.x ?? Infinity) + (card?.width ?? 0) <= (panel?.x ?? 0);
    })
    .toBe(true);
});

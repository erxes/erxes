import { expect, expectAccessible, test, unique } from './fixtures';

test('pickers open at the top with the current value marked, and data follows the trigger', async ({
  page,
  api,
}) => {
  const automation = await api.automations.create({
    name: `Invoice follow-up ${unique()}`,
    definition: {
      trigger: { kind: 'event', event: 'core.payment.paid' },
      steps: [
        {
          id: 'n1',
          type: 'action',
          action: 'core.notification.send',
          input: { title: 'Paid', owner: false },
        },
      ],
    },
  });

  await page.goto(`/automations/${automation.id}`);

  await page.getByRole('button', { name: /^When Invoice paid/i }).click();
  await page
    .getByRole('button', { name: /Invoice paid/ })
    .last()
    .click();
  const events = page.getByRole('dialog', { name: 'Choose an event' });
  await expect(events.getByRole('button', { name: /^Payments/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(events.getByRole('option', { name: /^Invoice paid/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expectAccessible(page);
  await page.keyboard.press('Escape');

  // Search still looks across every category.
  await page
    .getByRole('button', { name: /Invoice paid/ })
    .last()
    .click();
  await page.getByPlaceholder('Search events…').fill('company created');
  await expect(page.getByRole('option', { name: /^Company created/ })).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: /^Do this Notify team members/i }).click();
  await page
    .getByRole('button', { name: /Notify team members/ })
    .last()
    .click();
  await expect(
    page
      .getByRole('dialog', { name: 'Choose an action' })
      .getByRole('option', { name: /^Notify team members/ }),
  ).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('Escape');

  // The data picker offers the invoice's values under its name, and no customer it isn't about.
  await page.getByRole('button', { name: 'Insert data' }).first().click();
  await expect(page.getByRole('group', { name: 'The invoice' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'Paid amount' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'The customer' })).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Insert data' })).toBeVisible();
  await expectAccessible(page);
});

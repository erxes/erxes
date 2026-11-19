import { setTimeout as delay } from 'node:timers/promises';
import { type coreClient, expect, expectAccessible, test, unique } from './fixtures';

const SEALED = 'sk_e2e_0123456789';

const confirm = 'Confirm';

type Api = ReturnType<typeof coreClient>;

const seedPrograms = async (api: Api, integrationId: string) => {
  const action = { integrationId, kind: 'action' as const, key: 'ping', label: 'Ping boat' };

  await api.integrations.saveProgram({ ...action, code: 'return { pong: false };' });
  await api.integrations.saveProgram({
    ...action,
    code: 'console.log("pinged"); return { pong: true };',
  });
  await api.integrations.saveProgram({
    integrationId,
    kind: 'incoming',
    key: 'hook',
    label: 'Boat calls',
    events: [{ key: 'boat_created', label: 'Boat created', fields: [] }],
    code: 'return { event: "boat_created", payload: { boatId: incoming.body.id } };',
  });
};

test('an owner connects a service by hand, seals its keys and changes its hosts', async ({
  page,
}) => {
  const suffix = unique();
  const name = `Boat ${suffix}`;

  await page.goto('/settings/integrations');
  await page.getByRole('button', { name: 'Add integration' }).click();

  const dialog = page.getByRole('dialog', { name: 'Add a custom integration' });
  const host = dialog.getByPlaceholder('api.example.com');

  await dialog.getByRole('textbox', { name: 'Name' }).fill(name);
  await expect(dialog.getByRole('textbox', { name: 'Key' })).toHaveValue(`boat_${suffix}`);
  await host.fill('https://bad');
  await host.press('Enter');
  await expect(dialog.getByText('Each host is a name like api.example.com')).toBeVisible();
  await expectAccessible(page);
  await host.press('Backspace');
  await host.fill('api.boat.test');
  await host.press('Enter');
  await page.route('**/core/v1/integrations', async (route) => {
    if (route.request().method() === 'GET') await delay(500);

    await route.continue();
  });
  await dialog.getByRole('button', { name: 'Add integration' }).click();
  await expect(dialog).toBeHidden();

  await expect(page.getByRole('heading', { name })).toBeVisible();
  await page.unrouteAll({ behavior: 'wait' });
  await expect(page.getByRole('tab', { name: 'Keys', selected: true })).toBeVisible();
  await expect(page.getByText('Not set up')).toBeVisible();
  await expect(page.getByText('No keys yet')).toBeVisible();

  await page.getByRole('textbox', { name: 'Name' }).fill('1bad');
  await expect(page.getByText('Letters, digits and _, starting with a letter.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Name' }).fill('apiKey');
  await page.getByLabel('Value').fill(SEALED);
  await page.getByRole('button', { name: 'Add key' }).click();
  await expect(page.getByText('Key saved. It is not shown again.')).toBeVisible();
  await expect(page.getByText('Connected')).toBeVisible();
  await expect(page.getByLabel('Value')).toHaveValue('');
  await expectAccessible(page);

  await page.reload();
  await expect(page.getByText('apiKey', { exact: true })).toBeVisible();
  await expect(page.getByText(SEALED)).toHaveCount(0);

  await page.getByRole('button', { name: 'Replace', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('apiKey');
  await page.getByLabel('Value').fill(`${SEALED}_2`);
  await page.getByRole('button', { name: 'Replace key' }).click();
  await expect(page.getByText('Key saved. It is not shown again.')).toBeVisible();

  await page.getByRole('textbox', { name: 'Name' }).fill('spare');
  await page.getByLabel('Value').fill('spare_value_123');
  await page.getByRole('button', { name: 'Add key' }).click();
  await expect(page.getByText('spare', { exact: true })).toBeVisible();
  await page
    .getByRole('listitem')
    .filter({ hasText: 'spare' })
    .getByRole('button', { name: 'Remove' })
    .click();
  await expect(page.getByText('Remove the key spare?')).toBeVisible();
  await page.getByRole('button', { name: confirm, exact: true }).click();
  await expect(page.getByText('Key removed')).toBeVisible();
  await expect(page.getByText('spare', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Connected')).toBeVisible();

  await page.getByRole('tab', { name: 'Programs' }).click();
  await expect(page.getByText('No programs yet')).toBeVisible();
  await page.getByRole('button', { name: 'Ask the assistant' }).click();
  await expect(page.getByRole('complementary', { name: 'Assistant' })).toBeVisible();

  await page.getByRole('tab', { name: 'Overview' }).click();
  await page.getByPlaceholder('api.example.com').fill('api2.boat.test');
  await page.getByPlaceholder('api.example.com').press('Enter');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  await expect(page.getByText('Calls api.boat.test, api2.boat.test.')).toBeVisible();
});

test('an owner tests, restores and deletes the programs of a custom integration, then the integration', async ({
  page,
  api,
}) => {
  const key = `boat_${unique()}`;
  const name = `Boat ${key}`;
  const integration = await api.integrations.create({ key, name, hosts: ['api.boat.test'] });

  await seedPrograms(api, integration.id);
  await page.goto(`/settings/integrations/custom.${key}?tab=programs`);
  await expect(page.getByText(`integrations.${key}.ping`)).toBeVisible();
  await expect(page.getByText('Boat calls')).toBeVisible();
  await expectAccessible(page);

  await page.getByText('Ping boat').click();
  await expect(page.getByText('console.log("pinged"); return { pong: true };')).toBeVisible();
  await page.getByRole('button', { name: 'Run test' }).click();
  await expect(page.getByText('It ran')).toBeVisible();
  await expect(page.getByText('"pong": true')).toBeVisible();
  await expect(page.getByText('pinged', { exact: true })).toBeVisible();

  await expect(page.getByText('Version 2', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restore' }).click();
  await expect(page.getByText('Restore version 1?')).toBeVisible();
  await page.getByRole('button', { name: confirm, exact: true }).click();
  await expect(page.getByText('Restored. It is live now.')).toBeVisible();
  await expect(page.getByText('Version 3', { exact: true })).toBeVisible();
  await expect(page.getByText('return { pong: false };')).toBeVisible();
  await page.getByRole('button', { name: 'Run test' }).click();
  await expect(page.getByText('"pong": false')).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: confirm, exact: true }).click();
  await expect(page.getByText('Program deleted')).toBeVisible();
  await expect(page.getByText(`integrations.${key}.ping`)).toHaveCount(0);

  await page.getByText('Boat calls').click();
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByText('/core/v1/integrations/in/').click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('/core/v1/integrations/in/');
  await page.getByLabel('Body').fill('{"id": "boat_7"}');
  await page.getByRole('button', { name: 'Run test' }).click();
  await expect(page.getByText('"boatId": "boat_7"')).toBeVisible();
  await expectAccessible(page);

  await page.getByRole('tab', { name: 'Overview' }).click();
  await expect(page.getByText(`integrations.${key}`)).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText(`Delete ${name}?`)).toBeVisible();
  await page.getByRole('button', { name: confirm, exact: true }).click();
  await expect(page.getByText(`${name} deleted`)).toBeVisible();
  await expect(page).toHaveURL(/\/settings\/integrations$/);
  await expect(page.getByRole('link', { name: new RegExp(name) })).toHaveCount(0);
});

test("a custom integration's event starts an automation and its action runs as a step", async ({
  page,
  api,
}) => {
  const key = `dock_${unique()}`;

  const integrationId = (
    await api.integrations.create({ key, name: `Dock ${key}`, hosts: ['api.dock.test'] })
  ).id;

  await api.integrations.saveProgram({
    integrationId,
    kind: 'action',
    key: 'moor',
    label: 'Moor a boat',
    fields: [{ key: 'boat', label: 'Boat to moor', type: 'text', required: true }],
    outputs: [{ key: 'berth', label: 'Berth', type: 'text' }],
    code: 'return { berth: "B-" + input.boat };',
  });

  const incoming = await api.integrations.saveProgram({
    integrationId,
    kind: 'incoming',
    key: 'hook',
    label: 'Dock calls',
    events: [
      {
        key: 'boat_created',
        label: 'Boat created',
        fields: [{ key: 'boatId', label: 'Boat number', type: 'text' }],
      },
    ],
    code: 'return { event: "boat_created", payload: { boatId: incoming.body.id }, dedupeKey: incoming.body.id };',
  });

  const automation = await api.automations.create({
    name: `Moor new boats ${key}`,
    definition: {
      trigger: { kind: 'event', event: `integrations.${key}.boat_created` },
      steps: [
        {
          id: 'moor',
          type: 'action',
          action: `integrations.${key}.moor`,
          input: { boat: '{{event.payload.boatId}}' },
        },
      ],
    },
  });

  await page.goto(`/automations/${automation.id}`);
  await expect(page.getByRole('button', { name: /^When Boat created/i })).toBeVisible();

  await page.getByRole('button', { name: /^Do this Moor a boat/i }).click();
  await expect(page.getByText('Boat to moor: [Boat number]')).toBeVisible();
  await page.getByRole('button', { name: 'Insert data' }).first().click();
  await expect(page.getByRole('option', { name: 'Boat number' })).toBeVisible();
  await expectAccessible(page);
  await page.keyboard.press('Escape');

  await page
    .getByRole('button', { name: /Moor a boat/ })
    .last()
    .click();
  await page.getByPlaceholder('Search actions…').fill(key);
  await expect(page.getByRole('option', { name: /^Moor a boat/ })).toHaveCount(1);
  await page.keyboard.press('Escape');

  await api.automations.activate({ id: automation.id });

  const called = await page.request.post(new URL(incoming.address ?? '').pathname, {
    data: { id: 'boat_42' },
  });

  expect(called.status()).toBe(200);

  await expect
    .poll(async () => (await api.automations.runs({ id: automation.id })).data[0]?.status, {
      timeout: 30_000,
    })
    .toBe('succeeded');

  const [run] = (await api.automations.runs({ id: automation.id })).data;
  const detail = await api.automations.run({ runId: run?.id ?? '' });

  expect(detail.steps[0]?.output).toEqual({ berth: 'B-boat_42' });
});

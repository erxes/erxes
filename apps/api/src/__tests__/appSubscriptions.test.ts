import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { settle } from './settle';

describe('app trigger state in settings', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const stripe = fakeGateway([
    ['GET /v1/balance', { object: 'balance' }],
    ['POST /v1/webhook_endpoints/we_1', { id: 'we_1' }],
    ['DELETE /v1/webhook_endpoints/we_1', { id: 'we_1', deleted: true }],
    ['POST /v1/webhook_endpoints', { id: 'we_1', secret: 'whsec_from_stripe' }],
  ]);

  const stripeCalls = (method: string, path: string) =>
    stripe.calls.filter((call) => call.method === method && call.url.endsWith(path));

  const subscriptions = async () =>
    (await t.owner().integrations.subscriptions({ key: 'stripe' })).data;

  let connectionId = '';
  let automationId = '';

  beforeAll(async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
      urlOf(input).startsWith('https://api.stripe.com/')
        ? stripe.fetch(input, init)
        : realFetch(input, init),
    );

    connectionId = (
      await t.owner().integrations.connect({
        key: 'stripe',
        name: 'Shop',
        keys: { secretKey: 'sk_test_shop' },
      })
    ).id;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('shows the connection listening for the automation that uses it, to its own organisation only', async () => {
    expect(await subscriptions()).toEqual([]);

    automationId = await t.active('Thank the buyer', {
      trigger: { kind: 'app', app: 'stripe', trigger: 'payment_succeeded', connectionId },
      steps: [{ id: 'wait', type: 'delay', amount: 1, unit: 'days' }],
    });

    await settle();

    const { apps } = await t.owner().automations.catalog();

    const label = apps
      .find((app) => app.key === 'stripe')
      ?.triggers.find((trigger) => trigger.key === 'payment_succeeded')?.label;

    expect(await subscriptions()).toEqual([
      expect.objectContaining({
        connectionId,
        connectionName: 'Shop',
        channel: 'hook',
        status: 'listening',
        lastError: null,
        triggers: [{ key: 'payment_succeeded', label }],
        automations: [{ id: automationId, name: 'Thank the buyer' }],
      }),
    ]);
    expect((await t.other().integrations.subscriptions({ key: 'stripe' })).data).toEqual([]);

    const { data } = await t.owner().integrations.connections({ key: 'stripe' });

    expect(data.find((connection) => connection.id === connectionId)?.usedBy).toContain(
      'Thank the buyer',
    );
  });

  it('refuses to remove a connection an active automation listens on, and keeps its webhook', async () => {
    await expect(
      t.owner().integrations.remove({ key: 'stripe', id: connectionId }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'CONNECTION_IN_USE',
      data: { automations: ['Thank the buyer'] },
    });

    expect(await subscriptions()).toHaveLength(1);
    expect(stripeCalls('DELETE', '/v1/webhook_endpoints/we_1')).toHaveLength(0);
  });

  it('turning the connection off stops its trigger, and turning it on listens again', async () => {
    await t.owner().integrations.update({ key: 'stripe', id: connectionId, status: 'disabled' });

    expect(await subscriptions()).toEqual([
      expect.objectContaining({ status: 'broken', lastError: 'The connection is off' }),
    ]);

    await t.owner().integrations.update({ key: 'stripe', id: connectionId, status: 'active' });
    await settle();

    expect(await subscriptions()).toEqual([
      expect.objectContaining({ status: 'listening', lastError: null }),
    ]);
  });

  it('removes the connection once its automations are paused, after the webhook is gone', async () => {
    await t.owner().automations.pause({ id: automationId });
    await settle();

    expect(stripeCalls('DELETE', '/v1/webhook_endpoints/we_1')).toHaveLength(1);
    expect(await subscriptions()).toEqual([]);

    await t.owner().integrations.remove({ key: 'stripe', id: connectionId });

    const { data } = await t.owner().integrations.connections({ key: 'stripe' });

    expect(data.map((connection) => connection.id)).not.toContain(connectionId);
  });
});

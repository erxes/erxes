import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { hmacSha256 } from '~/lib/crypto';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { settle } from './settle';

const SIGNING_SECRET = 'whsec_from_stripe';

const sign = (raw: string, at = Math.floor(Date.now() / 1000), secret = SIGNING_SECRET) =>
  `t=${at},v1=${hmacSha256(secret, `${at}.${raw}`, 'hex')}`;

const paymentEvent = (id: string, email: string) =>
  JSON.stringify({
    id,
    type: 'payment_intent.succeeded',
    data: { object: { id: `pi_${id}`, amount: 1500, currency: 'usd', receipt_email: email } },
  });

describe('app triggers', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  const stripe = fakeGateway([
    ['GET /v1/balance', { object: 'balance' }],
    ['POST /v1/webhook_endpoints/we_1', { id: 'we_1' }],
    ['DELETE /v1/webhook_endpoints/we_1', { id: 'we_1', deleted: true }],
    ['POST /v1/webhook_endpoints', { id: 'we_1', secret: SIGNING_SECRET }],
  ]);

  const stripeCalls = (method: string, path: string) =>
    stripe.calls.filter((call) => call.method === method && call.url.endsWith(path));

  let connectionId = '';
  let buyerId = '';

  const deliver = (raw: string, signature = sign(raw)) => {
    const [created] = stripeCalls('POST', '/v1/webhook_endpoints');
    const hookPath = new URL(new URLSearchParams(created?.body).get('url') ?? '').pathname;

    return fetch(t.url(hookPath), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'stripe-signature': signature },
      body: raw,
    });
  };

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

    buyerId = (await t.owner().customers.create({ primaryEmail: 'buyer@acme.mn' })).id;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('a signed Stripe payment starts one run about the buyer; forged and repeated deliveries start none', async () => {
    const catalog = await t.owner().automations.catalog();
    const app = catalog.apps.find((item) => item.key === 'stripe');

    expect(app?.connections.map((connection) => connection.id)).toEqual([connectionId]);
    expect(app?.triggers.map((trigger) => trigger.key)).toContain('payment_succeeded');

    const id = await t.active('Thank the buyer', {
      trigger: {
        kind: 'app',
        app: 'stripe',
        trigger: 'payment_succeeded',
        connectionId,
        subject: { type: 'customer', by: 'primaryEmail', field: 'receipt_email' },
      },
      steps: [{ id: 'wait', type: 'delay', amount: 1, unit: 'days' }],
    });

    await settle();

    const [created] = stripeCalls('POST', '/v1/webhook_endpoints');
    const form = new URLSearchParams(created?.body);

    expect(created?.auth).toBe('Bearer sk_test_shop');
    expect(form.getAll('enabled_events[]')).toEqual(['payment_intent.succeeded']);
    expect(form.get('url')).toContain('/core/v1/integrations/hooks/');

    const raw = paymentEvent('evt_1', 'buyer@acme.mn');

    expect((await deliver(raw, sign(raw, undefined, 'whsec_wrong'))).status).toBe(401);
    expect((await deliver(raw)).status).toBe(200);
    expect((await deliver(raw)).status).toBe(200);

    await settle();

    const runs = await t.runsOf(id);

    expect(runs).toHaveLength(1);
    expect(runs[0]?.subjectId).toBe(buyerId);
  });

  it('a second trigger widens the same Stripe webhook, and pausing both removes it', async () => {
    const failed = await t.active('Chase failed payments', {
      trigger: { kind: 'app', app: 'stripe', trigger: 'payment_failed', connectionId },
      steps: [{ id: 'wait', type: 'delay', amount: 1, unit: 'days' }],
    });

    await settle();

    const [updated] = stripeCalls('POST', '/v1/webhook_endpoints/we_1');

    expect(new URLSearchParams(updated?.body).getAll('enabled_events[]').toSorted()).toEqual([
      'payment_intent.payment_failed',
      'payment_intent.succeeded',
    ]);
    expect(stripeCalls('POST', '/v1/webhook_endpoints')).toHaveLength(1);

    const { data } = await t.owner().automations.list({ status: 'active' });

    await Promise.all(data.map((automation) => t.owner().automations.pause({ id: automation.id })));
    await settle();

    expect(stripeCalls('DELETE', '/v1/webhook_endpoints/we_1')).toHaveLength(1);
    expect(data.map((automation) => automation.id)).toContain(failed);
  });
});

import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { urlOf } from './fakeGateway';
import { useTwoOrgs } from './support';

describe('Golomt push notifications', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** What Golomt's inquiry says about the transaction. */
  let inquiry = 'PENDING';

  beforeAll(() => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);

      if (!url.startsWith('https://ecommerce.golomtbank.com/')) return realFetch(input, init);

      const reply = url.endsWith('/inquiry')
        ? { status: inquiry, amount: '1500' }
        : { invoice: 'GI-1', socialDeeplink: null };

      return Promise.resolve(new Response(JSON.stringify(reply), { status: 200 }));
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  const push = (body: unknown) =>
    fetch(t.url('/core/v1/payments/push/golomt'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  it('settles the invoice it names once Golomt confirms it, and asks again until then', async () => {
    const golomt = await t.owner().integrations.connect({
      name: 'Golomt',
      key: 'golomt',
      keys: { checksumKey: 'key', token: 'tok' },
    });

    const invoice = await t.hr().payments.createInvoice({
      gatewayId: golomt.id,
      amount: 150_000,
      currency: 'MNT',
      description: 'Order #1',
      referenceType: 'order',
      referenceId: 'g1',
    });

    // Golomt says paid, but its inquiry doesn't confirm it yet: Golomt is asked to send it again.
    expect((await push({ transactionId: invoice.id, errorCode: '000' })).status).toBe(503);
    expect((await t.hr().payments.getInvoice({ id: invoice.id })).status).toBe('pending');

    inquiry = 'SENT';

    expect((await push({ transactionId: invoice.id, errorCode: '000' })).status).toBe(200);
    expect((await t.hr().payments.getInvoice({ id: invoice.id })).status).toBe('paid');
    // Sent again, it changes nothing.
    expect((await push({ transactionId: invoice.id, errorCode: '000' })).status).toBe(200);
  });

  it('acknowledges an unsuccessful payment, and refuses what names no Golomt invoice', async () => {
    const test = await t.owner().integrations.connect({ name: 'Test', key: 'test', keys: {} });

    const other = await t.hr().payments.createInvoice({
      gatewayId: test.id,
      amount: 5000,
      description: 'Order #2',
      referenceType: 'order',
      referenceId: 'g2',
    });

    expect((await push({ transactionId: other.id, errorCode: '101' })).status).toBe(200);
    expect((await push({ transactionId: other.id, errorCode: '000' })).status).toBe(404);
    expect((await push({ transactionId: 'nope', errorCode: '000' })).status).toBe(404);
    expect((await push({ errorCode: '000' })).status).toBe(400);
  });
});

import { gatewayDriver } from '~/modules/integrations/registry';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { callbackSignature } from '~/modules/payments/invoiceState';
import { useTestDatabase } from './db';
import { fakeGateway, tugrugInvoice as invoice, urlOf } from './fakeGateway';
import { useTwoOrgs } from './support';

/** Toki's mini program saying a payment completed, with what else it names. */
const completed = (data: Record<string, unknown>) =>
  fakeGateway([
    ['/transaction-status', { statusCode: 200, data: { status: 'COMPLETED', ...data } }],
  ]);

describe('Toki mini program', () => {
  it('Toki without QR credentials gives only the mini program, settled from its callback', async () => {
    const gateway = fakeGateway([
      [
        '/jump/v1/shoppy/transaction-status?transRequestId=trq-1',
        { statusCode: 200, data: { status: 'COMPLETED' } },
      ],
    ]);

    const driver = gatewayDriver(
      'toki',
      { merchantId: 'm', sandbox: true },
      { fetch: gateway.fetch, cacheKey: 'toki-mini-test' },
    );

    await driver.verify();
    const created = await driver.createInvoice(invoice);

    expect(gateway.calls).toHaveLength(0);
    expect(created).toMatchObject({
      gatewayInvoiceId: 'inv1',
      payment: {
        qrText: null,
        inApp: {
          app: 'toki',
          data: {
            merchantId: 'm',
            amount: 1500,
            orderId: 'inv1',
            callbackUrl: invoice.callbackUrl,
          },
        },
      },
    });

    const posted = { orderID: 'inv1', transRequestId: 'trq-1', token: 'payer-token', amount: 1500 };
    const forThis = { invoiceId: 'inv1', amount: 150_000 };

    // Another order's or amount's payment brings nothing for this invoice.
    expect(driver.callback?.({ ...posted, orderID: 'inv2' }, forThis)).toBeNull();
    expect(driver.callback?.({ ...posted, amount: 1 }, forThis)).toBeNull();
    expect(driver.callback?.({ status: 'x' }, forThis)).toBeNull();

    const brought = driver.callback?.(posted, forThis);

    expect(await driver.check('inv1', 150_000, created.state ?? {})).toMatchObject({ paid: false });
    expect(gateway.calls).toHaveLength(0);

    expect(await driver.check('inv1', 150_000, { ...created.state, ...brought })).toEqual({
      paid: true,
      paidAmount: 150_000,
      paymentId: 'trq-1',
    });

    const call = gateway.calls.at(-1);

    expect(call?.url).toContain('https://staging-apps.toki.mn/');
    expect(call?.auth).toBe('bearer payer-token');

    await driver.cancel('inv1', 150_000, created.state ?? {});
    expect(gateway.calls).toHaveLength(1);
  });

  it('Toki refuses a completed mini-program payment Toki says was for another order or amount', async () => {
    const state = { tokiOrderId: 'inv1', tokiTransRequestId: 'trq-1', tokiPayerToken: 't' };

    for (const data of [{ orderId: 'inv2' }, { amount: 99 }, { merchantId: 'other' }]) {
      const driver = gatewayDriver(
        'toki',
        { merchantId: 'm' },
        { fetch: completed(data).fetch, cacheKey: 'toki-mini-mismatch' },
      );

      await expect(driver.check('inv1', 150_000, state)).rejects.toThrow(
        /another order|amount|merchant/,
      );
    }
  });
});

/** A ₮1,500 order's invoice. */
const order = (id: string) => ({
  amount: 150_000,
  currency: 'MNT',
  description: `Order #${id}`,
  referenceType: 'order',
  referenceId: id,
});

describe('Toki mini program through core', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** Toki's mini program: a payment completes once its payer token is `good`. */
  beforeAll(() => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      if (!urlOf(input).startsWith('https://apps.toki.mn/')) return realFetch(input, init);

      const done = new Headers(init?.headers).get('authorization') === 'bearer good';

      return Promise.resolve(
        new Response(
          JSON.stringify({
            statusCode: 200,
            data: { status: done ? 'COMPLETED' : 'PENDING' },
          }),
          { status: 200 },
        ),
      );
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  /** Toki posting a payment to the invoice's callback address. */
  const callback = (id: string, token: string, transRequestId = 'trq-1') =>
    fetch(t.url(`/core/v1/payments/callback/${id}/${callbackSignature(id)}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderID: id, transRequestId, token, amount: 1500 }),
    });

  it('gives the shop page what Toki’s buy() takes, and settles the invoice from Toki’s callback once', async () => {
    await t.owner().integrations.connect({ name: 'Toki', key: 'toki', keys: { merchantId: 'm' } });

    const first = await t.hr().payments.createInvoice(order('t1'));

    expect(first.payment).toMatchObject({
      qrText: null,
      inApp: { app: 'toki', data: { merchantId: 'm', amount: 1500, orderId: first.id } },
    });

    // Not completed at Toki: the invoice waits.
    await callback(first.id, 'not-yet');
    expect((await t.hr().payments.getInvoice({ id: first.id })).status).toBe('pending');

    await callback(first.id, 'good');
    expect((await t.hr().payments.getInvoice({ id: first.id })).status).toBe('paid');

    // The same Toki payment, replayed to another order, doesn't pay it.
    const second = await t.hr().payments.createInvoice(order('t2'));

    await callback(second.id, 'good');
    expect((await t.hr().payments.getInvoice({ id: second.id })).status).toBe('pending');

    // The payer token is the invoice's own: never shown.
    expect(JSON.stringify(await t.hr().payments.getInvoice({ id: first.id }))).not.toContain(
      'good',
    );
  });
});

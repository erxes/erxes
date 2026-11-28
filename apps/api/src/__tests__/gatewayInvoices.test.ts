import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { QPAY_KEYS, qpayAnswers, qpayTokens } from './qpaySandbox';
import { useTwoOrgs } from './support';

/** Invoices through a connected gateway: what core asks of it, and what its answers become. */
describe('gateway invoices', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const qpay = qpayTokens();

  beforeAll(() => {
    qpayAnswers(qpay.fetch);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('keeps a gateway that has invoices, and clears the default when that gateway is removed', async () => {
    const spare = await t.owner().integrations.connect({ key: 'test', name: 'Default', keys: {} });
    const billed = await t.owner().integrations.connect({ key: 'test', name: 'Billed', keys: {} });

    await t.owner().payments.saveSettings({ defaultGatewayId: spare.id });
    await t.owner().payments.createInvoice({
      amount: 1_000,
      currency: 'MNT',
      description: 'Kept',
      referenceType: 'order',
      referenceId: 'kept',
      gatewayId: billed.id,
    });

    await expect(
      t.owner().integrations.remove({ key: 'test', id: billed.id }),
    ).rejects.toMatchObject({ code: 'GATEWAY_IN_USE' });
    expect(await t.owner().integrations.remove({ key: 'test', id: spare.id })).toEqual({
      ok: true,
    });
    expect((await t.owner().payments.settings()).defaultGatewayId).toBeNull();
  });

  it('turns a gateway’s refusal into GATEWAY_REFUSED but not a failure to reach it, and cancels with the gateway', async () => {
    const bills = fakeGateway([
      ['/auth/token', { access_token: 'tok', expires_in: Math.floor(Date.now() / 1000) + 3600 }],
      ['POST /invoice', { invoice_id: 'q-7', qr_text: 'QR7', urls: [] }],
      ['DELETE /invoice/', {}],
      ['/payment/check', { count: 0, paid_amount: 0, rows: [] }],
    ]);

    const gateway = await t.owner().integrations.connect({
      key: 'qpay',
      name: 'QPay bills',
      keys: QPAY_KEYS,
    });

    const bill = (referenceId: string) =>
      t.owner().payments.createInvoice({
        amount: 150_000,
        currency: 'MNT',
        description: 'Bill',
        referenceType: 'order',
        referenceId,
        gatewayId: gateway.id,
      });

    qpayAnswers(bills.fetch);

    const invoice = await bill('q-bill');

    expect(invoice).toMatchObject({ gatewayKind: 'qpay', payment: { qrText: 'QR7' } });
    await expect(t.owner().payments.payTestInvoice({ id: invoice.id })).rejects.toMatchObject({
      code: 'NOT_TEST',
    });
    expect(await t.owner().payments.cancelInvoice({ id: invoice.id })).toMatchObject({
      status: 'cancelled',
    });
    expect(bills.calls.filter((call) => call.method === 'DELETE').map((call) => call.url)).toEqual([
      'https://merchant-sandbox.qpay.mn/v2/invoice/q-7',
    ]);

    const cancelled = (await t.owner().events.list({ type: 'core.payment.cancelled' })).data;

    expect(cancelled.map(({ entityType, entityId }) => [entityType, entityId])).toEqual([
      ['payment_invoice', invoice.id],
    ]);

    qpayAnswers(fakeGateway([['/auth/token', { access_token: 'tok' }]]).fetch);
    await expect(bill('q-refused')).rejects.toMatchObject({
      status: 400,
      code: 'GATEWAY_REFUSED',
    });

    qpayAnswers((input, init) =>
      urlOf(input).endsWith('/invoice')
        ? Promise.reject(new TypeError('fetch failed'))
        : bills.fetch(input, init),
    );
    await expect(bill('q-unreachable')).rejects.toMatchObject({ status: 500 });
  });
});

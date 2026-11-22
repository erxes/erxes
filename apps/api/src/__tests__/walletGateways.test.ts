import { describe, expect, it } from 'vite-plus/test';
import { gatewayOf, openGateway } from '~/modules/integrations/registry';
import { fakeGateway, refusal, tugrugInvoice } from './fakeGateway';

const invoiceOf = (gatewayInvoiceId: string, state: Record<string, unknown> = {}) => ({
  gatewayInvoiceId,
  amount: 150_000,
  state,
});

const refund = { paymentId: 'p', amount: 150_000, note: '', state: {} };
const UNPAID = { paid: false, paidAmount: 0, paymentId: null };

let connections = 0;

const open = (key: string, keys: Record<string, unknown>, routes: [string, unknown, number?][]) => {
  const gateway = fakeGateway(routes);

  return {
    gateway,
    ...openGateway(key, keys, { fetch: gateway.fetch, cacheKey: `${key}-${++connections}` }),
  };
};

describe('Pocket driver', () => {
  const POCKET = 'https://service.invescore.mn/merchant/v2/invoicing';
  const keys = { terminalId: '9', clientId: 'c', clientSecret: 's' };

  const connect = (routes: [string, unknown, number?][]) =>
    open('pocket', keys, [['/openid-connect/token', { access_token: 'pk' }], ...routes]);

  it('makes an e-commerce invoice for the terminal, with the app link when Pocket gives one', async () => {
    const { gateway, payments, client } = connect([
      ['/generate-invoice', { id: 501, qr: 'POCKETQR', deeplink: 'pocket://pay/501' }],
    ]);

    expect(await payments.createInvoice(client, tugrugInvoice)).toMatchObject({
      gatewayInvoiceId: '501',
      payment: {
        qrText: 'POCKETQR',
        links: [{ name: 'Pocket', logo: null, link: 'pocket://pay/501' }],
      },
    });
    expect(gateway.calls.at(-1)).toMatchObject({
      method: 'POST',
      url: `${POCKET}/generate-invoice`,
    });
    expect(gateway.sent('/generate-invoice')).toEqual({
      terminalId: 9,
      amount: 1500,
      info: 'Order #1',
      orderNumber: 'inv1',
      invoiceType: 'ZERO',
      channel: 'ecommerce',
    });

    const plain = connect([['/generate-invoice', { id: 502, qr: 'QR2' }]]);

    expect((await plain.payments.createInvoice(plain.client, tugrugInvoice)).payment.links).toEqual(
      [],
    );
  });

  it('reads only a paid invoice as paid, fails unreadable answers, and makes no refunds', async () => {
    const { gateway, payments, client } = connect([
      ['/generate-invoice', { id: 501 }],
      ['/invoices/invoice-id', { state: 'unpaid' }],
    ]);

    expect(await payments.check(client, invoiceOf('501'))).toEqual(UNPAID);
    expect(gateway.calls.at(-1)).toMatchObject({
      method: 'POST',
      url: `${POCKET}/invoices/invoice-id`,
    });
    await expect(payments.createInvoice(client, tugrugInvoice)).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'Pocket gave no invoice',
    });

    const down = connect([['/generate-invoice', { error: 'down' }, 500]]);

    const failed = await refusal(down.payments.createInvoice(down.client, tugrugInvoice));

    expect(failed.status).toBe(500);
    expect(failed.message).toMatch(/^Pocket \/generate-invoice answered 500/);

    const odd = connect([['/invoices/invoice-id', { status: 'paid' }]]);

    await expect(odd.payments.check(odd.client, invoiceOf('501'))).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'Pocket gave an unreadable check',
    });
    await expect(payments.refund(client, refund)).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'Pocket makes no refunds',
    });
  });

  it('refuses a terminal id that is not a positive number', async () => {
    const { client } = open('pocket', { ...keys, terminalId: '0' }, []);

    await expect(gatewayOf('pocket').verify(client)).rejects.toMatchObject({
      name: 'GatewayError',
      status: 400,
    });
  });
});

describe('Toki driver', () => {
  const keys = { merchantId: 'm', username: 'u', password: 'p' };

  const connect = (routes: [string, unknown, number?][]) =>
    open('toki', keys, [['/auth/token', { data: { accessToken: 'tk' } }], ...routes]);

  it('says why Toki gave no token', async () => {
    for (const [answer, reason] of [
      [{ code: 401, error: 'Bad password' }, 'Bad password'],
      [{ code: 401, error: { message: 'Locked' } }, 'Locked'],
      [{ code: 418, error: {} }, '418'],
    ] as const) {
      const { client } = open('toki', keys, [['/auth/token', answer]]);

      expect((await refusal(gatewayOf('toki').verify(client))).message).toBe(
        `Toki gave no access token: ${reason}`,
      );
    }
  });

  it('requests a merchant QR payment by POST and keeps the request id when there is no transaction id', async () => {
    const { gateway, payments, client } = connect([
      ['/merchant-qr', { code: 200, data: { requestId: 'req-2' } }],
    ]);

    expect(await payments.createInvoice(client, tugrugInvoice)).toMatchObject({
      gatewayInvoiceId: 'req-2',
      payment: { qrText: 'req-2' },
      state: { tokiTransactionId: 'req-2' },
    });
    expect(gateway.calls.at(-1)).toMatchObject({
      method: 'POST',
      url: 'https://ms-api.toki.mn/third-party-service/v1/payment-request/merchant-qr',
      auth: 'Bearer tk',
    });
    expect(gateway.sent('/merchant-qr')).toEqual({
      successUrl: tugrugInvoice.callbackUrl,
      failureUrl: tugrugInvoice.callbackUrl,
      orderId: 'inv1',
      amount: 1500,
      notes: 'Order #1',
      merchantId: 'm',
    });
  });

  it('refuses a payment request Toki did not make', async () => {
    for (const answer of [
      { code: 500, data: { requestId: 'req-3' } },
      { code: 200, error: 'busy' },
      { code: 200, data: { requestId: '' } },
    ]) {
      const { payments, client } = connect([['/merchant-qr', answer]]);

      await expect(payments.createInvoice(client, tugrugInvoice)).rejects.toMatchObject({
        name: 'GatewayError',
      });
    }

    const { payments, client } = connect([
      ['/merchant-qr', { code: 200, data: { requestId: '' } }],
    ]);

    await expect(payments.createInvoice(client, tugrugInvoice)).rejects.toMatchObject({
      message: 'Toki gave no payment request',
    });
  });

  it('checks by the transaction id, pays only an approved request, cancels by PATCH, and makes no refunds', async () => {
    const { gateway, payments, client } = connect([
      ['/status?requestId=tx-1', { code: 200, data: { status: 'APPROVED' } }],
      ['/status?requestId=req-4', { code: 200, data: { status: 'PENDING' } }],
      ['/status?requestId=req-5', { code: 404, error: 'Unknown request' }],
      ['/status?requestId=req-6', { data: [] }],
      ['PATCH /payment-request/req-1', {}],
    ]);

    expect(await payments.check(client, invoiceOf('req-1', { tokiTransactionId: 'tx-1' }))).toEqual(
      { paid: true, paidAmount: 150_000, paymentId: 'tx-1' },
    );
    expect(await payments.check(client, invoiceOf('req-4'))).toEqual(UNPAID);
    expect((await refusal(payments.check(client, invoiceOf('req-5')))).message).toContain(
      'Unknown request',
    );
    await expect(payments.check(client, invoiceOf('req-6'))).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'Toki gave an unreadable check',
    });
    await payments.cancel(client, invoiceOf('req-1'));
    expect(gateway.calls.at(-1)?.method).toBe('PATCH');
    await expect(payments.refund(client, refund)).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'Toki makes no refunds',
    });
  });
});

const MONPAY = 'https://wallet.monpay.mn/rest/branch/qrpurchase';

const monpay = (routes: [string, unknown, number?][]) =>
  open('monpay', { username: 'branch', accountId: 'acc' }, routes);

describe('MonPay driver', () => {
  const AUTH = `Basic ${Buffer.from('branch:acc').toString('base64')}`;

  it('generates a QR purchase with a uuid by POST, and refuses one MonPay did not make', async () => {
    const { gateway, payments, client } = monpay([
      ['/generate', { code: 0, result: { qrcode: 'MONPAYQR', uuid: 'u-1' } }],
    ]);

    expect(await payments.createInvoice(client, tugrugInvoice)).toMatchObject({
      gatewayInvoiceId: 'u-1',
      payment: { qrText: 'MONPAYQR', shortUrl: null, links: [] },
    });
    expect(gateway.calls[0]).toMatchObject({
      method: 'POST',
      url: `${MONPAY}/generate`,
      auth: AUTH,
    });
    expect(gateway.sent('/generate')).toEqual({
      amount: 1500,
      generateUuid: true,
      displayName: 'Order #1',
      callbackUrl: tugrugInvoice.callbackUrl,
    });

    for (const [answer, message] of [
      [{ code: 7, info: 'Limit', result: { qrcode: 'Q', uuid: 'u' } }, 'Limit'],
      [{ code: 0, result: { uuid: 'u' } }, '0'],
      [{ code: 0, result: { qrcode: 'Q' } }, '0'],
      [{ info: 'no code' }, 'MonPay gave no QR'],
    ] as const) {
      const refused = monpay([['/generate', answer]]);

      expect(
        (await refusal(refused.payments.createInvoice(refused.client, tugrugInvoice))).message,
      ).toContain(message);
    }
  });

  it('checks with its credentials, fails a code that is neither paid nor waiting, and makes no refunds', async () => {
    const { gateway, payments, client } = monpay([
      ['/check?uuid=u-5', { code: 5, info: 'Expired' }],
      ['/check?uuid=u-6', { info: 'no code' }],
    ]);

    expect((await refusal(payments.check(client, invoiceOf('u-5')))).message).toContain('Expired');
    expect(gateway.calls[0]).toMatchObject({
      method: 'GET',
      url: `${MONPAY}/check?uuid=u-5`,
      auth: AUTH,
    });
    await expect(payments.check(client, invoiceOf('u-6'))).rejects.toMatchObject({
      message: 'MonPay gave an unreadable check',
    });
    await expect(payments.refund(client, refund)).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'MonPay makes no refunds',
    });
  });

  it('verifies with a check of a made-up QR, which wrong credentials refuse', async () => {
    const known = monpay([['/check?uuid=probe', { code: 23 }]]);

    await gatewayOf('monpay').verify(known.client);
    expect(known.gateway.calls[0]?.url).toMatch(
      new RegExp(`^${MONPAY}/check\\?uuid=probe[0-9a-z]+$`),
    );

    const refused = monpay([['/check', { error: 'unauthorized' }, 401]]);
    const failed = await refusal(gatewayOf('monpay').verify(refused.client));

    expect(failed.status).toBe(401);
    expect(failed.message).toMatch(/^MonPay \/check answered 401/);
  });
});

import { describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { hmacSha256 } from '~/lib/crypto';
import { gatewayOf, openGateway } from '~/modules/integrations/registry';
import { fakeGateway, refusal, tugrugInvoice } from './fakeGateway';

const Probe = z.object({ amount: z.string(), callback: z.string(), transactionId: z.string() });

const invoiceOf = (gatewayInvoiceId: string, state: Record<string, unknown> = {}) => ({
  gatewayInvoiceId,
  amount: 150_000,
  state,
});

const UNPAID = { paid: false, paidAmount: 0, paymentId: null };
const refund = { paymentId: 'p', amount: 150_000, note: '', state: {} };

const GOLOMT = 'https://ecommerce.golomtbank.com';

const golomt = (routes: [string, unknown, number?][]) => {
  const gateway = fakeGateway(routes);

  return {
    gateway,
    ...openGateway('golomt', { checksumKey: 'ck', token: 'gt' }, { fetch: gateway.fetch }),
  };
};

describe('Golomt driver', () => {
  const connect = golomt;

  it('makes a signed GET-return invoice with the merchant token, and links SocialPay only when given', async () => {
    const { gateway, payments, client } = connect([['/api/invoice', { invoice: 'G-INV' }]]);
    const page = `${GOLOMT}/payment/mn/G-INV`;

    expect((await payments.createInvoice(client, tugrugInvoice)).payment).toMatchObject({
      qrText: page,
      shortUrl: page,
      links: [{ name: 'Golomt', logo: null, link: page }],
    });
    expect(gateway.calls[0]).toMatchObject({
      method: 'POST',
      url: `${GOLOMT}/api/invoice`,
      auth: 'Bearer gt',
    });
    expect(gateway.sent('/api/invoice')).toEqual({
      amount: '1500',
      callback: tugrugInvoice.returnUrl,
      checksum: hmacSha256('ck', `inv11500GET${tugrugInvoice.returnUrl}`, 'hex'),
      genToken: 'N',
      returnType: 'GET',
      socialDeeplink: 'Y',
      transactionId: 'inv1',
    });

    const social = connect([['/api/invoice', { invoice: 'G-2', socialDeeplink: 'socialpay://g' }]]);

    expect(
      (await social.payments.createInvoice(social.client, tugrugInvoice)).payment.links,
    ).toEqual([
      { name: 'Golomt', logo: null, link: `${GOLOMT}/payment/mn/G-2` },
      { name: 'SocialPay', logo: null, link: 'socialpay://g' },
    ]);
  });

  it('refuses an invoice Golomt did not make, with its reason', async () => {
    for (const [answer, message] of [
      [{ message: 'Bad checksum' }, 'Bad checksum'],
      [{ invoice: 7 }, 'Golomt gave no invoice'],
    ] as const) {
      const { payments, client } = connect([['/api/invoice', answer]]);

      expect((await refusal(payments.createInvoice(client, tugrugInvoice))).message).toContain(
        message,
      );
    }
  });

  it('pays only a SENT inquiry of the whole amount, and makes no refunds', async () => {
    const { gateway, payments, client } = connect([['/api/inquiry', { status: 'SENT' }]]);

    expect(await payments.check(client, invoiceOf('inv1'))).toEqual({
      paid: true,
      paidAmount: 150_000,
      paymentId: 'inv1',
    });
    expect(gateway.calls[0]).toMatchObject({
      method: 'POST',
      url: `${GOLOMT}/api/inquiry`,
      auth: 'Bearer gt',
    });

    const check = (answer: unknown) => {
      const opened = connect([['/api/inquiry', answer]]);

      return opened.payments.check(opened.client, invoiceOf('inv1'));
    };

    expect(await check({ status: 'SENT', amount: '1000' })).toEqual({
      paid: false,
      paidAmount: 100_000,
      paymentId: 'inv1',
    });
    expect(await check({ status: 'PENDING', amount: '1500' })).toEqual(UNPAID);
    await expect(check({ status: 7 })).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'Golomt gave an unreadable inquiry',
    });
    await expect(payments.refund(client, refund)).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'Golomt refunds are made in the bank’s merchant portal',
    });
  });

  it('verifies with a ₮1 invoice back to its own site, which a wrong token refuses', async () => {
    const { gateway, client } = connect([['/api/invoice', { invoice: 'G-PROBE' }]]);

    await gatewayOf('golomt').verify(client);

    const probe = Probe.parse(gateway.sent('/api/invoice'));

    expect([probe.amount, probe.callback]).toEqual(['1', `${GOLOMT}/`]);
    expect(probe.transactionId).toMatch(/^probe/);

    const refused = connect([['/api/invoice', { error: 'unauthorized' }, 401]]);
    const { status, message } = await refusal(gatewayOf('golomt').verify(refused.client));

    expect(status).toBe(401);
    expect(message).toMatch(/^Golomt \/invoice answered 401/);
  });
});

describe('TDB driver', () => {
  const TDB = 'https://tdb.test:8000';
  const AUTH = `Basic ${Buffer.from('u:p').toString('base64')}`;

  const connect = (routes: [string, unknown, number?][]) => {
    const gateway = fakeGateway(routes);

    const { payments, client } = openGateway(
      'tdb',
      { username: 'u', password: 'p', apiUrl: `${TDB}//` },
      { fetch: gateway.fetch },
    );

    return { gateway, payments, client, verify: () => gatewayOf('tdb').verify(client) };
  };

  it('makes an MNT order in Mongolian with Basic auth at the API address', async () => {
    const { gateway, payments, client } = connect([
      ['POST /order', { order: { id: 31, password: 'pw', hppUrl: 'https://hpp.tdb.mn/flex' } }],
    ]);

    expect((await payments.createInvoice(client, tugrugInvoice)).payment).toMatchObject({
      links: [{ name: 'TDB', logo: null, link: 'https://hpp.tdb.mn/flex?id=31&password=pw' }],
    });
    expect(gateway.calls[0]).toMatchObject({ method: 'POST', url: `${TDB}/order`, auth: AUTH });
    expect(gateway.sent('/order')).toEqual({
      order: {
        typeRid: '1',
        amount: 1500,
        currency: 'MNT',
        description: 'Order #1',
        language: 'mn',
        hppRedirectUrl: tugrugInvoice.returnUrl,
      },
    });

    const odd = connect([['POST /order', { order: { id: 31 } }]]);

    await expect(odd.payments.createInvoice(odd.client, tugrugInvoice)).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'TDB gave no order',
    });
  });

  it('reads the order with its password, paid in any letter case, and only for the whole amount', async () => {
    const { gateway, payments, client } = connect([
      ['/order/1?', { order: { status: 'Paid' } }],
      ['/order/2?', { order: { status: 'FullyPaid', amount: 1000 } }],
      ['/order/3?', { order: { status: 'Created', amount: 1500 } }],
      ['/order/4?', { order: { amount: 1500 } }],
      ['/order/5?', { status: 'Paid' }],
    ]);

    const check = (id: string) => payments.check(client, invoiceOf(id, { tdbPassword: 'pw' }));

    expect(await check('1')).toEqual({ paid: true, paidAmount: 150_000, paymentId: '1' });
    expect(gateway.calls[0]).toMatchObject({
      method: 'GET',
      url: `${TDB}/order/1?password=pw`,
      auth: AUTH,
    });
    expect(await check('2')).toEqual({ paid: false, paidAmount: 100_000, paymentId: '2' });
    expect(await check('3')).toEqual(UNPAID);
    expect(await check('4')).toEqual(UNPAID);
    await expect(check('5')).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'TDB gave an unreadable order',
    });
    await expect(payments.refund(client, refund)).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'TDB refunds are made in the bank’s merchant portal',
    });
  });

  it('keeps the order password out of its error', async () => {
    const { payments, client } = connect([['/order/9?', { error: 'down' }, 500]]);

    const { status, message } = await refusal(
      payments.check(client, invoiceOf('9', { tdbPassword: 'secret-pw' })),
    );

    expect(status).toBe(500);
    expect(message).toMatch(/^TDB \/order\/9 answered 500/);
    expect(message).not.toContain('secret-pw');
  });

  it('verifies by reading a made-up order, which only wrong credentials refuse', async () => {
    const unknown = connect([['/order/', { error: 'no order' }, 404]]);

    await unknown.verify();
    expect(unknown.gateway.calls[0]).toMatchObject({
      url: `${TDB}/order/0?password=0`,
      auth: AUTH,
    });

    for (const status of [401, 403])
      await expect(
        connect([['/order/', { error: 'unauthorized' }, status]]).verify(),
      ).rejects.toMatchObject({ name: 'GatewayError', status });
  });
});

import { describe, expect, it } from 'vite-plus/test';
import { gatewayOf, openGateway } from '~/modules/integrations/registry';
import { fakeGateway, refusal, tugrugInvoice } from './fakeGateway';

const SUCCESS = { code: '1', description: 'SUCCESS' };
const BASE = 'https://hipay.test/v2';

const connect = (routes: [string, unknown, number?][]) => {
  const gateway = fakeGateway(routes);

  const { payments, client } = openGateway(
    'hipay',
    { entityId: 'e1', clientSecret: 'hs', apiUrl: `${BASE}//` },
    { fetch: gateway.fetch },
  );

  const invoice = { gatewayInvoiceId: 'HPS1', amount: 150_000, state: {} };
  const verify = () => gatewayOf('hipay').verify(client);

  return { gateway, payments, client, invoice, verify };
};

describe('HiPay driver', () => {
  it('makes a checkout payers open by QR, app or card form at the API address', async () => {
    const { gateway, payments, client } = connect([
      ['POST /checkout', [{ ...SUCCESS, checkoutId: 'HPS 1' }]],
    ]);

    const form = `${BASE}/payment?checkoutId=HPS+1`;

    expect(
      await payments.createInvoice(client, { ...tugrugInvoice, description: 'd'.repeat(300) }),
    ).toMatchObject({
      gatewayInvoiceId: 'HPS 1',
      payment: {
        qrText: form,
        shortUrl: form,
        links: [
          { name: 'HiPay', logo: null, link: `${BASE}/pay/HPS%201` },
          { name: 'HiPay card', logo: null, link: form },
        ],
      },
    });
    expect(gateway.calls[0]?.url).toBe(`${BASE}/checkout`);
    expect(gateway.sent('/checkout')).toEqual({
      entityId: 'e1',
      amount: 1500,
      qrData: true,
      txndesc: 'd'.repeat(255),
      redirect_uri: tugrugInvoice.returnUrl,
      webhook_url: tugrugInvoice.callbackUrl,
    });
  });

  it('refuses a checkout HiPay did not make, with its reason', async () => {
    for (const [answer, reason] of [
      [
        [{ description: 'FAILED', message: 'Amount too small', checkoutId: 'HPS1' }],
        'Amount too small',
      ],
      [{ description: 'SUCCESS' }, 'SUCCESS'],
      [[{ description: 'DENIED' }], 'DENIED'],
      [[{}], 'refused'],
    ] as const) {
      const { payments, client } = connect([['POST /checkout', answer]]);

      expect((await refusal(payments.createInvoice(client, tugrugInvoice))).message).toContain(
        reason,
      );
    }

    const { payments, client } = connect([['POST /checkout', 'oops']]);

    expect((await refusal(payments.createInvoice(client, tugrugInvoice))).message).toBe(
      'HiPay gave no checkout',
    );
  });

  it('checks the checkout with the client secret and pays only a paid checkout of the whole amount', async () => {
    const answers: [string, unknown][] = [
      ['/checkout/get/A?', [{ status: 'paid', amount: 1500, paymentId: 'pay-1' }]],
      ['/checkout/get/B?', [{ status: 'paid' }]],
      ['/checkout/get/C?', [{ status: 'paid', amount: 1000, paymentId: 'pay-3' }]],
      ['/checkout/get/D?', [{ status: 'pending', amount: 1500, paymentId: 'pay-4' }]],
      ['/checkout/get/E?', 'oops'],
    ];

    const { gateway, payments, client, invoice } = connect(answers);

    const check = (gatewayInvoiceId: string) =>
      payments.check(client, { ...invoice, gatewayInvoiceId });

    expect(await check('A')).toEqual({ paid: true, paidAmount: 150_000, paymentId: 'pay-1' });
    expect(gateway.calls.at(-1)).toMatchObject({
      method: 'GET',
      url: `${BASE}/checkout/get/A?entityId=e1`,
      auth: 'Bearer hs',
    });
    expect(await check('B')).toEqual({ paid: true, paidAmount: 150_000, paymentId: null });
    expect(await check('C')).toEqual({ paid: false, paidAmount: 100_000, paymentId: 'pay-3' });
    expect(await check('D')).toEqual({ paid: false, paidAmount: 0, paymentId: null });
    expect((await refusal(check('E'))).message).toBe('HiPay gave an unreadable checkout');
  });

  it('cancels a checkout and refunds a payment whole, and fails what HiPay refuses', async () => {
    const done = connect([
      ['POST /checkout/cancel', [SUCCESS]],
      ['POST /payment/cancel', [{ ...SUCCESS, correction_paymentId: 9 }]],
    ]);

    await done.payments.cancel(done.client, done.invoice);
    expect(
      await done.payments.refund(done.client, {
        paymentId: 'pay-1',
        amount: 150_000,
        note: '',
        state: {},
      }),
    ).toEqual({ refundId: '9' });
    expect(done.gateway.sent('/payment/cancel')).toEqual({ entityId: 'e1', paymentId: 'pay-1' });

    const refund = { paymentId: 'pay-1', amount: 150_000, note: '', state: {} };

    for (const [answer, message] of [
      [[{ description: 'FAILED', message: 'Too late' }], 'Too late'],
      ['oops', 'HiPay gave an unreadable answer'],
    ] as const) {
      const { payments, client, invoice } = connect([['POST /checkout/cancel', answer]]);

      expect((await refusal(payments.cancel(client, invoice))).message).toContain(message);
    }

    for (const [answer, message] of [
      [[{ description: 'FAILED', message: 'Too late' }], 'Too late'],
      ['oops', 'HiPay gave an unreadable refund'],
    ] as const) {
      const { payments, client } = connect([['POST /payment/cancel', answer]]);

      expect((await refusal(payments.refund(client, refund))).message).toContain(message);
    }
  });

  it('verifies by a check that only wrong credentials refuse', async () => {
    const unknown = connect([['/checkout/get/', { error: 'no checkout' }, 404]]);

    await unknown.verify();
    expect(unknown.gateway.calls[0]).toMatchObject({
      url: `${BASE}/checkout/get/0?entityId=e1`,
      auth: 'Bearer hs',
    });

    for (const status of [401, 403]) {
      const failed = await refusal(
        connect([['/checkout/get/', { error: 'unauthorized' }, status]]).verify(),
      );

      expect(failed.status).toBe(status);
      expect(failed.message).toMatch(/^HiPay \/checkout\/get\/0 answered 40/);
    }
  });
});

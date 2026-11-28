import { describe, expect, it } from 'vite-plus/test';
import { openGateway } from '~/modules/integrations/registry';
import { fakeGateway, refusal } from './fakeGateway';

const yen = {
  invoiceId: 'inv9',
  amount: 500,
  currency: 'JPY',
  description: 'y'.repeat(200),
  callbackUrl: 'https://erxes.test/cb/inv9/s',
  returnUrl: 'https://erxes.test/cb/inv9/s/return',
  payerEmail: 'payer@acme.jp',
};

const captured = (status: string, value: string, currency = 'JPY') => ({
  id: 'O-1',
  status: 'COMPLETED',
  purchase_units: [
    {
      payments: { captures: [{ id: 'CAP-1', status, amount: { value, currency_code: currency } }] },
    },
  ],
});

let connections = 0;

const connect = (routes: [string, unknown, number?][]) => {
  const gateway = fakeGateway([['/v1/oauth2/token', { access_token: 'pp' }], ...routes]);

  const { payments, client } = openGateway(
    'paypal',
    { clientId: 'c', clientSecret: 's' },
    { fetch: gateway.fetch, cacheKey: `paypal-${++connections}` },
  );

  const check = (amount = 500) =>
    payments.check(client, { gatewayInvoiceId: 'O-1', amount, state: {} });

  return { gateway, payments, client, check };
};

describe('PayPal driver', () => {
  it('opens a pay-now order in the invoice’s currency once per invoice, and sends the payer to approve it', async () => {
    const { gateway, payments, client } = connect([
      [
        'POST /v2/checkout/orders',
        {
          id: 'O-1',
          status: 'PAYER_ACTION_REQUIRED',
          links: [
            { rel: 'self', href: 'https://api-m.paypal.com/v2/checkout/orders/O-1' },
            { rel: 'approve', href: 'https://paypal.test/approve' },
          ],
        },
      ],
    ]);

    const created = await payments.createInvoice(client, yen);

    expect(created).toMatchObject({
      gatewayInvoiceId: 'O-1',
      payment: {
        shortUrl: 'https://paypal.test/approve',
        links: [{ name: 'PayPal', logo: null, link: 'https://paypal.test/approve' }],
      },
      state: { paypalCurrency: 'JPY' },
    });

    const order = gateway.calls[1];

    expect(order?.headers.get('paypal-request-id')).toBe('create-inv9');
    expect(gateway.sent('/v2/checkout/orders')).toEqual({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: 'inv9',
          description: 'y'.repeat(127),
          amount: { currency_code: 'JPY', value: '500' },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            user_action: 'PAY_NOW',
            return_url: yen.returnUrl,
            cancel_url: yen.returnUrl,
          },
          email_address: 'payer@acme.jp',
        },
      },
    });
  });

  it('fails with a GatewayError when PayPal gives no page to approve or an unreadable order', async () => {
    const { payments, client } = connect([
      [
        'POST /v2/checkout/orders',
        { id: 'O-1', status: 'CREATED', links: [{ rel: 'self', href: 'x' }] },
      ],
      ['GET /v2/checkout/orders/O-1', { status: 'APPROVED' }],
    ]);

    await refusal(payments.createInvoice(client, yen));
    expect(
      (await refusal(payments.check(client, { gatewayInvoiceId: 'O-1', amount: 500, state: {} })))
        .message,
    ).toBe('PayPal gave an unreadable order');
  });

  it('captures an approved order once, and pays only a completed capture of the whole amount', async () => {
    const approved = connect([
      ['/capture', captured('COMPLETED', '500')],
      ['GET /v2/checkout/orders/O-1', { id: 'O-1', status: 'APPROVED' }],
    ]);

    expect(await approved.check()).toEqual({ paid: true, paidAmount: 500, paymentId: 'CAP-1' });

    const capture = approved.gateway.calls.at(-1);

    expect([capture?.method, capture?.url, capture?.body]).toEqual([
      'POST',
      'https://api-m.paypal.com/v2/checkout/orders/O-1/capture',
      '{}',
    ]);
    expect(capture?.headers.get('paypal-request-id')).toBe('capture-O-1');

    const completed = connect([['GET /v2/checkout/orders/O-1', captured('COMPLETED', '500')]]);

    expect(await completed.check()).toEqual({ paid: true, paidAmount: 500, paymentId: 'CAP-1' });
    expect(completed.gateway.calls.map((call) => call.method)).toEqual(['POST', 'GET']);

    const short = connect([['GET /v2/checkout/orders/O-1', captured('COMPLETED', '400')]]);

    expect(await short.check()).toEqual({ paid: false, paidAmount: 400, paymentId: 'CAP-1' });
  });

  it('reads an order without a completed capture as unpaid', async () => {
    const unpaid = { paid: false, paidAmount: 0, paymentId: null };

    for (const order of [
      { id: 'O-1', status: 'CREATED' },
      { id: 'O-1', status: 'CREATED', purchase_units: [] },
      { id: 'O-1', status: 'CREATED', purchase_units: [{}] },
      { id: 'O-1', status: 'CREATED', purchase_units: [{ payments: {} }] },
      captured('PENDING', '500'),
    ])
      expect(await connect([['GET /v2/checkout/orders/O-1', order]]).check()).toEqual(unpaid);
  });

  it('refunds part of a capture in the invoice’s currency with a note PayPal takes', async () => {
    const { gateway, payments, client } = connect([
      ['POST /v2/payments/captures/CAP-1/refund', { id: 'R-1' }],
      ['/refund', { status: 'PENDING' }],
    ]);

    expect(
      await payments.refund(client, {
        paymentId: 'CAP-1',
        amount: 250,
        note: 'n'.repeat(300),
        state: { paypalCurrency: 'EUR' },
      }),
    ).toEqual({ refundId: 'R-1' });
    expect(gateway.sent('/refund')).toEqual({
      amount: { currency_code: 'EUR', value: '2.50' },
      note_to_payer: 'n'.repeat(255),
    });

    const failed = await refusal(
      payments.refund(client, {
        paymentId: 'CAP-2',
        amount: 250,
        note: '',
        state: { paypalCurrency: 'EUR' },
      }),
    );

    expect(failed.message).toBe('PayPal gave no refund');
  });

  it('answers a refusal as a GatewayError naming PayPal and the status', async () => {
    const { payments, client } = connect([['POST /v2/checkout/orders', { name: 'INVALID' }, 422]]);
    const { status, message } = await refusal(payments.createInvoice(client, yen));

    expect(status).toBe(422);
    expect(message).toMatch(/^PayPal \/v2\/checkout\/orders answered 422/);
  });
});

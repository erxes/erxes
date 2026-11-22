import { openGateway } from '~/modules/integrations/registry';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { callbackSignature } from '~/modules/payments/invoiceState';
import { useTestDatabase } from './db';
import { fakeGateway, urlOf } from './fakeGateway';
import { useTwoOrgs } from './support';

/** A $15.00 invoice as core opens it. */
const dollars = {
  invoiceId: 'inv2',
  amount: 1500,
  currency: 'USD',
  description: 'Order #2',
  callbackUrl: 'https://erxes.test/cb/inv2/s',
  returnUrl: 'https://erxes.test/cb/inv2/s/return',
};

const stripeReplies: [string, unknown][] = [
  ['/v1/balance', { object: 'balance' }],
  ['/v1/refunds', { id: 're_1' }],
  ['/expire', { id: 'cs_1' }],
  [
    'GET /v1/checkout/sessions/',
    { id: 'cs_1', payment_status: 'paid', amount_total: 1500, payment_intent: 'pi_1' },
  ],
  ['POST /v1/checkout/sessions', { id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/cs_1' }],
];

describe('card gateway drivers', () => {
  it('Stripe opens a Checkout page in the invoice’s currency, checks the session, and refunds part', async () => {
    const stripe = fakeGateway(stripeReplies);

    const { payments, client } = openGateway(
      'stripe',
      { secretKey: 'sk_test' },
      { fetch: stripe.fetch },
    );

    const created = await payments.createInvoice(client, {
      ...dollars,
      payerEmail: 'payer@acme.mn',
    });

    const form = new URLSearchParams(stripe.calls[0]?.body);

    expect(form.get('line_items[0][price_data][currency]')).toBe('usd');
    expect(form.get('line_items[0][price_data][unit_amount]')).toBe('1500');
    expect(form.get('success_url')).toBe(dollars.returnUrl);
    expect(form.get('customer_email')).toBe('payer@acme.mn');
    expect(stripe.calls[0]?.auth).toBe('Bearer sk_test');
    expect(created).toMatchObject({
      gatewayInvoiceId: 'cs_1',
      payment: { shortUrl: 'https://checkout.stripe.com/c/pay/cs_1' },
    });
    expect(
      await payments.check(client, { gatewayInvoiceId: 'cs_1', amount: 1500, state: {} }),
    ).toEqual({
      paid: true,
      paidAmount: 1500,
      paymentId: 'pi_1',
    });
    expect(
      await payments.refund(client, {
        paymentId: 'pi_1',
        amount: 500,
        note: 'One item',
        state: {},
      }),
    ).toEqual({
      refundId: 're_1',
    });
    expect(new URLSearchParams(stripe.calls.at(-1)?.body).get('amount')).toBe('500');
  });

  it('PayPal sends the payer to approve the order, captures it on the check, and refunds in its currency', async () => {
    const captured = {
      id: 'O-1',
      status: 'COMPLETED',
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: 'CAP-1',
                status: 'COMPLETED',
                amount: { value: '15.00', currency_code: 'USD' },
              },
            ],
          },
        },
      ],
    };

    const paypal = fakeGateway([
      ['/v1/oauth2/token', { access_token: 'pp', expires_in: 3000 }],
      ['/capture', captured],
      ['/refund', { id: 'R-1' }],
      ['GET /v2/checkout/orders/O-1', { id: 'O-1', status: 'APPROVED' }],
      [
        'POST /v2/checkout/orders',
        {
          id: 'O-1',
          status: 'PAYER_ACTION_REQUIRED',
          links: [{ rel: 'payer-action', href: 'https://paypal.test/approve' }],
        },
      ],
    ]);

    const { payments, client } = openGateway(
      'paypal',
      { clientId: 'c', clientSecret: 's', sandbox: true },
      { fetch: paypal.fetch, cacheKey: 'paypal-test' },
    );

    const created = await payments.createInvoice(client, dollars);

    expect(paypal.sent('/v2/checkout/orders')).toMatchObject({
      purchase_units: [{ custom_id: 'inv2', amount: { currency_code: 'USD', value: '15.00' } }],
    });
    expect(paypal.calls[1]?.url).toBe('https://api-m.sandbox.paypal.com/v2/checkout/orders');
    expect(created).toMatchObject({
      payment: { shortUrl: 'https://paypal.test/approve' },
      state: { paypalCurrency: 'USD' },
    });
    expect(
      await payments.check(client, { gatewayInvoiceId: 'O-1', amount: 1500, state: {} }),
    ).toEqual({
      paid: true,
      paidAmount: 1500,
      paymentId: 'CAP-1',
    });
    await payments.refund(client, {
      paymentId: 'CAP-1',
      amount: 250,
      note: 'Late',
      state: created.state ?? {},
    });
    expect(paypal.sent('/refund')).toMatchObject({
      amount: { currency_code: 'USD', value: '2.50' },
    });
  });
});

describe('card gateways through core', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const gateways = fakeGateway([
    ...stripeReplies,
    ['/oauth/token', { access_token: 'sp', expires_in: 3600 }],
  ]);

  beforeAll(() => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
      /^https:\/\/(api\.stripe\.com|service\.storepay\.mn)\//.test(urlOf(input))
        ? gateways.fetch(input, init)
        : realFetch(input, init),
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the credentials out of the gateway’s settings', async () => {
    const stripe = await t.owner().integrations.connect({
      key: 'stripe',
      name: 'Stripe',
      keys: { secretKey: 'sk_live_secret' },
    });

    expect(stripe.settings).toEqual({});
    expect(JSON.stringify(await t.owner().payments.gateways())).not.toContain('sk_live_secret');
  });

  it('sends the payer back from the card page to the caller’s page once core has checked', async () => {
    const invoice = await t.hr().payments.createInvoice({
      amount: 1500,
      currency: 'USD',
      description: 'Order #3',
      referenceType: 'order',
      referenceId: 'o3',
      returnUrl: 'https://shop.acme.mn/orders/o3',
    });

    expect(invoice).toMatchObject({
      gatewayKind: 'stripe',
      payment: { shortUrl: 'https://checkout.stripe.com/c/pay/cs_1' },
    });

    const callback = t.url(
      `/core/v1/payments/callback/${invoice.id}/${callbackSignature(invoice.id)}`,
    );

    const back = await fetch(`${callback}/return`, { redirect: 'manual' });

    expect(back.status).toBe(303);
    expect(back.headers.get('location')).toBe('https://shop.acme.mn/orders/o3');
    expect((await t.hr().payments.getInvoice({ id: invoice.id })).status).toBe('paid');
    // The gateway's own notice gets an answer, never a redirect.
    expect((await fetch(callback, { redirect: 'manual' })).status).toBe(200);
  });

  it('answers GATEWAY_REFUSED when StorePay has no phone to bill', async () => {
    const storepay = await t.owner().integrations.connect({
      key: 'storepay',
      name: 'StorePay',
      keys: {
        storeId: '1',
        username: 'u',
        password: 'p',
        appUsername: 'a',
        appPassword: 'b',
      },
    });

    expect(storepay.settings).toEqual({ storeId: '1', username: 'u', appUsername: 'a' });
    await expect(
      t.hr().payments.createInvoice({
        gatewayId: storepay.id,
        amount: 150_000,
        currency: 'MNT',
        description: 'Order #4',
        referenceType: 'order',
        referenceId: 'o4',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'GATEWAY_REFUSED' });
  });
});

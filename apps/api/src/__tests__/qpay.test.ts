import { describe, expect, it, vi } from 'vite-plus/test';
import { openGateway } from '~/modules/integrations/registry';
import { useTestDatabase } from './db';
import { fakeGateway, refusal, tugrugInvoice, urlOf } from './fakeGateway';
import { useTwoOrgs } from './support';

/** What the fake QPay answers for each endpoint. */
const replyTo = (url: string) => {
  if (url.endsWith('/auth/token'))
    return { access_token: 'tok', expires_in: Math.floor(Date.now() / 1000) + 3600 };

  if (url.endsWith('/invoice'))
    return {
      invoice_id: 'q-1',
      qr_text: 'QRTEXT',
      qr_image: 'iVBOR',
      qPay_shortUrl: 'https://s.qpay.mn/x',
      urls: [{ name: 'Khan', logo: 'l', link: 'khanbank://q' }],
    };

  if (url.includes('/payment/refund/')) return {};

  return {
    count: 1,
    paid_amount: 1500,
    rows: [{ payment_id: 'p-9', payment_status: 'PAID', payment_amount: '1500.00' }],
  };
};

describe('QPay driver', () => {
  it('gets a token, makes an invoice in tögrög with QR and bank links, and checks payment by invoice', async () => {
    const calls: { url: string; body: string; auth: string | null }[] = [];

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init: RequestInit) => {
        calls.push({
          url,
          body: typeof init.body === 'string' ? init.body : '',
          auth: new Headers(init.headers).get('authorization'),
        });

        return Promise.resolve(new Response(JSON.stringify(replyTo(url)), { status: 200 }));
      }),
    );

    try {
      const { payments, client } = openGateway(
        'qpay',
        { clientId: 'id', clientSecret: 'secret', invoiceCode: 'CODE', sandbox: true },
        { cacheKey: 'g-1' },
      );

      const created = await payments.createInvoice(client, {
        invoiceId: 'inv-1',
        amount: 150_000,
        currency: 'MNT',
        description: 'Order #1',
        callbackUrl: 'https://x/cb',
        returnUrl: 'https://x/cb/return',
      });

      expect(calls[0]).toMatchObject({
        url: 'https://merchant-sandbox.qpay.mn/v2/auth/token',
        auth: `Basic ${Buffer.from('id:secret').toString('base64')}`,
      });
      expect(calls[1]).toMatchObject({
        url: 'https://merchant-sandbox.qpay.mn/v2/invoice',
        auth: 'Bearer tok',
      });
      expect(JSON.parse(calls[1]?.body ?? '{}')).toMatchObject({
        invoice_code: 'CODE',
        sender_invoice_no: 'inv-1',
        amount: 1500,
        callback_url: 'https://x/cb',
      });
      expect(created).toMatchObject({
        gatewayInvoiceId: 'q-1',
        payment: {
          qrText: 'QRTEXT',
          qrImage: 'data:image/png;base64,iVBOR',
          links: [{ name: 'Khan', link: 'khanbank://q' }],
        },
      });
      expect(
        await payments.check(client, { gatewayInvoiceId: 'q-1', amount: 150_000, state: {} }),
      ).toMatchObject({
        paid: true,
        paidAmount: 150_000,
        paymentId: 'p-9',
      });
      expect(
        (await payments.check(client, { gatewayInvoiceId: 'q-1', amount: 150_100, state: {} }))
          .paid,
      ).toBe(false);

      await payments.refund(client, {
        paymentId: 'p-9',
        amount: 150_000,
        note: 'Out of stock',
        state: {},
      });
      expect(calls.at(-1)?.url).toBe('https://merchant-sandbox.qpay.mn/v2/payment/refund/p-9');
      expect(JSON.parse(calls.at(-1)?.body ?? '{}')).toEqual({ note: 'Out of stock' });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('QPay requests', () => {
  const keys = { clientId: 'id', clientSecret: 'secret', invoiceCode: 'CODE' };
  let connections = 0;

  const connect = (routes: [string, unknown, number?][]) => {
    const gateway = fakeGateway([['/auth/token', { access_token: 'tok' }], ...routes]);

    return {
      gateway,
      ...openGateway('qpay', keys, { fetch: gateway.fetch, cacheKey: `qpay-${++connections}` }),
    };
  };

  it('sends the invoice, check, cancel and refund QPay’s live API names, and keeps the links it can open', async () => {
    const { gateway, payments, client } = connect([
      [
        'POST /invoice',
        {
          invoice_id: 'q-1',
          qr_text: 'QRTEXT',
          qPay_shortUrl: 'https://s.qpay.mn/x',
          urls: [
            { name: 'Khan', logo: 'https://qpay.mn/khan.png', link: 'khanbank://q' },
            { link: 'tdbbank://q' },
            { name: 'No app', logo: 'https://qpay.mn/x.png' },
          ],
        },
      ],
      ['POST /payment/check', { paid_amount: 1500 }],
      ['DELETE /', {}],
    ]);

    expect(await payments.createInvoice(client, tugrugInvoice)).toEqual({
      gatewayInvoiceId: 'q-1',
      payment: {
        qrText: 'QRTEXT',
        qrImage: null,
        shortUrl: 'https://s.qpay.mn/x',
        links: [
          { name: 'Khan', logo: 'https://qpay.mn/khan.png', link: 'khanbank://q' },
          { name: '', logo: null, link: 'tdbbank://q' },
        ],
      },
    });
    expect(gateway.sent('/invoice')).toEqual({
      invoice_code: 'CODE',
      sender_invoice_no: 'inv1',
      invoice_receiver_code: 'terminal',
      invoice_description: 'Order #1',
      amount: 1500,
      callback_url: tugrugInvoice.callbackUrl,
    });
    expect(
      await payments.check(client, { gatewayInvoiceId: 'q-1', amount: 150_000, state: {} }),
    ).toEqual({ paid: true, paidAmount: 150_000, paymentId: null });
    expect(gateway.sent('/payment/check')).toEqual({
      object_type: 'INVOICE',
      object_id: 'q-1',
      offset: { page_number: 1, page_limit: 100 },
    });

    await payments.cancel(client, { gatewayInvoiceId: 'q-1', amount: 150_000, state: {} });
    expect(
      await payments.refund(client, {
        paymentId: 'p-9',
        amount: 150_000,
        note: 'x'.repeat(300),
        callbackUrl: 'https://erxes.test/cb/refund',
        state: {},
      }),
    ).toEqual({ refundId: null });
    expect(gateway.sent('/payment/refund/p-9')).toEqual({
      note: 'x'.repeat(255),
      callback_url: 'https://erxes.test/cb/refund',
    });
    expect(gateway.calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      'POST https://merchant.qpay.mn/v2/auth/token',
      'POST https://merchant.qpay.mn/v2/invoice',
      'POST https://merchant.qpay.mn/v2/payment/check',
      'DELETE https://merchant.qpay.mn/v2/invoice/q-1',
      'DELETE https://merchant.qpay.mn/v2/payment/refund/p-9',
    ]);
  });

  it('counts the paid rows of a check, and rows without a status, toward the amount', async () => {
    const { payments, client } = connect([
      [
        'POST /payment/check',
        {
          paid_amount: 9999,
          rows: [
            { payment_id: 'p-2', payment_status: 'FAILED', payment_amount: '200.00' },
            { payment_id: 'p-1', payment_status: 'PAID', payment_amount: '1000.00' },
            { payment_id: 'p-3', payment_amount: 300 },
          ],
        },
      ],
    ]);

    expect(
      await payments.check(client, { gatewayInvoiceId: 'q-1', amount: 130_000, state: {} }),
    ).toEqual({ paid: true, paidAmount: 130_000, paymentId: 'p-1' });
  });

  it('fails with a GatewayError naming QPay when it refuses or answers what it should not', async () => {
    const { payments, client } = connect([
      ['POST /invoice', { invoice_id: '' }],
      ['POST /payment/check', { rows: 'none' }],
    ]);

    await expect(payments.createInvoice(client, tugrugInvoice)).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'QPay gave no invoice id',
    });
    await expect(
      payments.check(client, { gatewayInvoiceId: 'q-1', amount: 1, state: {} }),
    ).rejects.toMatchObject({
      name: 'GatewayError',
      message: 'QPay gave an unreadable payment check',
    });

    const { status, message } = await refusal(
      payments.cancel(client, { gatewayInvoiceId: 'gone', amount: 1, state: {} }),
    );

    expect(status).toBe(404);
    expect(message).toMatch(/^QPay \/invoice\/gone answered 404/);
  });
});

describe('QPay gateways', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('refuses QPay credentials the gateway rejects', async () => {
    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) =>
      urlOf(input).startsWith('https://merchant-sandbox.qpay.mn/')
        ? Promise.resolve(new Response('{"error":"NO_CREDENDIALS"}', { status: 401 }))
        : realFetch(input, init),
    );

    try {
      await expect(
        t.owner().integrations.connect({
          key: 'qpay',
          name: 'QPay',
          keys: { clientId: 'bad', clientSecret: 'bad', invoiceCode: 'X', sandbox: true },
        }),
      ).rejects.toMatchObject({ status: 400, code: 'GATEWAY_REFUSED' });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

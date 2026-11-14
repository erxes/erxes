import { withOrg } from '@erxes/core-db';
import { createGateway } from '@erxes/payment-gateways';
import { describe, expect, it, vi } from 'vite-plus/test';
import { addGateway } from '~/modules/payments/gateways.service';
import { useTestDatabase } from './db';
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
      const driver = createGateway(
        {
          kind: 'qpay',
          clientId: 'id',
          clientSecret: 'secret',
          invoiceCode: 'CODE',
          sandbox: true,
        },
        { cacheKey: 'g-1' },
      );

      const created = await driver.createInvoice({
        invoiceId: 'inv-1',
        amount: 150_000,
        currency: 'MNT',
        description: 'Order #1',
        callbackUrl: 'https://x/cb',
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
      expect(await driver.check('q-1', 150_000, {})).toMatchObject({
        paid: true,
        paidAmount: 150_000,
        paymentId: 'p-9',
      });
      expect((await driver.check('q-1', 150_100, {})).paid).toBe(false);

      await driver.refund({ paymentId: 'p-9', amount: 150_000, note: 'Out of stock' }, {});
      expect(calls.at(-1)?.url).toBe('https://merchant-sandbox.qpay.mn/v2/payment/refund/p-9');
      expect(JSON.parse(calls.at(-1)?.body ?? '{}')).toEqual({ note: 'Out of stock' });
      expect(driver.refunds).toBe('full');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('QPay gateways', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('refuses QPay credentials the gateway rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('{"error":"NO_CREDENDIALS"}', { status: 401 }))),
    );

    try {
      const orgId = t.ids.org;

      await expect(
        withOrg(orgId, (tx) =>
          addGateway(tx, {
            name: 'QPay',
            config: {
              kind: 'qpay',
              clientId: 'bad',
              clientSecret: 'bad',
              invoiceCode: 'X',
              sandbox: true,
            },
          }),
        ),
      ).rejects.toMatchObject({ code: 'GATEWAY_REFUSED' });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

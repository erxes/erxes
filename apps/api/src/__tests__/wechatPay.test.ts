import { describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { generateKeyPairSync, verify } from '~/lib/crypto';
import { gatewayOf, openGateway } from '~/modules/integrations/registry';
import { fakeGateway, refusal } from './fakeGateway';

const RefundBody = z.looseObject({ out_refund_no: z.string() });

const keys = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const config = {
  appId: 'wx8888888888888888',
  mchId: '1900000109',
  serialNo: '5157F09EFDC096DE15EBE81A47057A72',
  // As a password input keeps a pasted key: on one line.
  privateKey: keys.privateKey.replaceAll('\n', ' '),
  merchantCategoryCode: '5812',
};

const invoice = {
  invoiceId: 'inv3',
  amount: 1500,
  currency: 'USD',
  description: 'Order #3',
  callbackUrl: 'https://erxes.test/cb/inv3/s',
  returnUrl: 'https://erxes.test/cb/inv3/s/return',
};

/** The fields of an APIv3 Authorization header. */
const authFields = (header: string | null | undefined) =>
  Object.fromEntries(
    [...(header ?? '').matchAll(/(\w+)="([^"]*)"/g)].map(([, key = '', value = '']) => [
      key,
      value,
    ]),
  );

describe('WeChat Pay', () => {
  it('signs a Native order with the merchant key and shows its code as a QR', async () => {
    const gateway = fakeGateway([
      ['POST /v3/global/transactions/native', { code_url: 'weixin://wxpay/bizpayurl?pr=abc' }],
    ]);

    const { payments, client } = openGateway('wechatpay', config, { fetch: gateway.fetch });

    const created = await payments.createInvoice(client, invoice);

    expect(created).toMatchObject({
      gatewayInvoiceId: 'inv3',
      payment: { qrText: 'weixin://wxpay/bizpayurl?pr=abc' },
    });
    expect(created.payment.qrImage).toMatch(/^data:image\/png;base64,/);
    expect(gateway.sent('/native')).toEqual({
      appid: config.appId,
      mchid: config.mchId,
      description: 'Order #3',
      out_trade_no: 'inv3',
      notify_url: invoice.callbackUrl,
      trade_type: 'NATIVE',
      merchant_category_code: '5812',
      amount: { total: 1500, currency: 'USD' },
    });

    const call = gateway.calls[0];

    expect(call?.auth).toMatch(/^WECHATPAY2-SHA256-RSA2048 /);

    const auth = authFields(call?.auth);

    expect(auth).toMatchObject({ mchid: config.mchId, serial_no: config.serialNo });

    const signed = `POST\n/v3/global/transactions/native\n${auth.timestamp}\n${auth.nonce_str}\n${call?.body}\n`;

    expect(
      verify(
        'RSA-SHA256',
        Buffer.from(signed),
        keys.publicKey,
        Buffer.from(auth.signature ?? '', 'base64'),
      ),
    ).toBe(true);
  });

  it('checks the order by our id and refunds part of it by WeChat’s', async () => {
    const gateway = fakeGateway([
      [
        '/out-trade-no/inv3?mchid=1900000109',
        { id: '4200000001', trade_state: 'SUCCESS', amount: { total: 1500 } },
      ],
      ['POST /v3/global/refunds', { id: '50300000001' }],
    ]);

    const { payments, client } = openGateway('wechatpay', config, { fetch: gateway.fetch });
    const state = { wechatTotal: 1500, wechatCurrency: 'USD' };

    await gatewayOf('wechatpay').verify(client);
    expect(await payments.check(client, { gatewayInvoiceId: 'inv3', amount: 1500, state })).toEqual(
      {
        paid: true,
        paidAmount: 1500,
        paymentId: '4200000001',
      },
    );
    expect(
      await payments.refund(client, {
        paymentId: '4200000001',
        amount: 500,
        note: 'One item back',
        state,
      }),
    ).toEqual({ refundId: '50300000001' });
    expect(gateway.sent('/refunds')).toMatchObject({
      transaction_id: '4200000001',
      amount: { refund: 500, total: 1500, currency: 'USD' },
    });
  });

  it('signs a GET with an empty body and the current time, and reads REFUND as paid', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-22T00:00:00Z'));

    try {
      const gateway = fakeGateway([
        ['/out-trade-no/inv3?', { id: '4200000001', trade_state: 'REFUND' }],
      ]);

      const { payments, client } = openGateway('wechatpay', config, { fetch: gateway.fetch });

      expect(
        await payments.check(client, { gatewayInvoiceId: 'inv3', amount: 1500, state: {} }),
      ).toEqual({ paid: true, paidAmount: 1500, paymentId: '4200000001' });

      const call = gateway.calls[0];
      const auth = authFields(call?.auth);
      const path = '/v3/global/transactions/out-trade-no/inv3?mchid=1900000109';

      expect([call?.method, call?.url]).toEqual(['GET', `https://apihk.mch.weixin.qq.com${path}`]);
      expect(auth.timestamp).toBe(String(Date.UTC(2026, 10, 22) / 1000));
      expect(
        verify(
          'RSA-SHA256',
          Buffer.from(`GET\n${path}\n${auth.timestamp}\n${auth.nonce_str}\n\n`),
          keys.publicKey,
          Buffer.from(auth.signature ?? '', 'base64'),
        ),
      ).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('pays only a successful order of the whole amount, and fails an unreadable one', async () => {
    const gateway = fakeGateway([
      ['/out-trade-no/short?', { id: 'w1', trade_state: 'SUCCESS', amount: { total: 1000 } }],
      ['/out-trade-no/open?', { trade_state: 'NOTPAY', amount: { total: 1500 } }],
      ['/out-trade-no/odd?', { state: 'SUCCESS' }],
    ]);

    const { payments, client } = openGateway('wechatpay', config, { fetch: gateway.fetch });

    const check = (gatewayInvoiceId: string) =>
      payments.check(client, { gatewayInvoiceId, amount: 1500, state: {} });

    expect(await check('short')).toEqual({ paid: false, paidAmount: 1000, paymentId: 'w1' });
    expect(await check('open')).toEqual({ paid: false, paidAmount: 0, paymentId: null });
    expect((await refusal(check('odd'))).message).toBe('WeChat Pay gave an unreadable order');
  });

  it('opens, closes and refunds orders as WeChat Pay’s API names them', async () => {
    const gateway = fakeGateway([
      ['POST /v3/global/transactions/native', { code_url: 'weixin://wxpay/bizpayurl?pr=abc' }],
      ['POST /v3/global/transactions/out-trade-no/inv3/close', {}],
      ['POST /v3/global/refunds', { id: '50300000001' }],
    ]);

    const { payments, client } = openGateway('wechatpay', config, { fetch: gateway.fetch });

    const created = await payments.createInvoice(client, {
      ...invoice,
      description: 'd'.repeat(200),
    });

    expect(created).toMatchObject({
      payment: { shortUrl: null, links: [] },
      state: { wechatTotal: 1500, wechatCurrency: 'USD' },
    });
    expect(gateway.sent('/native')).toMatchObject({ description: 'd'.repeat(127) });

    await payments.cancel(client, { gatewayInvoiceId: 'inv3', amount: 1500, state: {} });
    expect(gateway.sent('/close')).toEqual({ mchid: config.mchId });

    await payments.refund(client, {
      paymentId: '4200000001',
      amount: 500,
      note: 'n'.repeat(100),
      callbackUrl: 'https://erxes.test/cb/refund',
      state: { wechatTotal: 1500, wechatCurrency: 'USD' },
    });

    const { out_refund_no: refundNo, ...sent } = RefundBody.parse(gateway.sent('/refunds'));

    expect(refundNo).toMatch(/^[0-9a-f]{32}$/);
    expect(sent).toEqual({
      mchid: config.mchId,
      appid: config.appId,
      transaction_id: '4200000001',
      reason: 'n'.repeat(80),
      notify_url: 'https://erxes.test/cb/refund',
      amount: { refund: 500, total: 1500, currency: 'USD' },
    });
  });

  it('fails with a GatewayError naming WeChat Pay when it gives no order or refund', async () => {
    const { payments, client } = openGateway('wechatpay', config, {
      fetch: fakeGateway([
        ['/native', { code_url: '' }],
        ['/refunds', { status: 'PROCESSING' }],
      ]).fetch,
    });

    expect((await refusal(payments.createInvoice(client, invoice))).message).toBe(
      'WeChat Pay gave no order',
    );

    const failed = await refusal(
      payments.refund(client, {
        paymentId: 'w1',
        amount: 1,
        note: '',
        state: { wechatTotal: 1500, wechatCurrency: 'USD' },
      }),
    );

    expect(failed.message).toBe('WeChat Pay gave no refund');
  });

  it('verifies with a made-up order that only good credentials answer 404 for', async () => {
    const unknown = fakeGateway([]);

    await gatewayOf('wechatpay').verify(
      openGateway('wechatpay', config, { fetch: unknown.fetch }).client,
    );
    expect(unknown.calls[0]?.url).toMatch(
      /^https:\/\/apihk\.mch\.weixin\.qq\.com\/v3\/global\/transactions\/out-trade-no\/[0-9a-f]{32}\?mchid=1900000109$/,
    );

    for (const status of [401, 500]) {
      const { client } = openGateway('wechatpay', config, {
        fetch: fakeGateway([['/out-trade-no/', { code: 'SIGN_ERROR' }, status]]).fetch,
      });

      const failed = await refusal(gatewayOf('wechatpay').verify(client));

      expect(failed.status).toBe(status);
      expect(failed.message).toMatch(
        /^WeChat Pay \/v3\/global\/transactions\/out-trade-no\/\w+ answered/,
      );
    }
  });

  it('refuses a private key that is not a PEM key', async () => {
    const { payments, client } = openGateway(
      'wechatpay',
      { ...config, privateKey: '-----BEGIN PRIVATE KEY----- nope -----END PRIVATE KEY-----' },
      { fetch: fakeGateway([]).fetch },
    );

    await expect(payments.createInvoice(client, invoice)).rejects.toMatchObject({ status: 400 });
  });
});

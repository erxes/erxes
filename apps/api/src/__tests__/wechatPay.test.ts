import { createGateway, type WeChatPayConfig } from '@erxes/payment-gateways';
import { describe, expect, it } from 'vite-plus/test';
import { generateKeyPairSync, verify } from '~/lib/crypto';
import { fakeGateway } from './fakeGateway';

const keys = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const config: WeChatPayConfig = {
  kind: 'wechatpay',
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

    const driver = createGateway(config, { fetch: gateway.fetch });

    const created = await driver.createInvoice(invoice);

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

    const driver = createGateway(config, { fetch: gateway.fetch });
    const state = { wechatTotal: 1500, wechatCurrency: 'USD' };

    await driver.verify();
    expect(await driver.check('inv3', 1500, state)).toEqual({
      paid: true,
      paidAmount: 1500,
      paymentId: '4200000001',
    });
    expect(
      await driver.refund({ paymentId: '4200000001', amount: 500, note: 'One item back' }, state),
    ).toEqual({ refundId: '50300000001' });
    expect(gateway.sent('/refunds')).toMatchObject({
      transaction_id: '4200000001',
      amount: { refund: 500, total: 1500, currency: 'USD' },
    });
  });

  it('refuses a private key that is not a PEM key', async () => {
    const driver = createGateway(
      { ...config, privateKey: '-----BEGIN PRIVATE KEY----- nope -----END PRIVATE KEY-----' },
      { fetch: fakeGateway([]).fetch },
    );

    await expect(driver.createInvoice(invoice)).rejects.toMatchObject({ status: 400 });
  });
});

import { z } from 'zod';
import { createPrivateKey, type KeyObject, randomToken, randomUUID, sign } from '~/lib/crypto';
import { defineIntegration, digits, field, secret } from '../define';
import { gatewayHttp, json, parse, qrInstructions, type Send } from './http';
import { type ClientOptions, GatewayError } from './types';

const keys = z.object({
  appId: field('App ID'),
  mchId: field('Merchant ID (mchid)', digits()),
  serialNo: field('Certificate serial number'),
  privateKey: secret(
    'API private key (apiclient_key.pem)',
    z.string().trim().min(1).max(5000).includes('PRIVATE KEY'),
  ),
  merchantCategoryCode: field(
    'Merchant category code (MCC)',
    z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'a 4-digit code'),
  ),
});

type WeChatPayConfig = z.output<typeof keys>;

const NativeOrder = z.object({ code_url: z.string().min(1) });

const Order = z.object({
  id: z.string().nullish(),
  trade_state: z.string(),
  amount: z.object({ total: z.number().int().nullish() }).nullish(),
});

const Refund = z.object({ id: z.string().min(1) });

/** What a refund needs again: the order's total and currency. */
const State = z.object({ wechatTotal: z.number().int(), wechatCurrency: z.string() });

/**
 * The merchant's API private key as PEM. A password input drops the line
 * breaks of a pasted key, so the body is wrapped again at 64 characters.
 */
const privateKeyOf = (pem: string) => {
  const body = pem
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '')
    .replace(/(.{64})/g, '$1\n');

  try {
    return createPrivateKey(`-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----\n`);
  } catch {
    throw new GatewayError('WeChat Pay private key is not a PKCS#8 PEM key', 400);
  }
};

/** APIv3's signature: SHA256-RSA over method, path, timestamp, nonce and body, each on its own line. */
const authorization = (
  config: WeChatPayConfig,
  key: KeyObject,
  method: string,
  path: string,
  body: string,
) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomToken(16, 'hex');

  const signature = sign(
    'sha256',
    Buffer.from(`${method}\n${path}\n${timestamp}\n${nonce}\n${body}\n`),
    key,
  ).toString('base64');

  return `WECHATPAY2-SHA256-RSA2048 mchid="${config.mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${config.serialNo}"`;
};

/** Signed requests to WeChat Pay's cross-border API (Hong Kong). */
const wechatClient = (config: WeChatPayConfig, options: ClientOptions) => {
  const send: Send = gatewayHttp('WeChat Pay', 'https://apihk.mch.weixin.qq.com', options);
  let key: KeyObject | null = null;

  const call = (path: string, body?: Record<string, unknown>) => {
    key ??= privateKeyOf(config.privateKey);

    const method = body ? 'POST' : 'GET';
    const text = body ? json(body) : '';

    return send(path, {
      method,
      headers: { Authorization: authorization(config, key, method, path, text) },
      body: body ? text : undefined,
    });
  };

  return { config, call, query: new URLSearchParams({ mchid: config.mchId }).toString() };
};

const orderPath = (outTradeNo: string) =>
  `/v3/global/transactions/out-trade-no/${encodeURIComponent(outTradeNo)}`;

/**
 * WeChat Pay (cross-border, APIv3, direct merchant): a Native order whose
 * `code_url` the payer scans in WeChat; checked by our invoice id. Refunds of
 * any part. The callback address carries its signature in the path, as
 * WeChat takes no query in `notify_url`.
 */
export const wechatpay = defineIntegration({
  key: 'wechatpay',
  name: 'WeChat Pay',
  summary: 'Cross-border payments: a QR code payers scan in WeChat.',
  category: 'payments',
  countries: [],
  permission: 'payments.manage',
  dashboard: 'https://pay.weixin.qq.com',
  keys,
  client: wechatClient,
  async verify({ call, query }) {
    // A made-up order answers 404 to good credentials and 401 to wrong ones.
    await call(`${orderPath(randomUUID().replaceAll('-', ''))}?${query}`).catch(
      (error: unknown) => {
        if (!(error instanceof GatewayError && error.status === 404)) throw error;
      },
    );
  },
  payments: {
    currencies: [
      'AUD',
      'CAD',
      'CHF',
      'DKK',
      'EUR',
      'GBP',
      'HKD',
      'JPY',
      'KRW',
      'MOP',
      'MYR',
      'NOK',
      'NZD',
      'SEK',
      'SGD',
      'THB',
      'USD',
    ],
    refunds: 'partial',
    pays: 'wechat',
    async createInvoice({ config, call }, input) {
      const order = parse(
        'WeChat Pay',
        NativeOrder,
        await call('/v3/global/transactions/native', {
          appid: config.appId,
          mchid: config.mchId,
          description: input.description.slice(0, 127),
          out_trade_no: input.invoiceId,
          notify_url: input.callbackUrl,
          trade_type: 'NATIVE',
          merchant_category_code: config.merchantCategoryCode,
          amount: { total: input.amount, currency: input.currency },
        }),
        'no order',
      );

      return {
        gatewayInvoiceId: input.invoiceId,
        payment: await qrInstructions(order.code_url),
        state: { wechatTotal: input.amount, wechatCurrency: input.currency },
      };
    },
    async check({ call, query }, { gatewayInvoiceId, amount }) {
      const order = parse(
        'WeChat Pay',
        Order,
        await call(`${orderPath(gatewayInvoiceId)}?${query}`),
        'an unreadable order',
      );

      // REFUND: paid, then (partly) refunded — still a payment.
      const paid = order.trade_state === 'SUCCESS' || order.trade_state === 'REFUND';
      const paidAmount = paid ? (order.amount?.total ?? amount) : 0;

      return {
        paid: paid && paidAmount >= amount,
        paidAmount,
        paymentId: paid ? (order.id ?? gatewayInvoiceId) : null,
      };
    },
    async cancel({ config, call }, { gatewayInvoiceId }) {
      await call(`${orderPath(gatewayInvoiceId)}/close`, { mchid: config.mchId });
    },
    async refund({ config, call }, { paymentId, amount, note, callbackUrl, state }) {
      const { wechatTotal, wechatCurrency } = State.parse(state);

      const refund = parse(
        'WeChat Pay',
        Refund,
        await call('/v3/global/refunds', {
          mchid: config.mchId,
          appid: config.appId,
          transaction_id: paymentId,
          out_refund_no: randomUUID().replaceAll('-', ''),
          reason: note.slice(0, 80),
          ...(callbackUrl ? { notify_url: callbackUrl } : {}),
          amount: { refund: amount, total: wechatTotal, currency: wechatCurrency },
        }),
        'no refund',
      );

      return { refundId: refund.id };
    },
  },
});

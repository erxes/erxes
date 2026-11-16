import { createPrivateKey, createSign, type KeyObject, randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { gatewayHttp, json, parse, qrInstructions, type Send } from './http';
import {
  type DriverOptions,
  type GatewayDriver,
  GatewayError,
  type WeChatPayConfig,
} from './types';

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
  const nonce = randomBytes(16).toString('hex');

  const signature = createSign('RSA-SHA256')
    .update(`${method}\n${path}\n${timestamp}\n${nonce}\n${body}\n`)
    .sign(key, 'base64');

  return `WECHATPAY2-SHA256-RSA2048 mchid="${config.mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${config.serialNo}"`;
};

/** Signed requests to WeChat Pay's cross-border API (Hong Kong). */
const wechatClient = (config: WeChatPayConfig, options: DriverOptions) => {
  const send: Send = gatewayHttp('WeChat Pay', 'https://apihk.mch.weixin.qq.com', options);
  let key: KeyObject | null = null;

  return (path: string, body?: Record<string, unknown>) => {
    key ??= privateKeyOf(config.privateKey);

    const method = body ? 'POST' : 'GET';
    const text = body ? json(body) : '';

    return send(path, {
      method,
      headers: { Authorization: authorization(config, key, method, path, text) },
      body: body ? text : undefined,
    });
  };
};

const orderPath = (outTradeNo: string) =>
  `/v3/global/transactions/out-trade-no/${encodeURIComponent(outTradeNo)}`;

/**
 * WeChat Pay (cross-border, APIv3, direct merchant): a Native order whose
 * `code_url` the payer scans in WeChat; checked by our invoice id. Refunds of
 * any part. The callback address carries its signature in the path, as
 * WeChat takes no query in `notify_url`.
 */
export const wechatpayDriver = (
  config: WeChatPayConfig,
  options: DriverOptions = {},
): GatewayDriver => {
  const call = wechatClient(config, options);
  const query = new URLSearchParams({ mchid: config.mchId }).toString();

  return {
    kind: 'wechatpay',
    async verify() {
      // A made-up order answers 404 to good credentials and 401 to wrong ones.
      await call(`${orderPath(randomUUID().replaceAll('-', ''))}?${query}`).catch(
        (error: unknown) => {
          if (!(error instanceof GatewayError && error.status === 404)) throw error;
        },
      );
    },
    async createInvoice(input) {
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
    async check(gatewayInvoiceId, amount) {
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
    async cancel(gatewayInvoiceId) {
      await call(`${orderPath(gatewayInvoiceId)}/close`, { mchid: config.mchId });
    },
    async refund(input, state) {
      const { wechatTotal, wechatCurrency } = State.parse(state);

      const refund = parse(
        'WeChat Pay',
        Refund,
        await call('/v3/global/refunds', {
          mchid: config.mchId,
          appid: config.appId,
          transaction_id: input.paymentId,
          out_refund_no: randomUUID().replaceAll('-', ''),
          reason: input.note.slice(0, 80),
          ...(input.callbackUrl ? { notify_url: input.callbackUrl } : {}),
          amount: { refund: input.amount, total: wechatTotal, currency: wechatCurrency },
        }),
        'no refund',
      );

      return { refundId: refund.id };
    },
  };
};

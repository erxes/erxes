import { z } from 'zod';
import {
  type CreateInvoiceInput,
  type DriverOptions,
  type GatewayDriver,
  GatewayError,
  type QPayConfig,
} from './types';

const tokens = new Map<string, { token: string; expiresAt: number }>();

/** QPay sends ids and amounts as strings or numbers. */
const Text = z.union([z.string(), z.number()]).transform(String);
const Amount = z.union([z.string(), z.number()]).transform(Number);

const TokenAnswer = z.object({
  access_token: z.string().min(1),
  // An absolute unix time.
  expires_in: z.coerce.number().optional(),
});

const InvoiceAnswer = z.object({
  invoice_id: Text.pipe(z.string().min(1)),
  qr_text: z.string().nullish(),
  qr_image: z.string().nullish(),
  qPay_shortUrl: z.string().nullish(),
  urls: z
    .array(
      z.object({
        name: z.string().nullish(),
        logo: z.string().nullish(),
        link: z.string().nullish(),
      }),
    )
    .nullish()
    .transform((items) => items ?? []),
});

const CheckAnswer = z.object({
  rows: z
    .array(
      z.object({
        payment_id: Text.nullish(),
        payment_status: z.string().nullish(),
        payment_amount: Amount.nullish(),
      }),
    )
    .nullish()
    .transform((items) => items ?? []),
  paid_amount: Amount.nullish(),
});

/** QPay's answer as `schema`; text that isn't JSON of that shape is a GatewayError saying what was missing. */
const parse = <T>(schema: z.ZodType<T>, text: string, what: string) => {
  try {
    return schema.parse(JSON.parse(text));
  } catch {
    throw new GatewayError(`QPay gave ${what}`);
  }
};

/** QPay's answer text, after a 2xx. */
type Request = (path: string, init?: RequestInit) => Promise<string>;

/** QPay's API with its access token, cached per connection and mode. */
const qpayClient = (config: QPayConfig, options: DriverOptions) => {
  const base = config.sandbox
    ? 'https://merchant-sandbox.qpay.mn/v2'
    : 'https://merchant.qpay.mn/v2';

  const cacheKey = `${options.cacheKey ?? config.clientId}:${config.sandbox ? 'sandbox' : 'live'}`;
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const send = async (path: string, init: RequestInit, authorization: string) => {
    const headers = new Headers(init.headers);

    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', authorization);

    const response = await (options.fetch ?? globalThis.fetch)(`${base}${path}`, {
      ...init,
      headers,
      signal: AbortSignal.timeout(15_000),
    });

    const text = await response.text();

    if (!response.ok)
      throw new GatewayError(
        `QPay ${path} answered ${response.status}: ${text.slice(0, 300)}`,
        response.status,
      );

    return text;
  };

  const token = async () => {
    const cached = tokens.get(cacheKey);

    if (cached && cached.expiresAt - Date.now() > 60_000) return cached.token;

    const answer = parse(
      TokenAnswer,
      await send('/auth/token', { method: 'POST' }, `Basic ${basic}`),
      'no access token',
    );

    const expires = answer.expires_in ?? 0;

    tokens.set(cacheKey, {
      token: answer.access_token,
      expiresAt: expires > 1e9 ? expires * 1000 : Date.now() + 3600_000,
    });

    return answer.access_token;
  };

  const request: Request = async (path, init = {}) => send(path, init, `Bearer ${await token()}`);

  return { request, token, forgetToken: () => tokens.delete(cacheKey) };
};

const createInvoice = async (request: Request, config: QPayConfig, input: CreateInvoiceInput) => {
  const answer = parse(
    InvoiceAnswer,
    await request('/invoice', {
      method: 'POST',
      body: JSON.stringify({
        invoice_code: config.invoiceCode,
        sender_invoice_no: input.invoiceId,
        invoice_receiver_code: 'terminal',
        invoice_description: input.description,
        amount: input.amount / 100,
        callback_url: input.callbackUrl,
      }),
    }),
    'no invoice id',
  );

  return {
    gatewayInvoiceId: answer.invoice_id,
    payment: {
      qrText: answer.qr_text ?? null,
      qrImage: answer.qr_image ? `data:image/png;base64,${answer.qr_image}` : null,
      shortUrl: answer.qPay_shortUrl ?? null,
      links: answer.urls.flatMap((url) =>
        url.link ? [{ name: url.name ?? '', logo: url.logo ?? null, link: url.link }] : [],
      ),
    },
  };
};

const checkPayment = async (request: Request, gatewayInvoiceId: string, amount: number) => {
  const answer = parse(
    CheckAnswer,
    await request('/payment/check', {
      method: 'POST',
      body: JSON.stringify({
        object_type: 'INVOICE',
        object_id: gatewayInvoiceId,
        offset: { page_number: 1, page_limit: 100 },
      }),
    }),
    'an unreadable payment check',
  );

  const paidRows = answer.rows.filter(
    (row) => !row.payment_status || row.payment_status === 'PAID',
  );

  const fromRows = paidRows.reduce(
    (sum, row) => sum + Math.round((row.payment_amount ?? 0) * 100),
    0,
  );

  const paidAmount = answer.rows.length ? fromRows : Math.round((answer.paid_amount ?? 0) * 100);

  return {
    paid: paidAmount >= amount,
    paidAmount,
    paymentId: paidRows[0]?.payment_id ?? null,
  };
};

/**
 * QPay v2: token by client credentials; invoices with QR and bank app links;
 * payment check by invoice; cancel; refund of a whole (card) payment.
 * QPay takes amounts in tögrög; we keep hundredths (MNT's smallest unit). Core
 * sends it MNT invoices only.
 */
export const qpayDriver = (config: QPayConfig, options: DriverOptions = {}): GatewayDriver => {
  const client = qpayClient(config, options);

  return {
    kind: 'qpay',
    refunds: 'full',
    async verify() {
      client.forgetToken();
      await client.token();
    },
    createInvoice: (input) => createInvoice(client.request, config, input),
    check: (gatewayInvoiceId, amount) => checkPayment(client.request, gatewayInvoiceId, amount),
    async cancel(gatewayInvoiceId) {
      await client.request(`/invoice/${encodeURIComponent(gatewayInvoiceId)}`, {
        method: 'DELETE',
      });
    },
    async refund(input) {
      await client.request(`/payment/refund/${encodeURIComponent(input.paymentId)}`, {
        method: 'DELETE',
        body: JSON.stringify({
          note: input.note.slice(0, 255),
          ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
        }),
      });

      return { refundId: null };
    },
  };
};

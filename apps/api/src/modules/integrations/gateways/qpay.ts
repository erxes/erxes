import { z } from 'zod';
import {
  Amount,
  basic,
  fromTugrug,
  gatewayHttp,
  json,
  parse,
  type Send,
  Text,
  tokenCache,
  toTugrug,
  withBearer,
} from './http';
import { defineIntegration, field, secret, toggle } from '../define';
import type { ClientOptions, CreateInvoiceInput } from './types';

const keys = z.object({
  clientId: field('Client ID'),
  clientSecret: secret('Client secret'),
  invoiceCode: field('Invoice code'),
  sandbox: toggle('Sandbox (test environment)'),
});

type QPayConfig = z.output<typeof keys>;

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

/** QPay's API with its access token, cached per connection and mode. */
const qpayClient = (config: QPayConfig, options: ClientOptions) => {
  const send = gatewayHttp(
    'QPay',
    config.sandbox ? 'https://merchant-sandbox.qpay.mn/v2' : 'https://merchant.qpay.mn/v2',
    options,
  );

  const cache = tokenCache(
    `qpay:${options.cacheKey ?? config.clientId}:${config.sandbox ? 'sandbox' : 'live'}`,
    async () => {
      const answer = parse(
        'QPay',
        TokenAnswer,
        await send('/auth/token', {
          method: 'POST',
          headers: { Authorization: basic(config.clientId, config.clientSecret) },
        }),
        'no access token',
      );

      const expires = answer.expires_in ?? 0;

      return {
        token: answer.access_token,
        expiresIn: expires > 1e9 ? expires - Date.now() / 1000 : undefined,
      };
    },
  );

  return { request: withBearer(send, cache.token), cache };
};

const createInvoice = async (request: Send, config: QPayConfig, input: CreateInvoiceInput) => {
  const answer = parse(
    'QPay',
    InvoiceAnswer,
    await request('/invoice', {
      method: 'POST',
      body: json({
        invoice_code: config.invoiceCode,
        sender_invoice_no: input.invoiceId,
        invoice_receiver_code: 'terminal',
        invoice_description: input.description,
        amount: toTugrug(input.amount),
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

const checkPayment = async (request: Send, gatewayInvoiceId: string, amount: number) => {
  const answer = parse(
    'QPay',
    CheckAnswer,
    await request('/payment/check', {
      method: 'POST',
      body: json({
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

  const fromRows = paidRows.reduce((sum, row) => sum + fromTugrug(row.payment_amount ?? 0), 0);
  const paidAmount = answer.rows.length ? fromRows : fromTugrug(answer.paid_amount ?? 0);

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
export const qpay = defineIntegration({
  key: 'qpay',
  name: 'QPay',
  summary: 'Invoices with a QR code payers scan in any bank app.',
  category: 'payments',
  countries: ['MN'],
  permission: 'payments.manage',
  keys,
  client: (config, options) => ({ config, ...qpayClient(config, options) }),
  async verify({ cache }) {
    cache.forget();
    await cache.token();
  },
  payments: {
    currencies: ['MNT'],
    refunds: 'full',
    pays: 'bank-qr',
    createInvoice: ({ request, config }, input) => createInvoice(request, config, input),
    check: ({ request }, { gatewayInvoiceId, amount }) =>
      checkPayment(request, gatewayInvoiceId, amount),
    async cancel({ request }, { gatewayInvoiceId }) {
      await request(`/invoice/${encodeURIComponent(gatewayInvoiceId)}`, { method: 'DELETE' });
    },
    async refund({ request }, { paymentId, note, callbackUrl }) {
      await request(`/payment/refund/${encodeURIComponent(paymentId)}`, {
        method: 'DELETE',
        body: json({
          note: note.slice(0, 255),
          ...(callbackUrl ? { callback_url: callbackUrl } : {}),
        }),
      });

      return { refundId: null };
    },
  },
});

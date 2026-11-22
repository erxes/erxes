import { z } from 'zod';
import {
  Amount,
  basic,
  gatewayHttp,
  json,
  NO_INSTRUCTIONS,
  parse,
  qrInstructions,
  Text,
  tokenCache,
  toTugrug,
  withBearer,
} from './http';
import { defineIntegration, field, secret, toggle } from '../define';
import { type ClientOptions, type CreateInvoiceInput, GatewayError } from './types';

const keys = z
  .object({
    merchantId: field('Merchant ID'),
    username: field('Username').optional(),
    password: secret('Password').optional(),
    sandbox: toggle('Sandbox (staging-apps.toki.mn)'),
  })
  .refine((config) => !config.username === !config.password, {
    message: 'Fill in both the username and password for Toki QR, or neither',
    path: ['password'],
  });

type TokiConfig = z.output<typeof keys>;

const Answer = <T extends z.ZodType>(data: T) =>
  z.object({
    code: z.coerce.number().optional(),
    error: z.union([z.string(), z.object({ message: z.string().nullish() })]).nullish(),
    data: data.nullish(),
  });

const TokenAnswer = Answer(z.object({ accessToken: z.string().min(1) }));

const RequestAnswer = Answer(
  z.object({ requestId: Text.pipe(z.string().min(1)), transactionId: Text.nullish() }),
);

const StatusAnswer = Answer(z.object({ status: z.string() }));

/** The mini program's status answer: Toki documents only `status`; the rest, if sent, must match. */
const MiniProgramAnswer = z.object({
  statusCode: z.coerce.number().optional(),
  message: z.string().nullish(),
  data: z
    .object({
      status: z.string().nullish(),
      orderId: Text.nullish(),
      orderID: Text.nullish(),
      amount: Amount.nullish(),
      merchantId: Text.nullish(),
    })
    .nullish(),
});

const why = (answer: { code?: number; error?: string | { message?: string | null } | null }) =>
  (typeof answer.error === 'string' ? answer.error : answer.error?.message) ?? answer.code;

/**
 * What the invoice keeps for Toki: the QR request (checked by its transaction
 * id, cancelled by its request id) and the payment the mini program's callback
 * brought (checked with the payer's token).
 */
const State = z.object({
  tokiOrderId: z.string().optional(),
  tokiRequestId: z.string().optional(),
  tokiTransactionId: z.string().optional(),
  tokiTransRequestId: z.string().optional(),
  tokiPayerToken: z.string().optional(),
});

/** What Toki posts once the payer pays in the mini program. */
const MiniProgramCallback = z.object({
  orderID: Text,
  transRequestId: Text.pipe(z.string().min(1)),
  token: z.string().min(1),
  amount: Amount,
});

// The static key from Toki's mini-program doc: the same for every merchant.
const MINI_PROGRAM_API_KEY = 'shoppy123';

/** Whether a mini-program payment completed, for this order and amount (Toki's answer is checked against both). */
const miniProgramCheck = (config: TokiConfig, options: ClientOptions) => {
  const send = gatewayHttp(
    'Toki',
    config.sandbox ? 'https://staging-apps.toki.mn' : 'https://apps.toki.mn',
    options,
  );

  return async (
    payment: { transRequestId: string; token: string },
    orderId: string | null,
    amount: number,
  ) => {
    const query = new URLSearchParams({ transRequestId: payment.transRequestId }).toString();

    const answer = parse(
      'Toki',
      MiniProgramAnswer,
      await send(`/jump/v1/shoppy/transaction-status?${query}`, {
        headers: { authorization: `bearer ${payment.token}`, im_api_key: MINI_PROGRAM_API_KEY },
      }),
      'an unreadable mini-program check',
    );

    if (answer.statusCode !== 200)
      throw new GatewayError(
        `Toki mini-program check failed: ${answer.message ?? answer.statusCode}`,
      );

    const data = answer.data ?? {};

    if (data.status !== 'COMPLETED') return false;

    const paidFor = data.orderId ?? data.orderID;

    if (orderId && paidFor != null && paidFor !== orderId)
      throw new GatewayError('Toki payment belongs to another order');

    if (data.amount != null && data.amount !== toTugrug(amount))
      throw new GatewayError('Toki payment amount does not match');

    if (data.merchantId != null && data.merchantId !== config.merchantId)
      throw new GatewayError('Toki payment merchant does not match');

    return true;
  };
};

/** Merchant QR payment requests through Toki's third-party API (username and password). */
const qrApi = (
  config: TokiConfig & { username: string; password: string },
  options: ClientOptions,
) => {
  const send = gatewayHttp('Toki', 'https://ms-api.toki.mn/third-party-service/v1', options);

  const cache = tokenCache(`toki:${options.cacheKey ?? config.merchantId}`, async () => {
    const answer = parse(
      'Toki',
      TokenAnswer,
      await send('/auth/token', {
        headers: { Authorization: basic(config.username, config.password) },
      }),
      'no access token',
    );

    if (!answer.data) throw new GatewayError(`Toki gave no access token: ${why(answer)}`);

    return { token: answer.data.accessToken, expiresIn: 3000 };
  });

  const authorized = withBearer(send, cache.token);
  const call = (path: string, init?: RequestInit) => authorized(`/payment-request${path}`, init);

  return {
    async verify() {
      cache.forget();
      await cache.token();
    },
    async create(input: CreateInvoiceInput) {
      const answer = parse(
        'Toki',
        RequestAnswer,
        await call('/merchant-qr', {
          method: 'POST',
          body: json({
            successUrl: input.callbackUrl,
            failureUrl: input.callbackUrl,
            orderId: input.invoiceId,
            amount: toTugrug(input.amount),
            notes: input.description,
            merchantId: config.merchantId,
          }),
        }),
        'no payment request',
      );

      if (!answer.data || answer.code !== 200)
        throw new GatewayError(`Toki made no payment request: ${why(answer)}`);

      return answer.data;
    },
    async paid(transactionId: string) {
      const answer = parse(
        'Toki',
        StatusAnswer,
        await call(`/status?${new URLSearchParams({ requestId: transactionId }).toString()}`),
        'an unreadable check',
      );

      if (!answer.data) throw new GatewayError(`Toki check failed: ${why(answer)}`);

      return answer.data.status === 'APPROVED';
    },
    async cancel(requestId: string) {
      await call(`/${encodeURIComponent(requestId)}`, { method: 'PATCH' });
    },
  };
};

/** The mini program's check, and the QR API when both the username and password are set. */
const tokiClient = (config: TokiConfig, options: ClientOptions) => {
  const { username, password } = config;

  return {
    config,
    qr: username && password ? qrApi({ ...config, username, password }, options) : null,
    miniProgramPaid: miniProgramCheck(config, options),
  };
};

/** The payment Toki's mini program posted, if it is this invoice's. */
const miniProgramCallback = (body: unknown, invoice: { invoiceId: string; amount: number }) => {
  const posted = MiniProgramCallback.safeParse(body);

  if (!posted.success) return null;

  if (posted.data.orderID !== invoice.invoiceId) return null;

  if (posted.data.amount !== toTugrug(invoice.amount)) return null;

  return { tokiTransRequestId: posted.data.transRequestId, tokiPayerToken: posted.data.token };
};

/**
 * Toki (Unitel's super app), two ways to pay one invoice:
 *
 * - Mini program: the shop page runs inside Toki and passes `payment.inApp` to
 *   Toki's `buy()`. Toki then posts the payment and the payer's token to the
 *   callback; `check` asks Toki whether that payment completed. Needs only the
 *   merchant id.
 * - Merchant QR: the payer scans the request id in Toki. Needs the third-party
 *   API username and password, so it's made only when both are set.
 */
export const toki = defineIntegration({
  key: 'toki',
  name: 'Toki',
  summary: "Unitel's super app: its mini program, or a QR code payers scan in Toki.",
  category: 'payments',
  countries: ['MN'],
  permission: 'payments.manage',
  keys,
  client: tokiClient,
  async verify({ qr }) {
    await qr?.verify();
  },
  payments: {
    currencies: ['MNT'],
    refunds: 'none',
    pays: 'app-qr',
    async createInvoice({ config, qr }, input) {
      const inApp = {
        app: 'toki',
        data: {
          merchantId: config.merchantId,
          amount: toTugrug(input.amount),
          orderId: input.invoiceId,
          description: input.description,
          callbackUrl: input.callbackUrl,
        },
      };

      if (!qr)
        return {
          gatewayInvoiceId: input.invoiceId,
          payment: { ...NO_INSTRUCTIONS, inApp },
          state: { tokiOrderId: input.invoiceId },
        };

      const request = await qr.create(input);

      return {
        gatewayInvoiceId: request.requestId,
        payment: { ...(await qrInstructions(request.requestId)), inApp },
        state: {
          tokiOrderId: input.invoiceId,
          tokiRequestId: request.requestId,
          tokiTransactionId: request.transactionId ?? request.requestId,
        },
      };
    },
    callback: miniProgramCallback,
    async check({ qr, miniProgramPaid }, { gatewayInvoiceId, amount, state }) {
      const stored = State.parse(state);

      if (stored.tokiTransRequestId && stored.tokiPayerToken) {
        const payment = { transRequestId: stored.tokiTransRequestId, token: stored.tokiPayerToken };

        if (await miniProgramPaid(payment, stored.tokiOrderId ?? null, amount))
          return { paid: true, paidAmount: amount, paymentId: payment.transRequestId };
      }

      // Invoices made before the mini program kept only the transaction id.
      const transactionId =
        stored.tokiTransactionId ?? (stored.tokiRequestId ? gatewayInvoiceId : null);

      if (qr && transactionId && (await qr.paid(transactionId)))
        return { paid: true, paidAmount: amount, paymentId: transactionId };

      return { paid: false, paidAmount: 0, paymentId: null };
    },
    async cancel({ qr }, { gatewayInvoiceId, state }) {
      const stored = State.parse(state);

      const requestId =
        stored.tokiRequestId ?? (stored.tokiTransactionId ? gatewayInvoiceId : null);

      // A mini-program payment has nothing to cancel at Toki.
      if (qr && requestId) await qr.cancel(requestId);
    },
    refund() {
      return Promise.reject(new GatewayError('Toki makes no refunds'));
    },
  },
});

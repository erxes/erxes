import { z } from 'zod';
import {
  basic,
  gatewayHttp,
  json,
  parse,
  qrInstructions,
  Text,
  tokenCache,
  toTugrug,
  withBearer,
} from './http';
import { type DriverOptions, type GatewayDriver, GatewayError, type TokiConfig } from './types';

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

const why = (answer: { code?: number; error?: string | { message?: string | null } | null }) =>
  (typeof answer.error === 'string' ? answer.error : answer.error?.message) ?? answer.code;

/** Toki keeps the id it checks by in the invoice's state. */
const State = z.object({ tokiTransactionId: z.string().optional() });

/**
 * Toki (Unitel's super app) merchant QR payment requests: the payer scans the
 * request id in Toki; checked by its transaction id, cancelled by request id.
 */
export const tokiDriver = (config: TokiConfig, options: DriverOptions = {}): GatewayDriver => {
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
    kind: 'toki',
    refunds: 'none',
    async verify() {
      cache.forget();
      await cache.token();
    },
    async createInvoice(input) {
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

      return {
        gatewayInvoiceId: answer.data.requestId,
        payment: await qrInstructions(answer.data.requestId),
        state: { tokiTransactionId: answer.data.transactionId ?? answer.data.requestId },
      };
    },
    async check(gatewayInvoiceId, amount, state) {
      const requestId = State.parse(state).tokiTransactionId ?? gatewayInvoiceId;

      const answer = parse(
        'Toki',
        StatusAnswer,
        await call(`/status?${new URLSearchParams({ requestId }).toString()}`),
        'an unreadable check',
      );

      if (!answer.data) throw new GatewayError(`Toki check failed: ${why(answer)}`);

      const paid = answer.data.status === 'APPROVED';

      return { paid, paidAmount: paid ? amount : 0, paymentId: paid ? requestId : null };
    },
    async cancel(gatewayInvoiceId) {
      await call(`/${encodeURIComponent(gatewayInvoiceId)}`, { method: 'PATCH' });
    },
    refund() {
      return Promise.reject(new GatewayError('Toki makes no refunds'));
    },
  };
};

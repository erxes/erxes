import { z } from 'zod';
import {
  Amount,
  fromTugrug,
  gatewayHttp,
  json,
  parse,
  qrInstructions,
  Text,
  toTugrug,
} from './http';
import {
  type CreateInvoiceInput,
  type DriverOptions,
  type GatewayDriver,
  GatewayError,
  type HiPayConfig,
} from './types';

/** HiPay answers an array of one object (or the object alone). */
const one = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value: unknown): unknown => (Array.isArray(value) ? value.at(0) : value), schema);

const Result = z.object({
  description: z.string().nullish(),
  message: z.string().nullish(),
});

const CheckoutAnswer = one(
  Result.extend({ checkoutId: z.string().nullish(), qrData: z.string().nullish() }),
);

const StatusAnswer = one(
  Result.extend({
    status: z.string().nullish(),
    amount: Amount.nullish(),
    paymentId: Text.nullish(),
  }),
);

const RefundAnswer = one(Result.extend({ correction_paymentId: Text.nullish() }));

type Result = z.infer<typeof Result>;

const failed = (answer: Result) => answer.description !== 'SUCCESS';

const why = (answer: Result) => answer.message ?? answer.description ?? 'refused';

/** HiPay's API for one merchant: the client secret is the bearer token. */
const hipayClient = (config: HiPayConfig, options: DriverOptions) => {
  const base = config.apiUrl.replace(/\/+$/, '');
  const send = gatewayHttp('HiPay', base, options);
  const headers = { Authorization: `Bearer ${config.clientSecret}` };

  const post = (path: string, body: Record<string, unknown>) =>
    send(path, { method: 'POST', headers, body: json(body) });

  const status = async (checkoutId: string) =>
    parse(
      'HiPay',
      StatusAnswer,
      await send(
        `/checkout/get/${encodeURIComponent(checkoutId)}?${new URLSearchParams({ entityId: config.entityId }).toString()}`,
        { headers },
      ),
      'an unreadable checkout',
    );

  return { base, post, status };
};

const createCheckout = async (
  { base, post }: ReturnType<typeof hipayClient>,
  config: HiPayConfig,
  input: CreateInvoiceInput,
) => {
  const answer = parse(
    'HiPay',
    CheckoutAnswer,
    await post('/checkout', {
      entityId: config.entityId,
      amount: toTugrug(input.amount),
      qrData: true,
      txndesc: input.description.slice(0, 255),
      redirect_uri: input.returnUrl,
      webhook_url: input.callbackUrl,
    }),
    'no checkout',
  );

  if (failed(answer) || !answer.checkoutId)
    throw new GatewayError(`HiPay made no checkout: ${why(answer)}`);

  const form = `${base}/payment?${new URLSearchParams({ checkoutId: answer.checkoutId }).toString()}`;
  const app = `${base}/pay/${encodeURIComponent(answer.checkoutId)}`;

  return {
    gatewayInvoiceId: answer.checkoutId,
    payment: await qrInstructions(
      answer.qrData ?? form,
      [
        { name: 'HiPay', link: app },
        { name: 'HiPay card', link: form },
      ],
      form,
    ),
  };
};

/**
 * HiPay checkouts (developers.hipay.mn): a checkout with a QR, its payment form
 * and app deeplink; checked by checkout id; a payment refunds whole, on the
 * day it was made. Its webhook and the form's return both reach core.
 */
export const hipayDriver = (config: HiPayConfig, options: DriverOptions = {}): GatewayDriver => {
  const client = hipayClient(config, options);

  return {
    kind: 'hipay',
    refunds: 'full',
    async verify() {
      // No sign-in endpoint: wrong credentials answer 401 even for an unknown checkout.
      await client.status('0').catch((error: unknown) => {
        if (error instanceof GatewayError && (error.status === 401 || error.status === 403))
          throw error;
      });
    },
    createInvoice: (input) => createCheckout(client, config, input),
    async check(gatewayInvoiceId, amount) {
      const answer = await client.status(gatewayInvoiceId);
      const paid = answer.status === 'paid';
      const paidAmount = paid ? (answer.amount ? fromTugrug(answer.amount) : amount) : 0;

      return {
        paid: paid && paidAmount >= amount,
        paidAmount,
        paymentId: paid ? (answer.paymentId ?? null) : null,
      };
    },
    async cancel(gatewayInvoiceId) {
      const answer = parse(
        'HiPay',
        CheckoutAnswer,
        await client.post('/checkout/cancel', { checkoutId: gatewayInvoiceId }),
        'an unreadable answer',
      );

      if (failed(answer)) throw new GatewayError(`HiPay kept the checkout: ${why(answer)}`);
    },
    async refund(input) {
      const answer = parse(
        'HiPay',
        RefundAnswer,
        await client.post('/payment/cancel', {
          entityId: config.entityId,
          paymentId: input.paymentId,
        }),
        'an unreadable refund',
      );

      if (failed(answer)) throw new GatewayError(`HiPay refused the refund: ${why(answer)}`);

      return { refundId: answer.correction_paymentId ?? null };
    },
  };
};

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
import { defineIntegration, field, httpsUrl, secret } from '../define';
import { type ClientOptions, type CreateInvoiceInput, GatewayError } from './types';

const keys = z.object({
  entityId: field('Entity ID (client_id)'),
  clientSecret: secret('Client secret'),
  apiUrl: field('API address', httpsUrl()),
});

type HiPayConfig = z.output<typeof keys>;

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
const hipayClient = (config: HiPayConfig, options: ClientOptions) => {
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

  return { config, base, post, status };
};

const createCheckout = async (
  { config, base, post }: ReturnType<typeof hipayClient>,
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
export const hipay = defineIntegration({
  key: 'hipay',
  name: 'HiPay',
  summary: 'Checkouts payers pay by card, QR code or the HiPay app.',
  category: 'payments',
  countries: ['MN'],
  permission: 'payments.manage',
  keys,
  client: hipayClient,
  async verify({ status }) {
    // No sign-in endpoint: wrong credentials answer 401 even for an unknown checkout.
    await status('0').catch((error: unknown) => {
      if (error instanceof GatewayError && (error.status === 401 || error.status === 403))
        throw error;
    });
  },
  payments: {
    currencies: ['MNT'],
    refunds: 'full',
    pays: 'card',
    createInvoice: createCheckout,
    async check({ status }, { gatewayInvoiceId, amount }) {
      const answer = await status(gatewayInvoiceId);
      const paid = answer.status === 'paid';
      const paidAmount = paid ? (answer.amount ? fromTugrug(answer.amount) : amount) : 0;

      return {
        paid: paid && paidAmount >= amount,
        paidAmount,
        paymentId: paid ? (answer.paymentId ?? null) : null,
      };
    },
    async cancel({ post }, { gatewayInvoiceId }) {
      const answer = parse(
        'HiPay',
        CheckoutAnswer,
        await post('/checkout/cancel', { checkoutId: gatewayInvoiceId }),
        'an unreadable answer',
      );

      if (failed(answer)) throw new GatewayError(`HiPay kept the checkout: ${why(answer)}`);
    },
    async refund({ config, post }, { paymentId }) {
      const answer = parse(
        'HiPay',
        RefundAnswer,
        await post('/payment/cancel', { entityId: config.entityId, paymentId }),
        'an unreadable refund',
      );

      if (failed(answer)) throw new GatewayError(`HiPay refused the refund: ${why(answer)}`);

      return { refundId: answer.correction_paymentId ?? null };
    },
  },
});

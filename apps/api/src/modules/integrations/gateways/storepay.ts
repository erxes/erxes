import { z } from 'zod';
import {
  Amount,
  basic,
  gatewayHttp,
  json,
  mongolianPhone,
  NO_INSTRUCTIONS,
  parse,
  Text,
  tokenCache,
  toTugrug,
  withBearer,
  defineIntegration,
  digits,
  field,
  secret,
  type ClientOptions,
  type CreateInvoiceInput,
  GatewayError,
} from '@erxes/plugin-sdk/integrations';

const keys = z.object({
  storeId: field('Store ID', digits()),
  username: field('Username'),
  password: secret('Password'),
  appUsername: field('App username'),
  appPassword: secret('App password'),
});

type StorePayConfig = z.output<typeof keys>;

const TokenAnswer = z.object({
  access_token: z.string().min(1),
  expires_in: z.coerce.number().optional(),
});

const Answer = z.object({
  status: z.string().nullish(),
  value: z.unknown().optional(),
  msgList: z.array(z.object({ code: z.string().nullish(), text: z.string().nullish() })).nullish(),
});

const why = (answer: z.infer<typeof Answer>) =>
  answer.msgList?.[0]?.text ?? answer.msgList?.[0]?.code ?? answer.status ?? 'refused';

/** StorePay's loan changes: 2 cancels the whole loan. */
const CANCEL_LOAN = 2;

/** StorePay's merchant API with its access token (password grant, app credentials). */
const storepayClient = (config: StorePayConfig, options: ClientOptions) => {
  const send = gatewayHttp('StorePay', 'https://service.storepay.mn', options);

  const cache = tokenCache(`storepay:${options.cacheKey ?? config.username}`, async () => {
    const query = new URLSearchParams({
      grant_type: 'password',
      username: config.username,
      password: config.password,
    });

    const answer = parse(
      'StorePay',
      TokenAnswer,
      await send(`/merchant-uaa/oauth/token?${query.toString()}`, {
        method: 'POST',
        headers: { Authorization: basic(config.appUsername, config.appPassword) },
        body: json({ username: config.username, password: config.password }),
      }),
      'no access token',
    );

    return { token: answer.access_token, expiresIn: answer.expires_in };
  });

  const authorized = withBearer(send, cache.token);

  const call = async (path: string, body?: Record<string, unknown>) =>
    parse(
      'StorePay',
      Answer,
      await authorized(`/lend-merchant${path}`, body ? { method: 'POST', body: json(body) } : {}),
      'an unreadable answer',
    );

  return { config, cache, call };
};

type Client = ReturnType<typeof storepayClient>;

/** A loan request to the payer's phone, once StorePay says it can lend them the amount. */
const requestLoan = async ({ call, config }: Client, input: CreateInvoiceInput) => {
  const mobileNumber = Number(mongolianPhone('StorePay', input.payerPhone));
  const amount = toTugrug(input.amount);
  const limit = await call('/user/possibleAmount', { mobileNumber });
  const lendable = Amount.safeParse(limit.value);

  if (!lendable.success || lendable.data < amount)
    throw new GatewayError(`StorePay can't lend this payer ₮${amount}: ${why(limit)}`, 400);

  const loan = await call('/merchant/loan', {
    storeId: Number(config.storeId),
    mobileNumber,
    description: input.description,
    amount,
    callbackUrl: input.callbackUrl,
    requestId: input.invoiceId,
  });

  const loanId = Text.safeParse(loan.value);

  if (loan.status !== 'Success' || !loanId.success || !loanId.data)
    throw new GatewayError(`StorePay made no loan: ${why(loan)}`);

  return { gatewayInvoiceId: loanId.data, payment: NO_INSTRUCTIONS };
};

/**
 * StorePay buy-now-pay-later: a loan request to the payer's phone, which they
 * confirm in the StorePay app; checked by loan id. A refund cancels the loan.
 */
export const storepay = defineIntegration({
  key: 'storepay',
  name: 'StorePay',
  summary: 'Buy now, pay later: payers confirm a loan in the StorePay app.',
  category: 'payments',
  countries: ['MN'],
  permission: 'payments.manage',
  keys,
  client: storepayClient,
  async verify({ cache }) {
    cache.forget();
    await cache.token();
  },
  payments: {
    currencies: ['MNT'],
    refunds: 'full',
    pays: 'installments',
    createInvoice: requestLoan,
    async check({ call }, { gatewayInvoiceId, amount }) {
      const answer = await call(`/merchant/loan/check/${encodeURIComponent(gatewayInvoiceId)}`);

      const paid = answer.value === true;

      return { paid, paidAmount: paid ? amount : 0, paymentId: paid ? gatewayInvoiceId : null };
    },
    async cancel() {
      // A loan the payer hasn't confirmed lapses; a confirmed one is refunded instead.
    },
    async refund({ call }, { paymentId, note }) {
      const answer = await call('/merchant/loanChange', {
        changeTypeId: CANCEL_LOAN,
        loanId: Number(paymentId),
        reason: note.slice(0, 255),
      });

      if (answer.status !== 'Success')
        throw new GatewayError(`StorePay kept the loan: ${why(answer)}`);

      return { refundId: null };
    },
  },
});

import { z } from 'zod';
import {
  basic,
  decimalAmount,
  fromDecimal,
  gatewayHttp,
  json,
  pageInstructions,
  parse,
  tokenCache,
  withBearer,
} from './http';
import { defineIntegration, field, secret, toggle } from '../define';
import { type ClientOptions, type CreateInvoiceInput, GatewayError } from './types';

const keys = z.object({
  clientId: field('Client ID'),
  clientSecret: secret('Client secret'),
  sandbox: toggle('Sandbox (test environment)'),
});

type PayPalConfig = z.output<typeof keys>;

const TokenAnswer = z.object({
  access_token: z.string().min(1),
  expires_in: z.coerce.number().optional(),
});

const Money = z.object({ value: z.string(), currency_code: z.string() });

const Order = z.object({
  id: z.string().min(1),
  status: z.string(),
  links: z
    .array(z.object({ rel: z.string(), href: z.string() }))
    .nullish()
    .transform((links) => links ?? []),
  purchase_units: z
    .array(
      z.object({
        payments: z
          .object({
            captures: z
              .array(z.object({ id: z.string(), status: z.string(), amount: Money }))
              .nullish(),
          })
          .nullish(),
      }),
    )
    .nullish(),
});

const Refund = z.object({ id: z.string().min(1) });

/** The invoice's currency, which PayPal refunds name. */
const State = z.object({ paypalCurrency: z.string() });

/** PayPal's REST API with its access token, cached per connection and mode. */
const paypalClient = (config: PayPalConfig, options: ClientOptions) => {
  const send = gatewayHttp(
    'PayPal',
    config.sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com',
    options,
  );

  const cache = tokenCache(
    `paypal:${options.cacheKey ?? config.clientId}:${config.sandbox ? 'sandbox' : 'live'}`,
    async () => {
      const answer = parse(
        'PayPal',
        TokenAnswer,
        await send('/v1/oauth2/token', {
          method: 'POST',
          headers: {
            Authorization: basic(config.clientId, config.clientSecret),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        }),
        'no access token',
      );

      return { token: answer.access_token, expiresIn: answer.expires_in };
    },
  );

  const call = withBearer(send, cache.token);

  const order = async (path: string, init: RequestInit = {}) =>
    parse('PayPal', Order, await call(path, init), 'an unreadable order');

  return { cache, call, order };
};

type Client = ReturnType<typeof paypalClient>;

const createOrder = async ({ order }: Client, input: CreateInvoiceInput) => {
  const created = await order('/v2/checkout/orders', {
    method: 'POST',
    headers: { 'PayPal-Request-Id': `create-${input.invoiceId}` },
    body: json({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: input.invoiceId,
          description: input.description.slice(0, 127),
          amount: {
            currency_code: input.currency,
            value: decimalAmount(input.amount, input.currency),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            user_action: 'PAY_NOW',
            return_url: input.returnUrl,
            cancel_url: input.returnUrl,
          },
          ...(input.payerEmail ? { email_address: input.payerEmail } : {}),
        },
      },
    }),
  });

  const approve = created.links.find(
    (link) => link.rel === 'payer-action' || link.rel === 'approve',
  );

  if (!approve) throw new GatewayError('PayPal gave no page to approve the order');

  return {
    gatewayInvoiceId: created.id,
    payment: await pageInstructions(approve.href, 'PayPal'),
    state: { paypalCurrency: input.currency },
  };
};

/** The order, captured once the payer approved it (PayPal-Request-Id makes it once). */
const checkOrder = async ({ order }: Client, orderId: string, amount: number) => {
  const path = `/v2/checkout/orders/${encodeURIComponent(orderId)}`;
  let current = await order(path);

  if (current.status === 'APPROVED')
    current = await order(`${path}/capture`, {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `capture-${orderId}` },
      body: '{}',
    });

  const capture = current.purchase_units?.[0]?.payments?.captures?.find(
    (item) => item.status === 'COMPLETED',
  );

  const paidAmount = capture ? fromDecimal(capture.amount.value, capture.amount.currency_code) : 0;

  return {
    paid: Boolean(capture) && paidAmount >= amount,
    paidAmount,
    paymentId: capture?.id ?? null,
  };
};

/**
 * PayPal Checkout orders (v2): the payer approves the order on PayPal's page,
 * which sends them back through core; the check captures an approved order.
 * Refunds of any part go to the capture.
 */
export const paypal = defineIntegration({
  key: 'paypal',
  name: 'PayPal',
  summary: 'Payers pay with PayPal or a card on PayPal’s page.',
  category: 'payments',
  countries: [],
  permission: 'payments.manage',
  dashboard: 'https://developer.paypal.com/dashboard/applications',
  keys,
  client: paypalClient,
  async verify({ cache }) {
    cache.forget();
    await cache.token();
  },
  payments: {
    currencies: [
      'AUD',
      'BRL',
      'CAD',
      'CHF',
      'CNY',
      'CZK',
      'DKK',
      'EUR',
      'GBP',
      'HKD',
      'HUF',
      'ILS',
      'JPY',
      'MXN',
      'MYR',
      'NOK',
      'NZD',
      'PHP',
      'PLN',
      'SEK',
      'SGD',
      'THB',
      'TWD',
      'USD',
    ],
    refunds: 'partial',
    pays: 'paypal',
    createInvoice: createOrder,
    check: (client, { gatewayInvoiceId, amount }) => checkOrder(client, gatewayInvoiceId, amount),
    async cancel() {
      // An order nobody approved lapses on its own; PayPal has no call to void it.
    },
    async refund({ call }, { paymentId, amount, note, state }) {
      const currency = State.parse(state).paypalCurrency;

      const refund = parse(
        'PayPal',
        Refund,
        await call(`/v2/payments/captures/${encodeURIComponent(paymentId)}/refund`, {
          method: 'POST',
          body: json({
            amount: { currency_code: currency, value: decimalAmount(amount, currency) },
            note_to_payer: note.slice(0, 255),
          }),
        }),
        'no refund',
      );

      return { refundId: refund.id };
    },
  },
});

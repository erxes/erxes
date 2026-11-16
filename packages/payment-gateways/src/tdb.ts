import { z } from 'zod';
import {
  Amount,
  basic,
  fromTugrug,
  gatewayHttp,
  json,
  pageInstructions,
  parse,
  Text,
  toTugrug,
} from './http';
import { type DriverOptions, type GatewayDriver, GatewayError, type TdbConfig } from './types';

const OrderAnswer = z.object({
  order: z.object({
    id: Text.pipe(z.string().min(1)),
    password: z.string().min(1),
    hppUrl: z.url(),
  }),
});

const DetailAnswer = z.object({
  order: z.object({ status: z.string().nullish(), amount: Amount.nullish() }),
});

/** The order password the bank asks for on every read; kept with the invoice. */
const State = z.object({ tdbPassword: z.string() });

/** Statuses of a paid order. */
const PAID = new Set(['FULLYPAID', 'PAID']);

/**
 * TDB (Trade and Development Bank) card e-commerce: an order with a hosted
 * payment page (`hppUrl?id=…&password=…`), which sends the payer to the
 * callback address; read back by id and password. Basic auth.
 */
export const tdbDriver = (config: TdbConfig, options: DriverOptions = {}): GatewayDriver => {
  const send = gatewayHttp('TDB', config.apiUrl.replace(/\/+$/, ''), options);
  const headers = { Authorization: basic(config.username, config.password) };

  const detail = async (id: string, password: string) =>
    parse(
      'TDB',
      DetailAnswer,
      await send(
        `/order/${encodeURIComponent(id)}?${new URLSearchParams({ password }).toString()}`,
        {
          headers,
        },
      ),
      'an unreadable order',
    );

  return {
    kind: 'tdb',
    async verify() {
      // No sign-in endpoint: wrong credentials answer 401 even for an unknown order.
      await detail('0', '0').catch((error: unknown) => {
        if (error instanceof GatewayError && (error.status === 401 || error.status === 403))
          throw error;
      });
    },
    async createInvoice(input) {
      const { order } = parse(
        'TDB',
        OrderAnswer,
        await send('/order', {
          method: 'POST',
          headers,
          body: json({
            order: {
              typeRid: '1',
              amount: toTugrug(input.amount),
              currency: 'MNT',
              description: input.description,
              language: 'mn',
              hppRedirectUrl: input.returnUrl,
            },
          }),
        }),
        'no order',
      );

      const page = new URL(order.hppUrl);

      page.searchParams.set('id', order.id);
      page.searchParams.set('password', order.password);

      return {
        gatewayInvoiceId: order.id,
        payment: await pageInstructions(page.toString(), 'TDB'),
        state: { tdbPassword: order.password },
      };
    },
    async check(gatewayInvoiceId, amount, state) {
      const { order } = await detail(gatewayInvoiceId, State.parse(state).tdbPassword);
      const paid = PAID.has((order.status ?? '').toUpperCase());
      const paidAmount = paid ? (order.amount ? fromTugrug(order.amount) : amount) : 0;

      return {
        paid: paid && paidAmount >= amount,
        paidAmount,
        paymentId: paid ? gatewayInvoiceId : null,
      };
    },
    async cancel() {
      // An unpaid TDB order lapses on its own.
    },
    refund() {
      return Promise.reject(new GatewayError('TDB refunds are made in the bank’s merchant portal'));
    },
  };
};

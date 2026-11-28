import { z } from 'zod';
import {
  type ClientOptions,
  defineIntegration,
  NO_INSTRUCTIONS,
  pageInstructions,
  parse,
  secret,
} from '@erxes/plugin-sdk/integrations';
import { createCustomer, deleteCustomer, findCustomer, updateCustomer } from './actions';
import { createCoupon } from './couponActions';
import { chargeCustomer, getBalance, refundPayment } from './paymentActions';
import { stripeHooks, stripeSend } from './hooks';
import { STRIPE_RECORDS } from './records';
import { STRIPE_TRIGGERS } from './triggers';

const keys = z.object({ secretKey: secret('Secret key') });

type StripeConfig = z.output<typeof keys>;

const Session = z.object({
  id: z.string().min(1),
  url: z.url().nullish(),
  payment_status: z.string().nullish(),
  amount_total: z.number().int().nullish(),
  payment_intent: z.string().nullish(),
});

const Refund = z.object({ id: z.string().min(1) });

const stripeClient =
  (config: StripeConfig, options: ClientOptions) =>
  (
    path: string,
    form?: Record<string, string>,
    headers?: Record<string, string>,
    method = form ? 'POST' : 'GET',
  ) =>
    stripeSend(config, method, path, form && new URLSearchParams(form), headers, options);

export type StripeClient = ReturnType<typeof stripeClient>;

/**
 * Stripe Checkout: a hosted page for cards and wallets in the invoice's
 * currency, which sends the payer to the callback address; checked by session.
 * Stripe takes amounts in the currency's smallest unit, as core keeps them.
 * Refunds of any part go to the session's payment intent.
 */
export const stripe = defineIntegration({
  key: 'stripe',
  name: 'Stripe',
  summary: "Cards, Apple Pay and Google Pay on Stripe's page, in any currency it takes.",
  category: 'payments',
  countries: [],
  permission: 'payments.manage',
  dashboard: 'https://dashboard.stripe.com/apikeys',
  keys,
  client: stripeClient,
  async verify(call) {
    await call('/balance');
  },
  payments: {
    currencies: [],
    refunds: 'partial',
    pays: 'card-wallet',
    async createInvoice(call, input) {
      const session = parse(
        'Stripe',
        Session,
        await call('/checkout/sessions', {
          mode: 'payment',
          client_reference_id: input.invoiceId,
          'metadata[invoiceId]': input.invoiceId,
          'line_items[0][quantity]': '1',
          'line_items[0][price_data][currency]': input.currency.toLowerCase(),
          'line_items[0][price_data][unit_amount]': String(input.amount),
          'line_items[0][price_data][product_data][name]': input.description,
          success_url: input.returnUrl,
          cancel_url: input.returnUrl,
          ...(input.payerEmail ? { customer_email: input.payerEmail } : {}),
        }),
        'no checkout session',
      );

      return {
        gatewayInvoiceId: session.id,
        payment: session.url ? await pageInstructions(session.url, 'Stripe') : NO_INSTRUCTIONS,
      };
    },
    async check(call, { gatewayInvoiceId, amount }) {
      const session = parse(
        'Stripe',
        Session,
        await call(`/checkout/sessions/${encodeURIComponent(gatewayInvoiceId)}`),
        'an unreadable session',
      );

      const paid = session.payment_status === 'paid';
      const paidAmount = paid ? (session.amount_total ?? amount) : 0;

      return {
        paid: paid && paidAmount >= amount,
        paidAmount,
        paymentId: paid ? (session.payment_intent ?? null) : null,
      };
    },
    async cancel(call, { gatewayInvoiceId }) {
      await call(`/checkout/sessions/${encodeURIComponent(gatewayInvoiceId)}/expire`, {});
    },
    async refund(call, { paymentId, amount, note }) {
      const refund = parse(
        'Stripe',
        Refund,
        await call('/refunds', {
          payment_intent: paymentId,
          amount: String(amount),
          'metadata[note]': note.slice(0, 500),
        }),
        'no refund',
      );

      return { refundId: refund.id };
    },
  },
  hooks: stripeHooks,
  triggers: STRIPE_TRIGGERS,
  actions: [
    createCustomer,
    updateCustomer,
    findCustomer,
    deleteCustomer,
    chargeCustomer,
    refundPayment,
    createCoupon,
    getBalance,
  ],
  records: STRIPE_RECORDS,
});

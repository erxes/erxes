import { z } from 'zod';
import { gatewayHttp, NO_INSTRUCTIONS, pageInstructions, parse } from './http';
import type { DriverOptions, GatewayDriver, StripeConfig } from './types';

const Session = z.object({
  id: z.string().min(1),
  url: z.url().nullish(),
  payment_status: z.string().nullish(),
  amount_total: z.number().int().nullish(),
  payment_intent: z.string().nullish(),
});

const Refund = z.object({ id: z.string().min(1) });

/**
 * Stripe Checkout: a hosted page for cards and wallets in the invoice's
 * currency, which sends the payer to the callback address; checked by session.
 * Stripe takes amounts in the currency's smallest unit, as core keeps them.
 * Refunds of any part go to the session's payment intent.
 */
export const stripeDriver = (config: StripeConfig, options: DriverOptions = {}): GatewayDriver => {
  const send = gatewayHttp('Stripe', 'https://api.stripe.com/v1', options);

  const call = (path: string, form?: Record<string, string>) =>
    send(path, {
      method: form ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      body: form ? new URLSearchParams(form).toString() : undefined,
    });

  return {
    kind: 'stripe',
    refunds: 'partial',
    async verify() {
      await call('/balance');
    },
    async createInvoice(input) {
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
    async check(gatewayInvoiceId, amount) {
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
    async cancel(gatewayInvoiceId) {
      await call(`/checkout/sessions/${encodeURIComponent(gatewayInvoiceId)}/expire`, {});
    },
    async refund(input) {
      const refund = parse(
        'Stripe',
        Refund,
        await call('/refunds', {
          payment_intent: input.paymentId,
          amount: String(input.amount),
          'metadata[note]': input.note.slice(0, 500),
        }),
        'no refund',
      );

      return { refundId: refund.id };
    },
  };
};

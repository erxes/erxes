import { z } from 'zod';
import { hmacSha256, safeEqual } from '~/lib/crypto';
import { type AppHooks, DeliveryRefused, hookTrigger } from '../appDefinition';
import { gatewayHttp, parse } from './http';
import { type ClientOptions, GatewayError } from './types';

type StripeKeys = { secretKey: string };

const TOLERANCE_SECONDS = 300;

const Endpoint = z.object({ id: z.string().min(1), secret: z.string().optional() });

const StripeEvent = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.object({ object: z.record(z.string(), z.unknown()) }),
});

export const stripeSend = (
  keys: StripeKeys,
  method: string,
  path: string,
  form?: URLSearchParams,
  headers: Record<string, string> = {},
  options: ClientOptions = {},
) =>
  gatewayHttp(
    'Stripe',
    'https://api.stripe.com/v1',
    options,
  )(path, {
    method,
    headers: {
      ...headers,
      Authorization: `Bearer ${keys.secretKey}`,
      ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: form?.toString(),
  });

const endpointForm = (url: string | null, events: string[]) => {
  const form = new URLSearchParams();

  if (url) {
    form.set('url', url);
    form.set('description', 'erxes automations');
  }

  events.forEach((event) => form.append('enabled_events[]', event));

  return form;
};

const missing = (error: unknown) => error instanceof GatewayError && error.status === 404;

const signed = (header: string | undefined) => {
  const parts = (header ?? '').split(',').map((part) => part.split('='));
  const at = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.flatMap(([key, value]) => (key === 'v1' && value ? [value] : []));

  return { at: Number(at), signatures };
};

export const stripeHooks: AppHooks<StripeKeys> = {
  scope: z.object({}),
  async subscribe({ keys, url, events, externalId }) {
    if (externalId) {
      try {
        const updated = parse(
          'Stripe',
          Endpoint,
          await stripeSend(
            keys,
            'POST',
            `/webhook_endpoints/${encodeURIComponent(externalId)}`,
            endpointForm(null, events),
          ),
          'no webhook endpoint',
        );

        return { externalId: updated.id };
      } catch (error) {
        if (!missing(error)) throw error;
      }
    }

    const made = parse(
      'Stripe',
      Endpoint,
      await stripeSend(keys, 'POST', '/webhook_endpoints', endpointForm(url, events)),
      'no webhook endpoint',
    );

    return { externalId: made.id, secret: made.secret };
  },
  async unsubscribe({ keys, externalId }) {
    try {
      await stripeSend(keys, 'DELETE', `/webhook_endpoints/${encodeURIComponent(externalId)}`);
    } catch (error) {
      if (!missing(error)) throw error;
    }
  },
  receive(delivery, secret) {
    const { at, signatures } = signed(delivery.headers['stripe-signature']);
    const expected = hmacSha256(secret, `${at}.${delivery.raw}`, 'hex');

    if (!Number.isFinite(at) || !signatures.some((value) => safeEqual(value, expected)))
      throw new DeliveryRefused('the Stripe signature does not match');

    if (Math.abs(Date.now() / 1000 - at) > TOLERANCE_SECONDS)
      throw new DeliveryRefused('the Stripe signature is too old');

    const event = StripeEvent.safeParse(delivery.body);

    if (!event.success) return { events: [] };

    return {
      events: [
        {
          id: event.data.id,
          type: event.data.type,
          payload: { ...event.data.data.object, stripeEventId: event.data.id },
        },
      ],
    };
  },
};

const MONEY = [
  { key: 'id', label: 'Stripe id', type: 'text' },
  { key: 'amount', label: 'Amount (smallest unit)', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'text' },
  { key: 'customer', label: 'Stripe customer', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'receipt_email', label: 'Receipt email', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
] as const;

const CUSTOMER = [
  { key: 'id', label: 'Stripe customer', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
] as const;

const SUBSCRIPTION = [
  { key: 'id', label: 'Subscription', type: 'text' },
  { key: 'customer', label: 'Stripe customer', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'cancel_at_period_end', label: 'Cancels at period end', type: 'boolean' },
] as const;

const INVOICE = [
  { key: 'id', label: 'Invoice', type: 'text' },
  { key: 'customer', label: 'Stripe customer', type: 'text' },
  { key: 'customer_email', label: 'Customer email', type: 'text' },
  { key: 'amount_due', label: 'Amount due', type: 'number' },
  { key: 'amount_paid', label: 'Amount paid', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'text' },
  { key: 'hosted_invoice_url', label: 'Invoice page', type: 'text' },
] as const;

const trigger = (
  key: string,
  on: string,
  label: string,
  description: string,
  outputs: readonly { key: string; label: string; type: 'text' | 'number' | 'boolean' }[],
) => hookTrigger({ key, on, label, description, outputs: [...outputs] });

export const STRIPE_TRIGGERS = [
  trigger(
    'payment_succeeded',
    'payment_intent.succeeded',
    'Payment succeeded',
    'A payment goes through',
    MONEY,
  ),
  trigger(
    'payment_failed',
    'payment_intent.payment_failed',
    'Payment failed',
    'A payment attempt fails',
    MONEY,
  ),
  trigger(
    'checkout_completed',
    'checkout.session.completed',
    'Checkout completed',
    'A customer finishes a Checkout page',
    [
      { key: 'id', label: 'Checkout session', type: 'text' },
      { key: 'amount_total', label: 'Total', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'text' },
      { key: 'customer', label: 'Stripe customer', type: 'text' },
      { key: 'client_reference_id', label: 'Reference', type: 'text' },
      { key: 'payment_status', label: 'Payment status', type: 'text' },
    ],
  ),
  trigger(
    'charge_refunded',
    'charge.refunded',
    'Charge refunded',
    'A charge is refunded, in part or in full',
    [...MONEY, { key: 'amount_refunded', label: 'Refunded', type: 'number' }],
  ),
  trigger(
    'dispute_created',
    'charge.dispute.created',
    'Dispute opened',
    'A customer disputes a charge with their bank',
    [
      { key: 'id', label: 'Dispute', type: 'text' },
      { key: 'charge', label: 'Charge', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'text' },
      { key: 'reason', label: 'Reason', type: 'text' },
    ],
  ),
  trigger(
    'customer_created',
    'customer.created',
    'Customer created',
    'A customer is added in Stripe',
    CUSTOMER,
  ),
  trigger(
    'subscription_created',
    'customer.subscription.created',
    'Subscription started',
    'A customer subscribes',
    SUBSCRIPTION,
  ),
  trigger(
    'subscription_updated',
    'customer.subscription.updated',
    'Subscription changed',
    'A subscription changes plan, status or renewal',
    SUBSCRIPTION,
  ),
  trigger(
    'subscription_cancelled',
    'customer.subscription.deleted',
    'Subscription ended',
    'A subscription ends',
    SUBSCRIPTION,
  ),
  trigger('invoice_paid', 'invoice.paid', 'Invoice paid', 'A Stripe invoice is paid', INVOICE),
  trigger(
    'invoice_payment_failed',
    'invoice.payment_failed',
    'Invoice payment failed',
    'Paying a Stripe invoice fails',
    INVOICE,
  ),
];

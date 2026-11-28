import { hookTrigger } from '@erxes/plugin-sdk/integrations';
import { EVENT, outputsOf, type StripeField } from './fields';
import {
  CHARGE,
  CHECKOUT_SESSION,
  CUSTOMER,
  DISPUTE,
  INVOICE,
  PAYMENT_INTENT,
  SUBSCRIPTION,
} from './objects';

const IN_CENTS = "Amounts are in the currency's smallest unit, such as cents.";

const TRIGGERS: [string, string, string, string, StripeField[]][] = [
  [
    'payment_succeeded',
    'payment_intent.succeeded',
    'Payment succeeded',
    `A payment goes through. ${IN_CENTS}`,
    PAYMENT_INTENT,
  ],
  [
    'payment_failed',
    'payment_intent.payment_failed',
    'Payment failed',
    `A payment attempt fails. ${IN_CENTS}`,
    PAYMENT_INTENT,
  ],
  [
    'checkout_completed',
    'checkout.session.completed',
    'Checkout completed',
    `A customer finishes a Checkout page. ${IN_CENTS}`,
    CHECKOUT_SESSION,
  ],
  [
    'charge_refunded',
    'charge.refunded',
    'Charge refunded',
    `A charge is refunded, in part or in full. ${IN_CENTS}`,
    CHARGE,
  ],
  [
    'dispute_created',
    'charge.dispute.created',
    'Dispute opened',
    `A customer disputes a charge with their bank. ${IN_CENTS}`,
    DISPUTE,
  ],
  [
    'customer_created',
    'customer.created',
    'Customer created',
    `A customer is added in Stripe. ${IN_CENTS}`,
    CUSTOMER,
  ],
  [
    'subscription_created',
    'customer.subscription.created',
    'Subscription started',
    `A customer subscribes. ${IN_CENTS}`,
    SUBSCRIPTION,
  ],
  [
    'subscription_updated',
    'customer.subscription.updated',
    'Subscription changed',
    `A subscription changes plan, status or renewal. ${IN_CENTS}`,
    SUBSCRIPTION,
  ],
  [
    'subscription_cancelled',
    'customer.subscription.deleted',
    'Subscription ended',
    `A subscription ends. ${IN_CENTS}`,
    SUBSCRIPTION,
  ],
  [
    'invoice_paid',
    'invoice.paid',
    'Invoice paid',
    `A Stripe invoice is paid. ${IN_CENTS}`,
    INVOICE,
  ],
  [
    'invoice_payment_failed',
    'invoice.payment_failed',
    'Invoice payment failed',
    `Paying a Stripe invoice fails. ${IN_CENTS}`,
    INVOICE,
  ],
];

export const fieldsOf = new Map(TRIGGERS.map(([, on, , , fields]) => [on, fields]));

export const STRIPE_TRIGGERS = TRIGGERS.map(([key, on, label, description, fields]) =>
  hookTrigger({ key, on, label, description, outputs: outputsOf([...EVENT, ...fields]) }),
);

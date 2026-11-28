import { z } from 'zod';
import { appAction, GatewayError, parse } from '@erxes/plugin-sdk/integrations';
import {
  Amount,
  Currency,
  CURRENCY_FIELD,
  CUSTOMER_FIELD,
  formOf,
  Metadata,
  METADATA_FIELD,
  once,
  optionsOf,
  SMALLEST_UNIT,
  stripeId,
  words,
} from './actionFields';
import type { StripeClient } from './server';

const REFUND_REASONS = ['requested_by_customer', 'duplicate', 'fraudulent'] as const;

const REASON_LABELS: Record<(typeof REFUND_REASONS)[number], string> = {
  requested_by_customer: 'The customer asked',
  duplicate: 'Duplicate payment',
  fraudulent: 'Fraud',
};

const ChargeInput = z.object({
  customer: stripeId('cus'),
  amount: Amount,
  currency: Currency,
  paymentMethod: stripeId('pm').optional(),
  description: words(1000).optional(),
  receiptEmail: z.email().max(512).optional(),
  metadata: Metadata.optional(),
});

const RefundInput = z.object({
  payment: words(255).pipe(
    z.string().regex(/^(pi|ch|py)_\w+$/, 'a Stripe payment (pi_…) or charge (ch_…) id'),
  ),
  amount: Amount.optional(),
  reason: z.enum(REFUND_REASONS).optional(),
  metadata: Metadata.optional(),
});

const BalanceInput = z.object({ currency: Currency.optional() });

const Saved = z.object({
  invoice_settings: z.object({ default_payment_method: z.string().nullish() }).nullish(),
});

const Methods = z.object({ data: z.array(z.object({ id: z.string().min(1) })) });

const Payment = z.object({
  id: z.string().min(1),
  status: z.string(),
  amount: z.int(),
  latest_charge: z.string().nullish(),
});

const Refund = z.object({ id: z.string().min(1), status: z.string().nullish(), amount: z.int() });

const Funds = z.array(z.object({ amount: z.int(), currency: z.string() }));

const Balance = z.object({ available: Funds, pending: Funds });

const AMOUNT = { key: 'amount', label: 'Amount (smallest unit)', type: 'number' } as const;

const STATUS = { key: 'status', label: 'Status', type: 'text' } as const;

/** The customer's default payment method, else the newest one Stripe keeps for them. */
const savedMethod = async (client: StripeClient, customer: string) => {
  const path = `/customers/${encodeURIComponent(customer)}`;
  const saved = parse('Stripe', Saved, await client(path), 'no customer');
  const preferred = saved.invoice_settings?.default_payment_method;

  if (preferred) return preferred;

  const [newest] = parse(
    'Stripe',
    Methods,
    await client(`${path}/payment_methods?limit=1`),
    'no payment methods',
  ).data;

  if (!newest)
    throw new GatewayError('This customer has no saved card or payment method in Stripe', 400);

  return newest.id;
};

export const chargeCustomer = appAction<StripeClient, z.output<typeof ChargeInput>>({
  key: 'charge_customer',
  label: 'Charge a customer',
  description: "Take a payment from a customer's saved card or payment method, without them there",
  fields: [
    CUSTOMER_FIELD,
    { key: 'amount', label: 'Amount', type: 'number', required: true, description: SMALLEST_UNIT },
    CURRENCY_FIELD,
    {
      key: 'paymentMethod',
      label: 'Payment method',
      type: 'text',
      required: false,
      placeholder: 'pm_…',
      description: "Blank: the customer's default one",
    },
    { key: 'description', label: 'Description', type: 'text', required: false },
    {
      key: 'receiptEmail',
      label: 'Send the receipt to',
      type: 'text',
      required: false,
      placeholder: '{{subject.primaryEmail}}',
    },
    METADATA_FIELD,
  ],
  outputs: [
    { key: 'paymentId', label: 'Payment', type: 'text' },
    { key: 'chargeId', label: 'Charge', type: 'text' },
    STATUS,
    AMOUNT,
  ],
  input: ChargeInput,
  async run({ client, input, idempotencyKey }) {
    const paymentMethod = input.paymentMethod ?? (await savedMethod(client, input.customer));

    const form = formOf(
      {
        amount: input.amount,
        currency: input.currency,
        customer: input.customer,
        payment_method: paymentMethod,
        confirm: 'true',
        off_session: 'true',
        'automatic_payment_methods[enabled]': 'true',
        'automatic_payment_methods[allow_redirects]': 'never',
        description: input.description,
        receipt_email: input.receiptEmail,
      },
      input.metadata,
    );

    const payment = parse(
      'Stripe',
      Payment,
      await client('/payment_intents', form, once(idempotencyKey)),
      'no payment',
    );

    return {
      paymentId: payment.id,
      chargeId: payment.latest_charge ?? '',
      status: payment.status,
      amount: payment.amount,
    };
  },
});

export const refundPayment = appAction<StripeClient, z.output<typeof RefundInput>>({
  key: 'refund_payment',
  label: 'Refund a payment',
  description: 'Give back all or part of a Stripe payment',
  fields: [
    {
      key: 'payment',
      label: 'Payment or charge',
      type: 'text',
      required: true,
      placeholder: 'pi_… or ch_…',
      description: 'Insert it from the trigger or the step that charged',
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'number',
      required: false,
      description: `${SMALLEST_UNIT}. Blank: all that is left`,
    },
    {
      key: 'reason',
      label: 'Reason',
      type: 'select',
      required: false,
      options: optionsOf(REASON_LABELS),
    },
    METADATA_FIELD,
  ],
  outputs: [{ key: 'refundId', label: 'Refund', type: 'text' }, STATUS, AMOUNT],
  input: RefundInput,
  async run({ client, input, idempotencyKey }) {
    const target = input.payment.startsWith('pi_') ? 'payment_intent' : 'charge';

    const refund = parse(
      'Stripe',
      Refund,
      await client(
        '/refunds',
        formOf(
          { [target]: input.payment, amount: input.amount, reason: input.reason },
          input.metadata,
        ),
        once(idempotencyKey),
      ),
      'no refund',
    );

    return { refundId: refund.id, status: refund.status ?? '', amount: refund.amount };
  },
});

const fundsIn = (funds: z.infer<typeof Funds>, currency: string) =>
  funds.find((fund) => fund.currency === currency)?.amount ?? 0;

export const getBalance = appAction<StripeClient, z.output<typeof BalanceInput>>({
  key: 'get_balance',
  label: 'Get the balance',
  description: 'Read what the Stripe account holds, ready to pay out and still on its way',
  fields: [
    {
      ...CURRENCY_FIELD,
      required: false,
      description: 'Its 3-letter code. Blank: the first one Stripe lists',
    },
  ],
  outputs: [
    { key: 'available', label: 'Available (smallest unit)', type: 'number' },
    { key: 'pending', label: 'Pending (smallest unit)', type: 'number' },
    { key: 'currency', label: 'Currency', type: 'text' },
  ],
  input: BalanceInput,
  async run({ client, input }) {
    const balance = parse('Stripe', Balance, await client('/balance'), 'no balance');
    const currency = input.currency ?? balance.available[0]?.currency ?? '';

    return {
      available: fundsIn(balance.available, currency),
      pending: fundsIn(balance.pending, currency),
      currency,
    };
  },
});

import { z } from 'zod';
import { appAction, parse } from '@erxes/plugin-sdk/integrations';
import {
  Amount,
  Currency,
  CURRENCY_FIELD,
  formOf,
  Metadata,
  METADATA_FIELD,
  once,
  optionsOf,
  words,
} from './actionFields';
import type { StripeClient } from './server';

const DISCOUNTS = ['percent', 'amount'] as const;

const DURATIONS = ['once', 'repeating', 'forever'] as const;

const DISCOUNT_LABELS: Record<(typeof DISCOUNTS)[number], string> = {
  percent: 'A percent off',
  amount: 'An amount off',
};

const DURATION_LABELS: Record<(typeof DURATIONS)[number], string> = {
  once: 'Once',
  repeating: 'For some months',
  forever: 'Forever',
};

const Count = z.coerce.number().int().min(1);

const UseBy = z
  .string()
  .trim()
  .transform((value) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59Z` : value))
  .pipe(z.coerce.date());

const CouponInput = z
  .object({
    discount: z.enum(DISCOUNTS),
    value: z.coerce.number().positive(),
    currency: Currency.optional(),
    duration: z.enum(DURATIONS).default('once'),
    months: Count.max(120).optional(),
    name: words(40).optional(),
    maxRedemptions: Count.optional(),
    redeemBy: UseBy.optional(),
    metadata: Metadata.optional(),
  })
  .refine((input) => input.discount === 'amount' || input.value <= 100, {
    message: 'a percent from 1 to 100',
    path: ['value'],
  })
  .refine((input) => input.discount === 'percent' || Amount.safeParse(input.value).success, {
    message: 'an amount in the smallest unit, a whole number',
    path: ['value'],
  })
  .refine((input) => input.discount === 'percent' || Boolean(input.currency), {
    message: 'an amount off needs its currency',
    path: ['currency'],
  })
  .refine((input) => input.duration !== 'repeating' || Boolean(input.months), {
    message: 'give how many months it lasts',
    path: ['months'],
  });

type CouponInput = z.output<typeof CouponInput>;

const Coupon = z.object({ id: z.string().min(1) });

const discountForm = (input: CouponInput) =>
  input.discount === 'percent'
    ? { percent_off: input.value }
    : { amount_off: input.value, currency: input.currency };

export const createCoupon = appAction<StripeClient, CouponInput>({
  key: 'create_coupon',
  label: 'Create a coupon',
  description: 'Add a discount to Stripe for invoices, subscriptions and Checkout pages',
  fields: [
    {
      key: 'discount',
      label: 'Discount',
      type: 'select',
      required: true,
      options: optionsOf(DISCOUNT_LABELS),
    },
    {
      key: 'value',
      label: 'How much off',
      type: 'number',
      required: true,
      description: 'A percent: 1 to 100. An amount: in the smallest unit, $5 is 500',
    },
    { ...CURRENCY_FIELD, required: false, description: 'For an amount off: its 3-letter code' },
    {
      key: 'duration',
      label: 'Lasts',
      type: 'select',
      required: false,
      options: optionsOf(DURATION_LABELS),
      description: 'On a subscription. Blank: once',
    },
    {
      key: 'months',
      label: 'Months',
      type: 'number',
      required: false,
      description: 'With "For some months"',
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: false,
      description: 'Customers see it on invoices and receipts',
    },
    {
      key: 'maxRedemptions',
      label: 'Times it can be used',
      type: 'number',
      required: false,
      description: 'Blank: no limit',
    },
    { key: 'redeemBy', label: 'Use by', type: 'date', required: false },
    METADATA_FIELD,
  ],
  outputs: [{ key: 'couponId', label: 'Coupon', type: 'text' }],
  input: CouponInput,
  async run({ client, input, idempotencyKey }) {
    const form = formOf(
      {
        ...discountForm(input),
        duration: input.duration,
        duration_in_months: input.duration === 'repeating' ? input.months : undefined,
        name: input.name,
        max_redemptions: input.maxRedemptions,
        redeem_by: input.redeemBy && Math.floor(input.redeemBy.getTime() / 1000),
      },
      input.metadata,
    );

    const coupon = parse(
      'Stripe',
      Coupon,
      await client('/coupons', form, once(idempotencyKey)),
      'no coupon',
    );

    return { couponId: coupon.id };
  },
});

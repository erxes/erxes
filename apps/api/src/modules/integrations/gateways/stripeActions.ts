import { z } from 'zod';
import { appAction } from '../define';
import { parse } from './http';
import { stripeSend } from './stripeHooks';

type StripeKeys = { secretKey: string };

const CustomerInput = z
  .object({
    email: z.email().max(512).optional(),
    name: z.string().trim().min(1).max(256).optional(),
    phone: z.string().trim().min(1).max(20).optional(),
  })
  .refine((input) => Boolean(input.email ?? input.name ?? input.phone), {
    message: 'give the email, name or phone',
  });

const Customer = z.object({ id: z.string().min(1) });

export const createCustomer = appAction<StripeKeys, typeof CustomerInput>({
  key: 'create_customer',
  label: 'Create a customer',
  description: 'Add a customer to Stripe',
  fields: [
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      required: false,
      placeholder: '{{subject.primaryEmail}}',
    },
    { key: 'name', label: 'Name', type: 'text', required: false },
    { key: 'phone', label: 'Phone', type: 'text', required: false },
  ],
  outputs: [{ key: 'customerId', label: 'Stripe customer id', type: 'text' }],
  input: CustomerInput,
  async run({ keys, input, idempotencyKey }) {
    const form = new URLSearchParams(
      Object.entries(input).flatMap(([key, value]) => (value ? [[key, value]] : [])),
    );

    const customer = parse(
      'Stripe',
      Customer,
      await stripeSend(keys, 'POST', '/customers', form, { 'Idempotency-Key': idempotencyKey }),
      'no customer',
    );

    return { customerId: customer.id };
  },
});

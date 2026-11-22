import { z } from 'zod';
import { appAction } from '../appDefinition';
import { parse } from './http';
import type { StripeClient } from './stripe';

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

export const createCustomer = appAction<StripeClient, z.output<typeof CustomerInput>>({
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
  async run({ client, input, idempotencyKey }) {
    const form = Object.fromEntries(
      Object.entries(input).flatMap(([key, value]) => (value ? [[key, value]] : [])),
    );

    const customer = parse(
      'Stripe',
      Customer,
      await client('/customers', form, { 'Idempotency-Key': idempotencyKey }),
      'no customer',
    );

    return { customerId: customer.id };
  },
});

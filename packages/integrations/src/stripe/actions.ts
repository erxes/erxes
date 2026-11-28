import { z } from 'zod';
import { appAction, GatewayError, parse } from '@erxes/plugin-sdk/integrations';
import {
  CUSTOMER_FIELD,
  formOf,
  Metadata,
  METADATA_FIELD,
  once,
  type StripeField,
  stripeId,
  words,
} from './actionFields';
import type { StripeClient } from './server';

const Details = z.object({
  email: z.email().max(512).optional(),
  name: words(256).optional(),
  phone: words(20).optional(),
  description: words(350).optional(),
  metadata: Metadata.optional(),
});

type Details = z.output<typeof Details>;

const CreateInput = Details.refine((input) => Boolean(input.email ?? input.name ?? input.phone), {
  message: 'give the email, name or phone',
});

const CustomerInput = z.object({ customer: stripeId('cus') });

const UpdateInput = Details.extend(CustomerInput.shape).refine(
  (input) => Object.entries(input).some(([key, value]) => key !== 'customer' && Boolean(value)),
  { message: 'give something to change' },
);

const FindInput = z.object({
  customer: words(512).pipe(
    z.union([z.string().regex(/^cus_\w+$/), z.email()], {
      error: 'a Stripe customer id (cus_…) or an email',
    }),
  ),
});

const Customer = z.object({
  id: z.string().min(1),
  email: z.string().nullish(),
  name: z.string().nullish(),
  phone: z.string().nullish(),
  deleted: z.boolean().optional(),
});

export const Customers = z.object({ data: z.array(Customer) });

const DETAIL_FIELDS: StripeField[] = [
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    required: false,
    placeholder: '{{subject.primaryEmail}}',
  },
  { key: 'name', label: 'Name', type: 'text', required: false },
  { key: 'phone', label: 'Phone', type: 'text', required: false },
  { key: 'description', label: 'Description', type: 'text', required: false },
  METADATA_FIELD,
];

const CUSTOMER_ID = {
  key: 'customerId',
  label: 'Stripe customer id',
  type: 'text',
  recordType: 'customer',
} as const;

const detailsForm = ({ metadata, ...fields }: Details) => formOf(fields, metadata);

const customerPath = (id: string) => `/customers/${encodeURIComponent(id)}`;

const missing = (error: unknown) => error instanceof GatewayError && error.status === 404;

const lookUp = async (client: StripeClient, customer: string) => {
  if (!customer.startsWith('cus_')) {
    const query = new URLSearchParams({ email: customer, limit: '1' });

    return parse('Stripe', Customers, await client(`/customers?${query}`), 'no customers').data[0];
  }

  try {
    const found = parse('Stripe', Customer, await client(customerPath(customer)), 'no customer');

    return found.deleted ? undefined : found;
  } catch (error) {
    if (missing(error)) return undefined;

    throw error;
  }
};

export const createCustomer = appAction<StripeClient, z.output<typeof CreateInput>>({
  key: 'create_customer',
  label: 'Create a customer',
  description: 'Add a customer to Stripe',
  fields: DETAIL_FIELDS,
  outputs: [CUSTOMER_ID],
  input: CreateInput,
  async run({ client, input, idempotencyKey }) {
    const customer = parse(
      'Stripe',
      Customer,
      await client('/customers', detailsForm(input), once(idempotencyKey)),
      'no customer',
    );

    return { customerId: customer.id };
  },
});

export const updateCustomer = appAction<StripeClient, z.output<typeof UpdateInput>>({
  key: 'update_customer',
  label: 'Update a customer',
  description: "Change a Stripe customer's details; blank ones stay as they are",
  fields: [CUSTOMER_FIELD, ...DETAIL_FIELDS],
  outputs: [CUSTOMER_ID],
  input: UpdateInput,
  async run({ client, input: { customer, ...details }, idempotencyKey }) {
    const updated = parse(
      'Stripe',
      Customer,
      await client(customerPath(customer), detailsForm(details), once(idempotencyKey)),
      'no customer',
    );

    return { customerId: updated.id };
  },
});

export const findCustomer = appAction<StripeClient, z.output<typeof FindInput>>({
  key: 'find_customer',
  label: 'Find a customer',
  description: 'Look up a Stripe customer by id or email',
  fields: [
    {
      key: 'customer',
      label: 'Stripe customer id or email',
      type: 'text',
      required: true,
      placeholder: '{{subject.primaryEmail}}',
      description: 'By email: the newest customer with it',
    },
  ],
  outputs: [
    { key: 'found', label: 'Found', type: 'boolean' },
    CUSTOMER_ID,
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
  ],
  input: FindInput,
  async run({ client, input }) {
    const customer = await lookUp(client, input.customer);

    if (!customer) return { found: false };

    return {
      found: true,
      customerId: customer.id,
      email: customer.email ?? '',
      name: customer.name ?? '',
      phone: customer.phone ?? '',
    };
  },
});

export const deleteCustomer = appAction<StripeClient, z.output<typeof CustomerInput>>({
  key: 'delete_customer',
  label: 'Delete a customer',
  description: 'Delete a Stripe customer and cancel their subscriptions',
  fields: [CUSTOMER_FIELD],
  outputs: [{ key: 'deleted', label: 'Deleted', type: 'boolean' }],
  input: CustomerInput,
  async run({ client, input }) {
    const deleted = parse(
      'Stripe',
      Customer,
      await client(customerPath(input.customer), undefined, undefined, 'DELETE'),
      'no deleted customer',
    );

    return { deleted: deleted.deleted ?? false };
  },
});

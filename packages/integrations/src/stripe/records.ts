import { type AppRecords, parse } from '@erxes/plugin-sdk/integrations';
import { Customers } from './actions';
import type { StripeClient } from './server';

const LIMIT = '100';

const labelOf = (customer: { id: string; name?: string | null; email?: string | null }) =>
  [customer.name, customer.email].filter(Boolean).join(' · ') || customer.id;

/** Stripe's search takes a quoted value: what was typed, without quotes or backslashes. */
const quoted = (search: string) => `"${search.replaceAll(/["\\]/g, '')}"`;

/** The newest customers, or those whose name or email holds what was typed. */
export const STRIPE_RECORDS: AppRecords<StripeClient> = {
  customer: {
    async list({ client, search }) {
      const path = search
        ? `/customers/search?${new URLSearchParams({
            query: `name~${quoted(search)} OR email~${quoted(search)}`,
            limit: LIMIT,
          })}`
        : `/customers?${new URLSearchParams({ limit: LIMIT })}`;

      const { data } = parse('Stripe', Customers, await client(path), 'no customers');

      return data.map((customer) => ({ value: customer.id, label: labelOf(customer) }));
    },
  },
};

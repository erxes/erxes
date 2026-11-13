import { organizations } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import type { z } from 'zod';
import { Id, isoDate } from './common';
import { Country, Currency } from './money';

export const Organization = createSelectSchema(organizations, { id: Id, createdAt: isoDate }).pick({
  id: true,
  subdomain: true,
  name: true,
  /** Where the organisation works (ISO 3166, `MN`); null until chosen. Plugins use it for local rules (taxes, receipts). */
  country: true,
  /** What it charges in (ISO 4217, `MNT`): new products and invoices default to it. */
  currency: true,
  createdAt: true,
});

export type Organization = z.infer<typeof Organization>;

/** What an owner may change. */
const OrganizationFields = createUpdateSchema(organizations, {
  country: Country.optional(),
  currency: () => Currency,
  name: (name) => name.trim().min(1).max(100),
});

/** Where an organisation works; the currency defaults to the country's. */
export const OrganizationRegion = OrganizationFields.pick({ country: true, currency: true });

export const organizationsContract = {
  current: oc
    .route({
      method: 'GET',
      path: '/organization',
      summary: 'The organisation of the signed-in member or the plugin token',
    })
    .output(Organization),
  update: oc
    .route({
      method: 'PATCH',
      path: '/organization',
      summary:
        "Rename the organisation or change its country and currency. Products and invoices keep the currency they were made in; a new country without a currency also sets the country's currency",
    })
    .input(
      OrganizationFields.pick({ country: true, currency: true, name: true }).refine(
        (input) => Object.values(input).some((value) => value !== undefined),
        'Nothing to change',
      ),
    )
    .output(Organization),
};

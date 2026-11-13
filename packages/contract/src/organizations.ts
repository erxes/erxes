import { oc } from '@orpc/contract';
import { z } from 'zod';
import { Id } from './common';
import { Country, Currency } from './money';

export const Organization = z.object({
  id: Id,
  subdomain: z.string(),
  name: z.string(),
  /** Where the organisation works (ISO 3166, `MN`); null until chosen. Plugins use it for local rules (taxes, receipts). */
  country: z.string().nullable(),
  /** What it charges in (ISO 4217, `MNT`): new products and invoices default to it. */
  currency: z.string(),
  createdAt: z.string().datetime(),
});

export type Organization = z.infer<typeof Organization>;

/** Where an organisation works; the currency defaults to the country's. */
export const OrganizationRegion = z.object({
  country: Country.optional(),
  currency: Currency.optional(),
});

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
      OrganizationRegion.extend({ name: z.string().trim().min(1).max(100).optional() }).refine(
        (input) => Object.values(input).some((value) => value !== undefined),
        'Nothing to change',
      ),
    )
    .output(Organization),
};

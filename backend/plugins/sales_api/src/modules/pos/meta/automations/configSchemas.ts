import {
  builderOnlyConfigField,
  describeConfigField as described,
} from 'erxes-api-shared/core-modules';
import { z } from 'zod/v4';

// A {{ }} placeholder stands for a number until the run fills it.
const amount = z.union([z.number(), z.string()]);

/** What the POS order action reads or refuses, published as configJsonSchema. */
export const posOrderCreateActionConfigSchema = z
  .object({
    posId: described(
      z.string(),
      '_id of the POS the order is made in.',
    ).optional(),
    posToken: builderOnlyConfigField(
      z.string(),
      'Token of the POS, set in the builder; use posId instead.',
    ).optional(),
    items: described(
      z.string(),
      'Order lines as JSON text: [{"productId", "count", "unitPrice"}].',
    ).optional(),
    productIds: described(
      z.string(),
      'Products ordered once each at count and unitPrice when items is empty, comma-separated, as text.',
    ).optional(),
    productId: z.string().optional(),
    count: amount.optional(),
    unitPrice: amount.optional(),
    type: described(z.string(), 'Order type; take when absent.').optional(),
    status: z.string().optional(),
    customerId: z.string().optional(),
    customerType: z.string().optional(),
    totalAmount: amount.optional(),
    description: z.string().optional(),
  })
  .refine(({ posId, posToken }) => !!(posId || posToken), {
    path: ['posId'],
    message: 'Required',
  });

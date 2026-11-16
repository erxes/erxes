import { TAX_CATEGORIES } from '@erxes/core-db/enums';
import { z } from 'zod';
import { Id } from './common';
import { PluginName } from './plugins';

/**
 * How sales tax treats a line: `standard` (taxed), `zero` (zero-rated),
 * `exempt`, or `outside` (not reported). `code`: the tax office's code for an
 * exempt or zero-rated item. Used where the organisation's own tax rules
 * (Settings › Integrations) don't name the line's product; a line without
 * either is taxed at the standard rate.
 */
export const LineTax = z.object({
  category: z.enum(TAX_CATEGORIES),
  code: z.string().trim().min(1).max(20).optional(),
});

/**
 * What an invoice is for. `plugin`: whose line it is when one invoice pays
 * for several plugins' records (an order and its delivery); that plugin
 * hears the invoice's events too.
 */
export const InvoiceLine = z.object({
  productId: Id.nullable(),
  name: z.string(),
  quantity: z.number(),
  /** In the smallest unit, like `amount`. */
  unitPrice: z.int(),
  /** quantity × unit price, rounded to the smallest unit. */
  amount: z.int(),
  plugin: z.string().nullable(),
  barcode: z.string().optional(),
  tax: LineTax.optional(),
});

export type InvoiceLine = z.infer<typeof InvoiceLine>;

export const InvoiceLineInput = z.object({
  productId: Id.optional(),
  /** Defaults to the product's name. */
  name: z.string().trim().min(1).max(200).optional(),
  /** Up to 3 decimals (1.5 kg). */
  quantity: z
    .number()
    .positive()
    .max(1_000_000)
    .refine((value) => Number.isInteger(value * 1000), 'at most 3 decimals'),
  unitPrice: z.int().min(0).max(1_000_000_000_00),
  plugin: PluginName.optional(),
  /** For a line without a core product; a product's own barcode wins. */
  barcode: z
    .string()
    .trim()
    .regex(/^[0-9A-Za-z-]{1,40}$/, 'letters, digits and dashes')
    .optional(),
  tax: LineTax.optional(),
});

export type InvoiceLineInput = z.infer<typeof InvoiceLineInput>;

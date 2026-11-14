import type { InvoiceLineInput } from '@erxes/core-contract';
import { type Db, type InvoiceLine, products } from '@erxes/core-db';
import { inArray } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { unique } from '~/lib/contacts';

/**
 * An invoice's lines as stored: names filled in from the products, amounts
 * worked out, and their total checked against the invoice amount (400
 * LINES_MISMATCH). An invoice without lines is fine. Products must be the organisation's (400 INVALID_PRODUCT);
 * archived ones are fine, an order may be older than the archiving.
 */
export const resolveInvoiceLines = async (
  tx: Db,
  amount: number,
  lines: InvoiceLineInput[],
): Promise<InvoiceLine[]> => {
  const ids = unique(lines.flatMap((line) => line.productId ?? []));

  const found = ids.length
    ? await tx
        .select({ id: products.id, name: products.name })
        .from(products)
        .where(inArray(products.id, ids))
    : [];

  const names = new Map(found.map((product) => [product.id, product.name]));

  const resolved = lines.map((line) => {
    const productName = line.productId ? names.get(line.productId) : undefined;

    if (line.productId && productName === undefined) {
      throw fail('INVALID_PRODUCT', `Unknown product ${line.productId}`);
    }

    const name = line.name ?? productName;

    if (!name) {
      throw fail('INVALID_INPUT', 'A line needs a name or a product', {
        issues: [{ path: ['lines'], message: 'A line needs a name or a product' }],
      });
    }

    return {
      productId: line.productId ?? null,
      name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      amount: Math.round(line.quantity * line.unitPrice),
      plugin: line.plugin ?? null,
    };
  });

  const total = resolved.reduce((sum, line) => sum + line.amount, 0);

  if (resolved.length > 0 && total !== amount) {
    throw fail('LINES_MISMATCH', `The lines add up to ${total}, the invoice is for ${amount}`);
  }

  return resolved;
};

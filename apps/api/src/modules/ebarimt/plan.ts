import {
  type Db,
  ebarimtReceipts,
  ebarimtSettings,
  paymentInvoices,
  productCategories,
  products,
} from '@erxes/core-db';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { type ProductInfo } from './build';

export type ReceiptRow = typeof ebarimtReceipts.$inferSelect;

export type SettingsRow = typeof ebarimtSettings.$inferSelect;

type InvoiceRow = typeof paymentInvoices.$inferSelect;

/** PosAPI takes tögrög only. */
const RECEIPT_CURRENCY = 'MNT';

/** The invoice's issued receipt: a put that succeeded and wasn't returned or replaced since. */
export const activeReceipt = async (tx: Db, invoiceId: string) => {
  const [row] = await tx
    .select()
    .from(ebarimtReceipts)
    .where(
      and(
        eq(ebarimtReceipts.invoiceId, invoiceId),
        eq(ebarimtReceipts.kind, 'put'),
        eq(ebarimtReceipts.status, 'success'),
        isNull(ebarimtReceipts.inactiveAt),
      ),
    )
    .orderBy(desc(ebarimtReceipts.createdAt))
    .limit(1);

  return row ?? null;
};

export const settingsOf = async (tx: Db) => {
  const [row] = await tx.select().from(ebarimtSettings).limit(1);

  return row ?? null;
};

/** Does the organisation issue receipts for this invoice? */
const issuesFor = (
  settings: SettingsRow | null,
  invoice: Pick<InvoiceRow, 'source' | 'currency'>,
): settings is SettingsRow =>
  settings?.status === 'active' &&
  settings.plugins.includes(invoice.source) &&
  invoice.currency === RECEIPT_CURRENCY;

/** What the invoice still holds: paid less refunded (nothing unless it was paid). */
export const keptAmount = (invoice: InvoiceRow) =>
  invoice.status === 'paid' || invoice.status === 'refunded'
    ? (invoice.paidAmount ?? invoice.amount) - invoice.refundedAmount
    : 0;

/** The products of the lines: code, barcode, unit and the categories they sit in. */
const productInfo = async (tx: Db, ids: string[]) => {
  if (!ids.length) return new Map<string, ProductInfo>();

  const rows = await tx
    .select({
      id: products.id,
      code: products.code,
      barcode: products.barcode,
      unit: products.unit,
      categoryId: products.categoryId,
    })
    .from(products)
    .where(inArray(products.id, ids));

  const categoryIds = [...new Set(rows.flatMap((row) => row.categoryId ?? []))];

  const ancestors = categoryIds.length
    ? await tx.execute<{ id: string; path: string[] }>(sql`
        with recursive up(id, category_id) as (
          select id, id from ${productCategories} where ${inArray(productCategories.id, categoryIds)}
          union all
          select up.id, c.parent_id from up
          join ${productCategories} c on c.id = up.category_id
          where c.parent_id is not null
        )
        select id, array_agg(category_id) as path from up group by id
      `)
    : { rows: [] };

  const paths = new Map(ancestors.rows.map((row) => [row.id, row.path]));

  return new Map(
    rows.map((row) => [
      row.id,
      {
        code: row.code,
        barcode: row.barcode,
        unit: row.unit,
        categoryPath: (row.categoryId && paths.get(row.categoryId)) || [],
      },
    ]),
  );
};

/** Everything a sync reads before calling out, or null when the invoice needs nothing. */
export const readForSync = async (tx: Db, invoiceId: string) => {
  const [invoice] = await tx
    .select()
    .from(paymentInvoices)
    .where(eq(paymentInvoices.id, invoiceId))
    .limit(1);

  const settings = await settingsOf(tx);

  if (!invoice || !issuesFor(settings, invoice)) return null;

  const ids = [...new Set(invoice.lines.flatMap((line) => line.productId ?? []))];

  return {
    invoice,
    settings,
    active: await activeReceipt(tx, invoiceId),
    products: await productInfo(tx, ids),
  };
};

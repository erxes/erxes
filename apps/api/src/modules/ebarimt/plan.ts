import {
  type Db,
  ebarimtReceipts,
  ebarimtSettings,
  paymentInvoices,
  productCategories,
  products,
} from '@erxes/core-db';
import { and, asc, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { type ProductInfo } from './build';
import { ownReceiptPlugins } from './plugins';

export type ReceiptRow = typeof ebarimtReceipts.$inferSelect;

export type SettingsRow = typeof ebarimtSettings.$inferSelect;

type InvoiceRow = typeof paymentInvoices.$inferSelect;

/** PosAPI takes tögrög only. */
export const RECEIPT_CURRENCY = 'MNT';

/** Why a turned-off config sent nothing: the receipt's error, and the 400's message. */
export const configOff = (settings: Pick<SettingsRow, 'name'>) =>
  `The eBarimt config "${settings.name}" is turned off (Settings › Integrations)`;

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

/** The organisation's configs, the default first, then oldest first. */
export const listConfigs = (tx: Db) =>
  tx
    .select()
    .from(ebarimtSettings)
    .orderBy(desc(ebarimtSettings.isDefault), asc(ebarimtSettings.createdAt));

/** The config with this id, else the default; null when there is none. */
export const configOf = async (tx: Db, id?: string | null) => {
  const [row] = await tx
    .select()
    .from(ebarimtSettings)
    .where(id ? eq(ebarimtSettings.id, id) : eq(ebarimtSettings.isDefault, true))
    .limit(1);

  return row ?? null;
};

/** True when any config sends receipts. */
export const anyActive = async (tx: Db) => {
  const [row] = await tx
    .select({ id: ebarimtSettings.id })
    .from(ebarimtSettings)
    .where(eq(ebarimtSettings.status, 'active'))
    .limit(1);

  return Boolean(row);
};

/** What the invoice still holds: paid less refunded (nothing unless it was paid). */
export const keptAmount = (invoice: InvoiceRow) =>
  invoice.status === 'paid' ? (invoice.paidAmount ?? invoice.amount) - invoice.refundedAmount : 0;

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

  if (!invoice) return null;

  const active = await activeReceipt(tx, invoiceId);
  // An issued receipt is replaced or returned through the config that sent it; a new one goes
  // through the invoice's config, else the default.
  const settings = await configOf(tx, active?.settingsId ?? invoice.ebarimtId);

  if (!settings || invoice.currency !== RECEIPT_CURRENCY) return null;

  // The default turned off is eBarimt off: nothing to send. A config the invoice names, or the
  // one that issued its receipt, turned off leaves a receipt unsent: the sync keeps it as failed.
  const off = settings.status !== 'active';

  if (off && !invoice.ebarimtId && !active) return null;

  if ((await ownReceiptPlugins(tx, [invoice.source])).size) return null;

  const ids = [...new Set(invoice.lines.flatMap((line) => line.productId ?? []))];

  return {
    invoice,
    settings,
    off,
    active,
    products: await productInfo(tx, ids),
  };
};

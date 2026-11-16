import type { CursorQuery, EbarimtReceipt, TaxBuyer } from '@erxes/core-contract';
import {
  caller,
  type Db,
  ebarimtReceipts,
  paymentInvoices,
  requestOrgId,
  withOrg,
} from '@erxes/core-db';
import { and, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { recordAudit } from '~/modules/audit/audit.service';
import { settingsOf } from './plan';
import { findCompany } from './posapi';
import { queueReceiptSync } from './sync';

/** A plugin reads and changes only its own invoices' receipts. */
const ownSource = () => {
  const who = caller();

  return who.type === 'plugin' ? who.plugin : null;
};

const selectReceipts = (client: Db) =>
  client
    .select({
      ...getTableColumns(ebarimtReceipts),
      source: paymentInvoices.source,
      referenceType: paymentInvoices.referenceType,
      referenceId: paymentInvoices.referenceId,
      currency: paymentInvoices.currency,
    })
    .from(ebarimtReceipts)
    .innerJoin(paymentInvoices, eq(paymentInvoices.id, ebarimtReceipts.invoiceId));

export const listReceipts = (
  client: Db,
  query: CursorQuery & {
    invoiceId?: string;
    source?: string;
    referenceId?: string;
    status?: EbarimtReceipt['status'];
  },
) => {
  const source = ownSource() ?? query.source;

  return keysetPage(
    client,
    {
      table: ebarimtReceipts,
      id: ebarimtReceipts.id,
      createdAt: ebarimtReceipts.createdAt,
      countCap: 10_000,
    },
    and(
      query.invoiceId ? eq(ebarimtReceipts.invoiceId, query.invoiceId) : undefined,
      query.status ? eq(ebarimtReceipts.status, query.status) : undefined,
      source
        ? sql`exists (select 1 from ${paymentInvoices} where ${paymentInvoices.id} = ${ebarimtReceipts.invoiceId} and ${paymentInvoices.source} = ${source})`
        : undefined,
      query.referenceId
        ? sql`exists (select 1 from ${paymentInvoices} where ${paymentInvoices.id} = ${ebarimtReceipts.invoiceId} and ${paymentInvoices.referenceId} = ${query.referenceId})`
        : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      selectReceipts(client)
        .where(where)
        .orderBy(...orderBy, desc(ebarimtReceipts.id))
        .limit(limit),
  );
};

/** The caller's invoice (a plugin's own), with eBarimt set up. 404, 409 EBARIMT_NOT_SET_UP. */
const invoiceToSync = async (tx: Db, invoiceId: string) => {
  const [invoice] = await tx
    .select()
    .from(paymentInvoices)
    .where(eq(paymentInvoices.id, invoiceId))
    .limit(1);

  const source = ownSource();

  if (!invoice || (source && invoice.source !== source)) throw notFound('Invoice');

  if ((await settingsOf(tx))?.status !== 'active') {
    throw fail('EBARIMT_NOT_SET_UP', 'Turn eBarimt on first (Settings › Integrations)');
  }

  return invoice;
};

/** Queues a sync of the invoice's receipt: a failed one goes again, a missing one is issued. */
export const requestSync = async (client: Db, invoiceId: string) => {
  const invoice = await invoiceToSync(client, invoiceId);

  await queueReceiptSync(client, invoice);

  return { ok: true as const };
};

/**
 * Changes who the invoice's receipt is for, then syncs it (an issued one is
 * replaced). A company number is checked with the tax office first, so a
 * wrong one fails here. Calls out: outside any scope.
 */
export const setBuyer = async (invoiceId: string, taxBuyer: TaxBuyer) => {
  const orgId = requestOrgId();

  await withOrg(orgId, (tx) => invoiceToSync(tx, invoiceId));

  if (taxBuyer.companyNo) await findCompany(taxBuyer.companyNo);

  return withOrg(orgId, async (tx) => {
    const invoice = await invoiceToSync(tx, invoiceId);

    await tx
      .update(paymentInvoices)
      .set({ taxBuyer, updatedAt: sql`now()` })
      .where(eq(paymentInvoices.id, invoice.id));
    await recordAudit(tx, {
      action: 'ebarimt.buyer_changed',
      targetType: 'payment_invoice',
      targetId: invoice.id,
      targetLabel: invoice.description,
      metadata: { ...taxBuyer },
    });
    await queueReceiptSync(tx, invoice);

    return { ok: true as const };
  });
};

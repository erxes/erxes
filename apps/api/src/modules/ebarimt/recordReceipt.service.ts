import type { RecordedReceipt } from '@erxes/core-contract';
import { caller, type Db, ebarimtReceipts, newId, paymentInvoices } from '@erxes/core-db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { configOf, type ReceiptRow } from './plan';
import { ownReceiptPlugins } from './plugins';
import { selectReceipts } from './receipts.service';

const shownReceipt = async (client: Db, id: string) =>
  oneRow(await selectReceipts(client).where(eq(ebarimtReceipts.id, id)).limit(1));

/** The receipt the plugin recorded with this key, or null. */
const byDedupeKey = async (client: Db, plugin: string, dedupeKey: string) => {
  const [row] = await client
    .select({ id: ebarimtReceipts.id })
    .from(ebarimtReceipts)
    .where(and(eq(ebarimtReceipts.source, plugin), eq(ebarimtReceipts.dedupeKey, dedupeKey)))
    .limit(1);

  return row ?? null;
};

/**
 * Checks that what the receipt names is the plugin's: its invoice, core's config and the
 * receipt it returns or replaces, which must be an issued one still in force. Answers that one.
 * 404, 409 RECEIPT_NOT_IN_FORCE.
 */
const checkReferences = async (client: Db, plugin: string, input: RecordedReceipt) => {
  if (input.invoiceId) {
    const [invoice] = await client
      .select({ id: paymentInvoices.id })
      .from(paymentInvoices)
      .where(and(eq(paymentInvoices.id, input.invoiceId), eq(paymentInvoices.source, plugin)))
      .limit(1);

    if (!invoice) throw notFound('Invoice');
  }

  if (input.settingsId && !(await configOf(client, input.settingsId))) {
    throw notFound('eBarimt config');
  }

  if (!input.previousId) return null;

  const [previous] = await client
    .select()
    .from(ebarimtReceipts)
    .where(and(eq(ebarimtReceipts.id, input.previousId), eq(ebarimtReceipts.source, plugin)))
    .limit(1);

  if (!previous) throw notFound('Receipt');

  if (previous.kind !== 'put' || previous.status !== 'success' || previous.inactiveAt) {
    throw notInForce();
  }

  return previous;
};

const notInForce = () =>
  fail('RECEIPT_NOT_IN_FORCE', 'previousId is not an issued receipt still in force');

/** An issued return or replacement takes `previous` out of force, unless another did first. 409. */
const retire = async (client: Db, previous: ReceiptRow) => {
  const [retired] = await client
    .update(ebarimtReceipts)
    .set({ inactiveAt: sql`now()`, updatedAt: sql`now()` })
    .where(and(eq(ebarimtReceipts.id, previous.id), isNull(ebarimtReceipts.inactiveAt)))
    .returning({ id: ebarimtReceipts.id });

  if (!retired) throw notInForce();
};

/**
 * Stores a receipt a plugin that sends its own (`taxReceipts: 'own'`) issued at its PosAPI, in
 * the organisation's one register, with or without one of its invoices. Core never sends it. A
 * retried `dedupeKey` answers the receipt recorded first. 403 TAX_RECEIPTS_NOT_OWN for a plugin
 * core issues receipts for, so no sale gets two.
 */
export const recordReceipt = async (client: Db, input: RecordedReceipt) => {
  const { plugin } = caller('plugin');

  if (!(await ownReceiptPlugins(client, [plugin])).size) {
    throw fail(
      'TAX_RECEIPTS_NOT_OWN',
      `Core issues ${plugin}'s receipts; only a plugin whose manifest says taxReceipts: 'own' records its own`,
    );
  }

  const existing = await byDedupeKey(client, plugin, input.dedupeKey);

  if (existing) return { receipt: await shownReceipt(client, existing.id), created: false };

  const previous = await checkReferences(client, plugin, input);
  const issued = input.status === 'success';

  const [row] = await client
    .insert(ebarimtReceipts)
    .values({
      ...input,
      id: newId(),
      source: plugin,
      // A return that went through is done with, as core's are.
      inactiveAt: issued && input.kind === 'return' ? sql`now()` : null,
    })
    .onConflictDoNothing()
    .returning();

  // Another call with the same key stored it first.
  if (!row) {
    const first = await byDedupeKey(client, plugin, input.dedupeKey);

    if (!first) throw new Error(`recorded receipt ${input.dedupeKey} was neither stored nor found`);

    return { receipt: await shownReceipt(client, first.id), created: false };
  }

  if (issued && previous) await retire(client, previous);

  await recordAudit(client, {
    action: 'ebarimt.receipt_recorded',
    targetType: 'ebarimt_receipt',
    targetId: row.id,
    targetLabel: row.billId ?? row.id,
    metadata: {
      source: plugin,
      kind: row.kind,
      status: row.status,
      reference: `${input.referenceType}:${input.referenceId}`,
      totalAmount: row.totalAmount,
    },
  });

  return { receipt: await shownReceipt(client, row.id), created: true };
};

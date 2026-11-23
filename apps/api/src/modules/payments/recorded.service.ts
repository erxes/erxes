import type { RecordedPayment } from '@erxes/core-contract';
import { caller, type Db, newId, paymentInvoices, sourceOf } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { getOrganization } from '~/modules/organizations/organizations.service';
import { resolveInvoiceLines } from './invoiceLines';
import { invoiceByDedupeKey } from './invoices.service';
import { eventPayload, shownInvoice } from './invoiceState';
import { ebarimtIdOf } from './taxConfig';

/**
 * Records a payment taken outside a gateway (cash, a card terminal, a bank
 * transfer) as an invoice paid in full now. It publishes `core.payment.paid`
 * like a gateway payment, so its subscribers (eBarimt, webhooks,
 * automations, the plugin) treat both alike. Retry-safe with `dedupeKey`.
 */
export const recordPayment = async (client: Db, input: RecordedPayment) => {
  const existing = input.dedupeKey ? await invoiceByDedupeKey(client, input.dedupeKey) : null;

  if (existing) return existing;

  const [row] = await client
    .insert(paymentInvoices)
    .values({
      id: newId(),
      gatewayId: null,
      method: input.method,
      source: sourceOf(caller()),
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      amount: input.amount,
      currency: input.currency ?? (await getOrganization(client)).currency,
      description: input.description,
      status: 'paid',
      paidAmount: input.amount,
      paidAt: sql`now()`,
      expiresAt: sql`now()`,
      dedupeKey: input.dedupeKey ?? null,
      metadata: input.metadata ?? {},
      lines: await resolveInvoiceLines(client, input.amount, input.lines ?? []),
      taxBuyer: input.taxBuyer ?? null,
      taxReceipt: input.taxReceipt ?? true,
      ebarimtId: await ebarimtIdOf(client, input.ebarimtId),
    })
    .onConflictDoNothing()
    .returning();

  // Another call with the same dedupe key stored it first.
  if (!row) {
    const first = input.dedupeKey ? await invoiceByDedupeKey(client, input.dedupeKey) : null;

    if (!first) throw new Error('a recorded payment was neither stored nor found');

    return first;
  }

  await publishCoreEvents(client, {
    type: 'core.payment.paid',
    entityType: 'payment_invoice',
    entityId: row.id,
    payload: { ...eventPayload(row), paidAmount: row.amount, gateway: null },
  });
  await recordAudit(client, {
    action: 'payment.recorded',
    targetType: 'payment_invoice',
    targetId: row.id,
    targetLabel: row.description,
    metadata: {
      amount: row.amount,
      currency: row.currency,
      method: row.method,
      source: row.source,
      reference: `${row.referenceType}:${row.referenceId}`,
    },
  });

  return shownInvoice(client, row.id);
};

import {
  actorOf,
  caller,
  type Db,
  newId,
  paymentGateways,
  paymentInvoices,
  paymentRefunds,
} from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { fail, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { logger } from '~/logger';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { driverOf, type GatewayRow } from './gateways.service';
import { eventPayload, type InvoiceRow, shownInvoice } from './invoiceState';

const log = logger.child({ component: 'payments' });

type RefundRow = typeof paymentRefunds.$inferSelect;

interface RefundInput {
  id: string;
  amount?: number;
  reason: string;
  manual: boolean;
  dedupeKey?: string;
}

/** Plugins only ever see their own invoices. */
const hiddenFromCaller = (invoice: { source: string }) => {
  const who = caller();

  return who.type === 'plugin' && invoice.source !== who.plugin;
};

const ownInvoice = async (client: Db, id: string) => {
  const [row] = await client
    .select({ invoice: paymentInvoices, gateway: paymentGateways })
    .from(paymentInvoices)
    .innerJoin(paymentGateways, eq(paymentGateways.id, paymentInvoices.gatewayId))
    .where(eq(paymentInvoices.id, id))
    .for('update', { of: paymentInvoices })
    .limit(1);

  if (!row || hiddenFromCaller(row.invoice)) throw notFound('Invoice');

  return row;
};

const refundByDedupeKey = async (client: Db, invoiceId: string, key: string) => {
  const [existing] = await client
    .select()
    .from(paymentRefunds)
    .where(and(eq(paymentRefunds.invoiceId, invoiceId), eq(paymentRefunds.dedupeKey, key)))
    .limit(1);

  return existing ?? null;
};

/** How much is refunded, checked against what is left and what the gateway can refund. */
const refundAmount = (invoice: InvoiceRow, gateway: GatewayRow, input: RefundInput) => {
  const left =
    invoice.status === 'paid' ? (invoice.paidAmount ?? invoice.amount) - invoice.refundedAmount : 0;

  if (left <= 0)
    throw fail(
      'NOT_REFUNDABLE',
      `The invoice is ${invoice.status === 'refunded' ? 'already refunded' : invoice.status}`,
    );

  const amount = input.amount ?? left;

  if (amount > left) throw fail('NOT_REFUNDABLE', `Only ${left} can still be refunded`);

  if (input.manual) return { amount, full: amount === left, paymentId: null };

  const { refunds } = driverOf(gateway);

  if (refunds === 'none')
    throw fail(
      'PARTIAL_NOT_SUPPORTED',
      'This gateway does not refund: refund outside erxes and record it as manual',
    );

  if (refunds === 'full' && (amount !== left || invoice.refundedAmount > 0)) {
    throw fail(
      'PARTIAL_NOT_SUPPORTED',
      `${gateway.name} refunds whole payments only: refund the rest outside erxes and record it as manual`,
    );
  }

  if (!invoice.gatewayPaymentId)
    throw fail('NOT_REFUNDABLE', 'The gateway gave no payment id to refund');

  return { amount, full: amount === left, paymentId: invoice.gatewayPaymentId };
};

/** The gateway's refund; a refusal is the outcome, kept on the refund row. */
const gatewayRefund = async (
  invoice: InvoiceRow,
  gateway: GatewayRow,
  input: { paymentId: string; amount: number; note: string },
) => {
  try {
    const result = await driverOf(gateway).refund(input, invoice.payment);

    return { status: 'succeeded' as const, gatewayRefundId: result.refundId, error: null };
  } catch (error) {
    log.warn({ invoice: invoice.id, err: error }, 'gateway refused a refund');

    return {
      status: 'failed' as const,
      gatewayRefundId: null,
      error: (error instanceof Error ? error.message : String(error)).slice(0, 500),
    };
  }
};

/** Books a succeeded refund on the invoice, then its event and audit entry. */
const applyRefund = async (
  client: Db,
  invoice: InvoiceRow,
  refund: RefundRow,
  input: { full: boolean; reason: string },
) => {
  const updated = oneRow(
    await client
      .update(paymentInvoices)
      .set({
        refundedAmount: sql`${paymentInvoices.refundedAmount} + ${refund.amount}`,
        status: input.full ? 'refunded' : 'paid',
        updatedAt: sql`now()`,
      })
      .where(eq(paymentInvoices.id, invoice.id))
      .returning(),
  );

  await publishCoreEvents(client, {
    type: 'core.payment.refunded',
    entityType: 'payment_invoice',
    entityId: invoice.id,
    payload: {
      ...eventPayload(updated),
      refundId: refund.id,
      refundAmount: refund.amount,
      refundedAmount: updated.refundedAmount,
      full: input.full,
      method: refund.method,
    },
  });
  await recordAudit(client, {
    action: 'payment.refunded',
    targetType: 'payment_invoice',
    targetId: invoice.id,
    targetLabel: invoice.description,
    metadata: {
      amount: refund.amount,
      currency: invoice.currency,
      method: refund.method,
      reason: input.reason,
      source: invoice.source,
      reference: `${invoice.referenceType}:${invoice.referenceId}`,
    },
  });

  return updated;
};

/**
 * Gives money back for a paid invoice (row locked: two refunds can't both
 * take what is left). Through the gateway when it can — QPay refunds whole
 * payments only — or `manual` to record money paid back outside erxes. A
 * gateway's refusal is kept as a failed refund and changes nothing else.
 */
export const refundInvoice = async (client: Db, input: RefundInput) => {
  const { invoice, gateway } = await ownInvoice(client, input.id);

  const existing = input.dedupeKey
    ? await refundByDedupeKey(client, invoice.id, input.dedupeKey)
    : null;

  if (existing) return { refund: existing, invoice: await shownInvoice(client, invoice.id) };

  const { amount, full, paymentId } = refundAmount(invoice, gateway, input);

  const outcome = paymentId
    ? await gatewayRefund(invoice, gateway, { paymentId, amount, note: input.reason })
    : { status: 'succeeded' as const, gatewayRefundId: null, error: null };

  const requester = actorOf(caller());

  const refund = oneRow(
    await client
      .insert(paymentRefunds)
      .values({
        id: newId(),
        invoiceId: invoice.id,
        amount,
        reason: input.reason,
        method: input.manual ? 'manual' : 'gateway',
        ...outcome,
        requestedByType: requester.actorType,
        requestedBy: requester.actorId,
        dedupeKey: input.dedupeKey ?? null,
      })
      .returning(),
  );

  if (outcome.status !== 'failed')
    await applyRefund(client, invoice, refund, { full, reason: input.reason });

  return { refund, invoice: await shownInvoice(client, invoice.id) };
};

export const listRefunds = async (client: Db, id: string) => {
  const [invoice] = await client
    .select({ source: paymentInvoices.source })
    .from(paymentInvoices)
    .where(eq(paymentInvoices.id, id))
    .limit(1);

  if (!invoice || hiddenFromCaller(invoice)) throw notFound('Invoice');

  const rows = await wholeList((limit) =>
    client
      .select()
      .from(paymentRefunds)
      .where(eq(paymentRefunds.invoiceId, id))
      .orderBy(paymentRefunds.createdAt)
      .limit(limit),
  );

  return { data: rows };
};

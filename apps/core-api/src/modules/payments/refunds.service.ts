import type { Refund } from '@erxes/core-contract';
import { type Db, newId, paymentGateways, paymentInvoices, paymentRefunds } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import type { Caller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { logger } from '~/logger';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { driverOf, type GatewayRow } from './gateways.service';
import { eventPayload, type InvoiceRow, toInvoiceDto } from './invoiceState';

const log = logger.child({ component: 'payments' });

type RefundRow = typeof paymentRefunds.$inferSelect;

interface RefundInput {
  id: string;
  amount?: number;
  reason: string;
  manual: boolean;
  dedupeKey?: string;
}

const toRefundDto = (row: RefundRow): Refund => ({
  id: row.id,
  invoiceId: row.invoiceId,
  amount: row.amount,
  reason: row.reason,
  method: row.method,
  status: row.status,
  error: row.error,
  requestedBy: { type: row.requestedByType, id: row.requestedBy },
  createdAt: row.createdAt.toISOString(),
});

const ownInvoice = async (client: Db, caller: Caller, id: string) => {
  const [row] = await client
    .select({ invoice: paymentInvoices, gateway: paymentGateways })
    .from(paymentInvoices)
    .innerJoin(paymentGateways, eq(paymentGateways.id, paymentInvoices.gatewayId))
    .where(and(eq(paymentInvoices.orgId, caller.orgId), eq(paymentInvoices.id, id)))
    .for('update', { of: paymentInvoices })
    .limit(1);

  // Plugins only ever see their own invoices.
  if (!row || (caller.actorType === 'plugin' && row.invoice.source !== caller.source))
    throw notFound('Invoice');

  return row;
};

const refundByDedupeKey = async (client: Db, caller: Caller, invoiceId: string, key: string) => {
  const [existing] = await client
    .select()
    .from(paymentRefunds)
    .where(
      and(
        eq(paymentRefunds.orgId, caller.orgId),
        eq(paymentRefunds.invoiceId, invoiceId),
        eq(paymentRefunds.dedupeKey, key),
      ),
    )
    .limit(1);

  return existing ?? null;
};

/** How much is refunded, checked against what is left and what the gateway can refund. */
const refundAmount = (invoice: InvoiceRow, gateway: GatewayRow, input: RefundInput) => {
  const left =
    invoice.status === 'paid' ? (invoice.paidAmount ?? invoice.amount) - invoice.refundedAmount : 0;

  if (left <= 0)
    throw new HttpError(
      409,
      'NOT_REFUNDABLE',
      `The invoice is ${invoice.status === 'refunded' ? 'already refunded' : invoice.status}`,
    );

  const amount = input.amount ?? left;

  if (amount > left)
    throw new HttpError(409, 'NOT_REFUNDABLE', `Only ${left} can still be refunded`);

  if (input.manual) return { amount, full: amount === left, paymentId: null };

  const { refunds } = driverOf(gateway);

  if (refunds === 'none')
    throw new HttpError(
      409,
      'PARTIAL_NOT_SUPPORTED',
      'This gateway does not refund: refund outside erxes and record it as manual',
    );

  if (refunds === 'full' && (amount !== left || invoice.refundedAmount > 0)) {
    throw new HttpError(
      409,
      'PARTIAL_NOT_SUPPORTED',
      `${gateway.name} refunds whole payments only: refund the rest outside erxes and record it as manual`,
    );
  }

  if (!invoice.gatewayPaymentId)
    throw new HttpError(409, 'NOT_REFUNDABLE', 'The gateway gave no payment id to refund');

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
  caller: Caller,
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

  await publishCoreEvents(client, caller, {
    type: 'core.payment.refunded',
    entity: { type: 'payment_invoice', id: invoice.id },
    payload: {
      ...eventPayload(updated),
      refundId: refund.id,
      refundAmount: refund.amount,
      refundedAmount: updated.refundedAmount,
      full: input.full,
      method: refund.method,
    },
  });
  await recordAudit(client, caller, {
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
export const refundInvoice = async (client: Db, caller: Caller, input: RefundInput) => {
  const { invoice, gateway } = await ownInvoice(client, caller, input.id);

  const existing = input.dedupeKey
    ? await refundByDedupeKey(client, caller, invoice.id, input.dedupeKey)
    : null;

  if (existing)
    return { refund: toRefundDto(existing), invoice: toInvoiceDto(invoice, gateway.kind) };

  const { amount, full, paymentId } = refundAmount(invoice, gateway, input);

  const outcome = paymentId
    ? await gatewayRefund(invoice, gateway, { paymentId, amount, note: input.reason })
    : { status: 'succeeded' as const, gatewayRefundId: null, error: null };

  const refund = oneRow(
    await client
      .insert(paymentRefunds)
      .values({
        id: newId(),
        orgId: caller.orgId,
        invoiceId: invoice.id,
        amount,
        reason: input.reason,
        method: input.manual ? 'manual' : 'gateway',
        ...outcome,
        requestedByType: caller.actorType,
        requestedBy: caller.actorId,
        dedupeKey: input.dedupeKey ?? null,
      })
      .returning(),
  );

  const after =
    outcome.status === 'failed'
      ? invoice
      : await applyRefund(client, caller, invoice, refund, { full, reason: input.reason });

  return { refund: toRefundDto(refund), invoice: toInvoiceDto(after, gateway.kind) };
};

export const listRefunds = async (client: Db, caller: Caller, id: string) => {
  const [invoice] = await client
    .select({ source: paymentInvoices.source })
    .from(paymentInvoices)
    .where(and(eq(paymentInvoices.orgId, caller.orgId), eq(paymentInvoices.id, id)))
    .limit(1);

  if (!invoice || (caller.actorType === 'plugin' && invoice.source !== caller.source))
    throw notFound('Invoice');

  const rows = await client
    .select()
    .from(paymentRefunds)
    .where(and(eq(paymentRefunds.orgId, caller.orgId), eq(paymentRefunds.invoiceId, id)))
    .orderBy(paymentRefunds.createdAt);

  return { data: rows.map(toRefundDto) };
};

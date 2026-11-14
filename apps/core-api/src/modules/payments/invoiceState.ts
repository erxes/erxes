import { Invoice } from '@erxes/core-contract';
import { type Db, paymentGateways, paymentInvoices, withOrg } from '@erxes/core-db';
import { GATEWAY_REFUNDS } from '@erxes/payment-gateways';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { systemCaller } from '~/http/auth';
import { notFound } from '~/http/errors';
import { hmacSha256 } from '~/lib/crypto';
import { oneRow } from '~/lib/rows';
import { coreKey } from '~/lib/secrets';
import { logger } from '~/logger';
import { publishCoreEvents } from '~/modules/events/events.service';
import { defineJob } from '~/modules/jobs/jobs';
import { driverOf, type GatewayRow } from './gateways.service';

const log = logger.child({ component: 'payments' });

export type InvoiceRow = typeof paymentInvoices.$inferSelect;

/** The payer's part of the stored `payment` (the rest is the gateway's own state). */
const PayerPart = Invoice.shape.payment.partial();

export const toInvoiceDto = (row: InvoiceRow, kind: GatewayRow['kind']) => {
  const payment = PayerPart.safeParse(row.payment).data ?? {};

  return {
    ...row,
    gatewayKind: kind,
    reference: { type: row.referenceType, id: row.referenceId },
    refundable: {
      amount: row.status === 'paid' ? (row.paidAmount ?? row.amount) - row.refundedAmount : 0,
      gateway: GATEWAY_REFUNDS[kind],
    },
    payment: {
      qrText: payment.qrText ?? null,
      qrImage: payment.qrImage ?? null,
      shortUrl: payment.shortUrl ?? null,
      links: payment.links ?? [],
    },
  };
};

/** Signs the callback address given to the gateway, so callbacks for other ids are refused. */
export const callbackSignature = (invoiceId: string) =>
  hmacSha256(coreKey('erxes-payment-callback-v1'), invoiceId, 'base64url');

/** What `core.payment.*` events carry about the invoice. */
export const eventPayload = (invoice: InvoiceRow) => ({
  invoiceId: invoice.id,
  source: invoice.source,
  reference: { type: invoice.referenceType, id: invoice.referenceId },
  amount: invoice.amount,
  currency: invoice.currency,
  metadata: invoice.metadata,
  lines: invoice.lines,
});

/** Paid: once (a conditional update), then `core.payment.paid` for whoever waits on it. */
const markPaid = async (
  tx: Db,
  invoice: InvoiceRow,
  kind: string,
  check: { paidAmount: number; paymentId: string | null },
) => {
  const [paid] = await tx
    .update(paymentInvoices)
    .set({
      status: 'paid',
      paidAt: sql`now()`,
      paidAmount: check.paidAmount,
      gatewayPaymentId: check.paymentId,
      updatedAt: sql`now()`,
    })
    .where(and(eq(paymentInvoices.id, invoice.id), eq(paymentInvoices.status, 'pending')))
    .returning();

  if (!paid) return current(tx, invoice.id);

  await publishCoreEvents(tx, systemCaller(invoice.orgId), {
    type: 'core.payment.paid',
    entity: { type: 'payment_invoice', id: invoice.id },
    payload: { ...eventPayload(paid), paidAmount: check.paidAmount, gateway: kind },
  });

  return paid;
};

/** Expired: once (a conditional update, like `markPaid`), then `core.payment.expired`. */
const markExpired = async (tx: Db, invoice: InvoiceRow) => {
  const [expired] = await tx
    .update(paymentInvoices)
    .set({ status: 'expired', updatedAt: sql`now()` })
    .where(and(eq(paymentInvoices.id, invoice.id), eq(paymentInvoices.status, 'pending')))
    .returning();

  if (!expired) return current(tx, invoice.id);

  await publishCoreEvents(tx, systemCaller(invoice.orgId), {
    type: 'core.payment.expired',
    entity: { type: 'payment_invoice', id: invoice.id },
    payload: eventPayload(expired),
  });

  return expired;
};

/** The invoice as stored now (after a conditional update found it already settled). */
const current = async (tx: Db, id: string) =>
  oneRow(await tx.select().from(paymentInvoices).where(eq(paymentInvoices.id, id)).limit(1));

/** The organisation's invoice with its gateway. */
export const invoiceWithGateway = async (tx: Db, id: string) => {
  const [row] = await tx
    .select({ invoice: paymentInvoices, gateway: paymentGateways })
    .from(paymentInvoices)
    .innerJoin(paymentGateways, eq(paymentGateways.id, paymentInvoices.gatewayId))
    .where(eq(paymentInvoices.id, id))
    .limit(1);

  if (!row) throw notFound('Invoice');

  return row;
};

/**
 * Asks the gateway about a pending invoice and records the answer. The call
 * sits between two short scopes, so no transaction waits on the gateway, and
 * marking paid or expired is conditional on the invoice still being pending:
 * checks running at once settle it once. Call it outside any scope.
 */
export const refresh = async (orgId: string, id: string) => {
  const { invoice, gateway } = await withOrg(orgId, (tx) => invoiceWithGateway(tx, id));

  if (invoice.status !== 'pending' || !invoice.gatewayInvoiceId) return { invoice, gateway };

  const check = await driverOf(gateway).check(
    invoice.gatewayInvoiceId,
    invoice.amount,
    invoice.payment,
  );

  return withOrg(orgId, async (tx) => {
    if (check.paid) return { invoice: await markPaid(tx, invoice, gateway.kind, check), gateway };

    if (invoice.expiresAt.getTime() < Date.now())
      return { invoice: await markExpired(tx, invoice), gateway };

    return { invoice, gateway };
  });
};

/** Background check of pending invoices (callbacks can be lost). Calls out: not atomic. */
export const paymentCheckJob = defineJob({
  queue: 'payment.check',
  retry: { attempts: 3 },
  payload: z.object({ invoiceId: z.string(), round: z.number() }),
  async handle(job) {
    const { invoiceId, round } = job.payload;

    const { invoice } = await refresh(job.orgId, invoiceId).catch((error: unknown) => {
      log.warn({ invoice: invoiceId, err: error }, 'could not check a pending invoice');

      return { invoice: null };
    });

    if (invoice?.status === 'pending')
      await withOrg(job.orgId, (tx) => queueCheck(tx, invoice, round + 1));
  },
});

/** Checks pending invoices with the gateway every 30 s at first, then every 2 minutes, until they expire. */
export const queueCheck = (client: Db, invoice: InvoiceRow, round: number) =>
  paymentCheckJob.enqueue(client, {
    orgId: invoice.orgId,
    payload: { invoiceId: invoice.id, round },
    runAt: new Date(Date.now() + (round < 20 ? 30_000 : 120_000)),
    dedupeKey: `${invoice.id}:${round}`,
  });

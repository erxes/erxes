import { Invoice } from '@erxes/core-contract';
import { type Db, paymentGateways, paymentInvoices } from '@erxes/core-db';
import { GATEWAY_REFUNDS } from '@erxes/payment-gateways';
import { and, eq, sql } from 'drizzle-orm';
import { createHmac, hkdfSync } from 'node:crypto';
import { z } from 'zod';
import { config } from '~/config';
import { systemCaller } from '~/http/auth';
import { notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { logger } from '~/logger';
import { publishCoreEvents } from '~/modules/events/events.service';
import { defineJob } from '~/modules/jobs/jobs';
import { driverOf, type GatewayRow } from './gateways.service';

const log = logger.child({ component: 'payments' });

export type InvoiceRow = typeof paymentInvoices.$inferSelect;

/** The payer's part of the stored `payment` (the rest is the gateway's own state). */
const PayerPart = Invoice.shape.payment.partial();

export const toInvoiceDto = (row: InvoiceRow, kind: GatewayRow['kind']): Invoice => {
  const payment = PayerPart.safeParse(row.payment).data ?? {};

  return {
    id: row.id,
    gatewayId: row.gatewayId,
    gatewayKind: kind,
    source: row.source,
    reference: { type: row.referenceType, id: row.referenceId },
    amount: row.amount,
    currency: row.currency,
    description: row.description,
    status: row.status,
    metadata: row.metadata,
    paidAmount: row.paidAmount,
    refundedAmount: row.refundedAmount,
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
    expiresAt: row.expiresAt.toISOString(),
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
};

const callbackKey = () =>
  Buffer.from(
    hkdfSync(
      'sha256',
      config.auth.encryptionKey ?? config.auth.jwtSecret,
      Buffer.alloc(0),
      'erxes-payment-callback-v1',
      32,
    ),
  );

/** Signs the callback address given to the gateway, so callbacks for other ids are refused. */
export const callbackSignature = (invoiceId: string) =>
  createHmac('sha256', callbackKey()).update(invoiceId).digest('base64url');

/** What `core.payment.*` events carry about the invoice. */
export const eventPayload = (invoice: InvoiceRow) => ({
  invoiceId: invoice.id,
  source: invoice.source,
  reference: { type: invoice.referenceType, id: invoice.referenceId },
  amount: invoice.amount,
  currency: invoice.currency,
  metadata: invoice.metadata,
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

  if (!paid) return invoice;

  await publishCoreEvents(tx, systemCaller(invoice.orgId), {
    type: 'core.payment.paid',
    entity: { type: 'payment_invoice', id: invoice.id },
    payload: { ...eventPayload(paid), paidAmount: check.paidAmount, gateway: kind },
  });

  return paid;
};

const markExpired = async (tx: Db, invoice: InvoiceRow) => {
  const expired = oneRow(
    await tx
      .update(paymentInvoices)
      .set({ status: 'expired', updatedAt: sql`now()` })
      .where(eq(paymentInvoices.id, invoice.id))
      .returning(),
  );

  await publishCoreEvents(tx, systemCaller(invoice.orgId), {
    type: 'core.payment.expired',
    entity: { type: 'payment_invoice', id: invoice.id },
    payload: eventPayload(expired),
  });

  return expired;
};

/** Asks the gateway about a pending invoice (row locked: one check at a time). */
export const refresh = async (tx: Db, orgId: string, id: string) => {
  const [row] = await tx
    .select({ invoice: paymentInvoices, gateway: paymentGateways })
    .from(paymentInvoices)
    .innerJoin(paymentGateways, eq(paymentGateways.id, paymentInvoices.gatewayId))
    .where(and(eq(paymentInvoices.orgId, orgId), eq(paymentInvoices.id, id)))
    .for('update', { of: paymentInvoices })
    .limit(1);

  if (!row) throw notFound('Invoice');

  const { invoice, gateway } = row;

  if (invoice.status !== 'pending' || !invoice.gatewayInvoiceId)
    return { invoice, kind: gateway.kind };

  const check = await driverOf(gateway).check(
    invoice.gatewayInvoiceId,
    invoice.amount,
    invoice.payment,
  );

  if (check.paid)
    return { invoice: await markPaid(tx, invoice, gateway.kind, check), kind: gateway.kind };

  if (invoice.expiresAt.getTime() < Date.now())
    return { invoice: await markExpired(tx, invoice), kind: gateway.kind };

  return { invoice, kind: gateway.kind };
};

/** Background check of pending invoices (callbacks can be lost). */
export const paymentCheckJob = defineJob({
  queue: 'payment.check',
  atomic: true,
  payload: z.object({ invoiceId: z.string(), round: z.number() }),
  async handle(job, tx) {
    const { invoiceId, round } = job.payload;

    const { invoice } = await refresh(tx, job.orgId, invoiceId).catch((error: unknown) => {
      log.warn({ invoice: invoiceId, err: error }, 'could not check a pending invoice');

      return { invoice: null };
    });

    if (invoice?.status === 'pending') await queueCheck(tx, invoice, round + 1);
  },
});

/** Checks pending invoices with the gateway every 30 s at first, then every 2 minutes, until they expire. */
export const queueCheck = (client: Db, invoice: InvoiceRow, round: number) =>
  paymentCheckJob.enqueue(client, {
    orgId: invoice.orgId,
    payload: { invoiceId: invoice.id, round },
    runAt: new Date(Date.now() + (round < 20 ? 30_000 : 120_000)),
    dedupeKey: `${invoice.id}:${round}`,
    maxAttempts: 3,
  });

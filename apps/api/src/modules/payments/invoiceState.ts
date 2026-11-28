import type { Invoice, WithCorePayload } from '@erxes/core-contract';
import {
  type Db,
  integrationConnections,
  paymentInvoices,
  runAs,
  secrets,
  system,
  withOrg,
} from '@erxes/core-db';
import { and, eq, getTableColumns, inArray, ne, notExists, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { notFound } from '~/http/errors';
import { hmacSha256 } from '~/lib/crypto';
import { oneRow } from '~/lib/rows';
import { coreKey } from '~/lib/coreKey';
import { logger } from '~/logger';
import { publishCoreEvents } from '~/modules/events/events.service';
import { defineJob } from '~/modules/jobs/jobs';
import { INTEGRATIONS } from '~/modules/integrations/registry';
import { withSecret } from '~/modules/secrets/vault';
import { gatewayAt } from './gateways.service';

const log = logger.child({ component: 'payments' });

export type InvoiceRow = typeof paymentInvoices.$inferSelect;

const payment = paymentInvoices.payment;

/** How each gateway kind refunds, as SQL over the joined gateway. */
const refundKind = sql<
  Invoice['refundable']['gateway']
>`case ${integrationConnections.key} ${sql.join(
  INTEGRATIONS.flatMap(({ key, payments }) =>
    payments ? [sql`when ${key} then ${payments.refunds}`] : [],
  ),
  sql` `,
)} else 'none' end`;

/**
 * Invoices as the API answers them: the payer's part of `payment` (the rest is
 * the gateway's own state), the gateway's kind and what can still be refunded.
 */
export const selectInvoices = (client: Db) =>
  client
    .select({
      ...getTableColumns(paymentInvoices),
      payment: {
        qrText: sql<string | null>`${payment} ->> 'qrText'`,
        qrImage: sql<string | null>`${payment} ->> 'qrImage'`,
        shortUrl: sql<string | null>`${payment} ->> 'shortUrl'`,
        links: sql<Invoice['payment']['links']>`coalesce(${payment} -> 'links', '[]'::jsonb)`,
        inApp: sql<Invoice['payment']['inApp']>`${payment} -> 'inApp'`,
        bankTransfer: sql<Invoice['payment']['bankTransfer']>`${payment} -> 'bankTransfer'`,
      },
      gatewayKind: integrationConnections.key,
      refundable: {
        amount: sql<number>`case when ${paymentInvoices.status} = 'paid'
          then coalesce(${paymentInvoices.paidAmount}, ${paymentInvoices.amount}) - ${paymentInvoices.refundedAmount}
          else 0 end`.mapWith(Number),
        gateway: refundKind,
      },
    })
    .from(paymentInvoices)
    .leftJoin(integrationConnections, eq(integrationConnections.id, paymentInvoices.gatewayId));

export const shownInvoice = async (client: Db, id: string) =>
  oneRow(await selectInvoices(client).where(eq(paymentInvoices.id, id)).limit(1));

/** Signs the callback address given to the gateway, so callbacks for other ids are refused. */
export const callbackSignature = (invoiceId: string) =>
  hmacSha256(coreKey('erxes-payment-callback-v1'), invoiceId, 'base64url');

/** What `core.payment.*` events carry about the invoice. */
export const eventPayload = (
  invoice: InvoiceRow,
): WithCorePayload<'core.payment.created'>['payload'] => ({
  invoiceId: invoice.id,
  source: invoice.source,
  referenceType: invoice.referenceType,
  referenceId: invoice.referenceId,
  amount: invoice.amount,
  currency: invoice.currency,
  method: invoice.method,
  metadata: invoice.metadata,
  lines: invoice.lines,
});

/**
 * Core settles an invoice on the gateway's word, even when a member's or
 * plugin's read (`getInvoice`) is what asked the gateway.
 */
const settledByGateway = <T>(fn: () => T) => runAs(system('payment check'), fn);

const other = alias(paymentInvoices, 'other');
const otherGateway = alias(integrationConnections, 'other_gateway');

/** Invoices, other than this one, a gateway of this kind settled with one of these payments. */
const settledWith = (tx: Db, kind: string, paymentIds: string[], exceptId: string) =>
  tx
    .select({ paymentId: other.gatewayPaymentId })
    .from(other)
    .innerJoin(otherGateway, eq(otherGateway.id, other.gatewayId))
    .where(
      and(
        eq(otherGateway.key, kind),
        inArray(other.gatewayPaymentId, paymentIds),
        ne(other.id, exceptId),
      ),
    );

/**
 * Settles the invoice with `paymentId` unless a gateway of the same kind
 * already settled another invoice with it. The lock, held to the end of the
 * transaction, makes checks of two invoices offered the same payment take
 * turns, so the second sees the first's.
 */
const settleWith = async (
  tx: Db,
  invoice: InvoiceRow,
  kind: string,
  paidAmount: number,
  paymentId: string | null,
  brought: Record<string, unknown> | null,
) => {
  if (paymentId)
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`payment:${kind}:${paymentId}`}, 0))`,
    );

  const [paid] = await tx
    .update(paymentInvoices)
    .set({
      status: 'paid',
      paidAt: sql`now()`,
      paidAmount,
      gatewayPaymentId: paymentId,
      payment: brought ? sql`${payment} || ${JSON.stringify(brought)}::jsonb` : undefined,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(paymentInvoices.id, invoice.id),
        eq(paymentInvoices.status, 'pending'),
        paymentId ? notExists(settledWith(tx, kind, [paymentId], invoice.id)) : undefined,
      ),
    )
    .returning();

  return paid;
};

/**
 * Paid: once (a conditional update), then `core.payment.paid` for whoever
 * waits on it. A gateway payment settles one invoice only: one a gateway of
 * the same kind already settled another invoice with (a payer token replayed
 * to another order, a transfer two invoices match) leaves this one pending,
 * or settles it with the next of `paymentIds`. `brought` is what the
 * callback brought (`payments.callback`), kept now that the gateway
 * confirmed it.
 */
const markPaid = async (
  tx: Db,
  invoice: InvoiceRow,
  kind: string,
  check: { paidAmount: number; paymentId: string | null; paymentIds?: string[] },
  brought: Record<string, unknown> | null,
) => {
  const offered = check.paymentIds ?? [check.paymentId];

  // One after another, in the same order for every invoice, so two checks never
  // wait on each other's locks.
  const settleFirst = async (index: number): Promise<InvoiceRow | undefined> => {
    if (index >= offered.length) return undefined;

    const settled = await settleWith(
      tx,
      invoice,
      kind,
      check.paidAmount,
      offered[index] ?? null,
      brought,
    );

    return settled ?? settleFirst(index + 1);
  };

  const paid = await settleFirst(0);

  if (!paid) {
    const now = await current(tx, invoice.id);

    if (now.status === 'pending')
      log.warn(
        { invoice: invoice.id, offered },
        'only gateway payments that settled other invoices were offered for this one',
      );

    return now;
  }

  await settledByGateway(() =>
    publishCoreEvents(tx, {
      type: 'core.payment.paid',
      entityType: 'payment_invoice',
      entityId: invoice.id,
      payload: { ...eventPayload(paid), paidAmount: check.paidAmount, gateway: kind },
    }),
  );

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

  await settledByGateway(() =>
    publishCoreEvents(tx, {
      type: 'core.payment.expired',
      entityType: 'payment_invoice',
      entityId: invoice.id,
      payload: eventPayload(expired),
    }),
  );

  return expired;
};

/** The invoice as stored now (after a conditional update found it already settled). */
const current = async (tx: Db, id: string) =>
  oneRow(await tx.select().from(paymentInvoices).where(eq(paymentInvoices.id, id)).limit(1));

const invoicesWithGateway = (client: Db) =>
  client
    .select({ invoice: paymentInvoices, gateway: integrationConnections, secret: secrets })
    .from(paymentInvoices)
    .leftJoin(integrationConnections, eq(integrationConnections.id, paymentInvoices.gatewayId))
    .leftJoin(secrets, eq(secrets.id, integrationConnections.secretId));

/** The organisation's invoice with its gateway (null for a payment recorded outside one). */
export const invoiceWithGateway = async (tx: Db, id: string, lock = false) => {
  const found = invoicesWithGateway(tx).where(eq(paymentInvoices.id, id)).limit(1);
  const [row] = await (lock ? found.for('update', { of: paymentInvoices }) : found);

  if (!row) throw notFound('Invoice');

  return { invoice: row.invoice, gateway: withSecret(row.gateway, row.secret) };
};

/**
 * Asks the gateway about a pending invoice and records the answer. The call
 * sits between two short scopes, so no transaction waits on the gateway, and
 * marking paid or expired is conditional on the invoice still being pending:
 * checks running at once settle it once. Call it outside any scope.
 *
 * `callbackBody` is what the gateway's callback posted: what the gateway needs
 * from it (`payments.callback`) is kept for later checks without
 * replacing what an earlier callback brought, and replaces it once the
 * gateway confirms the payment.
 */
export const refresh = async (orgId: string, id: string, callbackBody?: unknown) => {
  const { invoice, gateway } = await withOrg(orgId, (tx) => invoiceWithGateway(tx, id));

  if (invoice.status !== 'pending' || !invoice.gatewayInvoiceId || !gateway) {
    return { invoice, gateway };
  }

  const { payments, client } = await gatewayAt(gateway);

  const brought =
    callbackBody === undefined
      ? null
      : (payments.callback?.(callbackBody, { invoiceId: invoice.id, amount: invoice.amount }) ??
        null);

  if (brought)
    await withOrg(orgId, (tx) =>
      tx
        .update(paymentInvoices)
        .set({ payment: sql`${JSON.stringify(brought)}::jsonb || ${payment}` })
        .where(and(eq(paymentInvoices.id, invoice.id), eq(paymentInvoices.status, 'pending'))),
    );

  const check = await payments.check(client, {
    gatewayInvoiceId: invoice.gatewayInvoiceId,
    amount: invoice.amount,
    state: { ...invoice.payment, ...brought },
  });

  return withOrg(orgId, async (tx) => {
    if (check.paid) {
      const settled = await markPaid(tx, invoice, gateway.key, check, brought);

      if (settled.status !== 'pending' || settled.expiresAt.getTime() >= Date.now())
        return { invoice: settled, gateway };
    }

    if (invoice.expiresAt.getTime() < Date.now())
      return { invoice: await markExpired(tx, invoice), gateway };

    return { invoice, gateway };
  });
};

/**
 * How long after an invoice expires a gateway that can't be reached is still
 * asked: a payment made before it expired may only show once it answers again.
 */
const UNREACHABLE_GRACE_MS = 60 * 60_000;

/**
 * Background check of pending invoices (callbacks can be lost). Calls out: not
 * atomic. A gateway that can't be reached keeps the invoice pending and the
 * checks going, until an hour after it expires.
 */
export const paymentCheckJob = defineJob({
  queue: 'payment.check',
  retry: { attempts: 3 },
  payload: z.object({ invoiceId: z.string(), round: z.number() }),
  async handle(job) {
    const { invoiceId, round } = job.payload;

    const { invoice, reached } = await refresh(job.orgId, invoiceId).then(
      (checked) => ({ invoice: checked.invoice, reached: true }),
      async (error: unknown) => {
        log.warn({ invoice: invoiceId, round, err: error }, 'could not check a pending invoice');

        const stored = await withOrg(job.orgId, (tx) => invoiceWithGateway(tx, invoiceId));

        return { invoice: stored.invoice, reached: false };
      },
    );

    if (invoice.status !== 'pending') return;

    if (!reached && invoice.expiresAt.getTime() + UNREACHABLE_GRACE_MS < Date.now()) {
      log.error(
        { invoice: invoiceId, round },
        'gave up checking an invoice its gateway never answered for',
      );

      return;
    }

    await withOrg(job.orgId, (tx) => queueCheck(tx, invoice, round + 1));
  },
});

/**
 * How long until check `round`: most payers pay within a minute of seeing the
 * QR, so every 5 s for the first minute, every 15 s for the next four, then
 * every minute until the invoice expires.
 */
const checkDelay = (round: number) => (round < 12 ? 5_000 : round < 28 ? 15_000 : 60_000);

/** Checks a pending invoice with the gateway (`checkDelay`), so a lost callback still settles it. */
export const queueCheck = (client: Db, invoice: InvoiceRow, round: number) =>
  paymentCheckJob.enqueue(client, {
    orgId: invoice.orgId,
    payload: { invoiceId: invoice.id, round },
    runAt: new Date(Date.now() + checkDelay(round)),
    dedupeKey: `${invoice.id}:${round}`,
  });

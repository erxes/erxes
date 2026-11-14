import type { CursorQuery, Invoice, InvoiceLineInput } from '@erxes/core-contract';
import {
  caller,
  type Db,
  newId,
  paymentInvoices,
  requestOrgId,
  sourceOf,
  withOrg,
} from '@erxes/core-db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { logger } from '~/logger';
import { appLink } from '~/modules/email/email';
import { publishCoreEvents } from '~/modules/events/events.service';
import { getOrganization } from '~/modules/organizations/organizations.service';
import { driverOf, resolveGateway } from './gateways.service';
import { resolveInvoiceLines } from './invoiceLines';
import {
  callbackSignature,
  eventPayload,
  invoiceWithGateway,
  queueCheck,
  refresh,
  selectInvoices,
  shownInvoice,
} from './invoiceState';

const log = logger.child({ component: 'payments' });

const invoiceByDedupeKey = async (client: Db, dedupeKey: string) => {
  const [existing] = await selectInvoices(client)
    .where(
      and(eq(paymentInvoices.source, sourceOf(caller())), eq(paymentInvoices.dedupeKey, dedupeKey)),
    )
    .limit(1);

  return existing ?? null;
};

interface InvoiceInput {
  gatewayId?: string;
  amount: number;
  /** The organisation's unless given. */
  currency?: string;
  description: string;
  referenceType: string;
  referenceId: string;
  expiresInMinutes: number;
  dedupeKey?: string;
  metadata?: Record<string, unknown>;
  lines?: InvoiceLineInput[];
}

/** What creating an invoice needs before asking the gateway, or the invoice its dedupe key already made. */
const prepareInvoice = (orgId: string, input: InvoiceInput) =>
  withOrg(orgId, async (tx) => {
    const existing = input.dedupeKey ? await invoiceByDedupeKey(tx, input.dedupeKey) : null;

    if (existing) return { existing };

    const lines = await resolveInvoiceLines(tx, input.amount, input.lines ?? []);
    const currency = input.currency ?? (await getOrganization(tx)).currency;
    const gateway = await resolveGateway(tx, currency, input.gatewayId);
    const id = newId();
    const path = `/core/v1/payments/callback/${id}?sig=${callbackSignature(id)}`;

    return { gateway, id, lines, currency, callbackUrl: await appLink(tx, path) };
  });

/**
 * Opens an invoice with the gateway, then stores it. The gateway is asked
 * between two short scopes; two calls at once with one dedupe key both get
 * the invoice stored first. Call it outside any scope.
 */
export const createInvoice = async (input: InvoiceInput) => {
  const orgId = requestOrgId();
  const prepared = await prepareInvoice(orgId, input);

  if (prepared.existing) return prepared.existing;

  const { gateway, id, lines, currency, callbackUrl } = prepared;

  const created = await driverOf(gateway).createInvoice({
    invoiceId: id,
    amount: input.amount,
    currency,
    description: input.description,
    callbackUrl,
  });

  return withOrg(orgId, async (tx) => {
    const [row] = await tx
      .insert(paymentInvoices)
      .values({
        id,
        gatewayId: gateway.id,
        source: sourceOf(caller()),
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        amount: input.amount,
        currency,
        description: input.description,
        gatewayInvoiceId: created.gatewayInvoiceId,
        payment: created.payment,
        expiresAt: sql`now() + make_interval(mins => ${input.expiresInMinutes})`,
        dedupeKey: input.dedupeKey ?? null,
        metadata: input.metadata ?? {},
        lines,
      })
      .onConflictDoNothing()
      .returning();

    if (!row) {
      const first = input.dedupeKey ? await invoiceByDedupeKey(tx, input.dedupeKey) : null;

      if (!first) throw new Error(`invoice ${id} was neither stored nor found`);

      return first;
    }

    await queueCheck(tx, row, 0);

    return shownInvoice(tx, row.id);
  });
};

/**
 * The invoice, refreshed with its gateway. Plugins see their own invoices,
 * and read those with a line for them (`reader`); only the owner changes one.
 */
const visibleInvoice = async (id: string, access: 'owner' | 'reader') => {
  const orgId = requestOrgId();
  const who = caller();
  const { invoice } = await withOrg(orgId, (tx) => invoiceWithGateway(tx, id));

  if (
    who.type === 'plugin' &&
    invoice.source !== who.plugin &&
    !(access === 'reader' && invoice.lines.some((line) => line.plugin === who.plugin))
  )
    throw notFound('Invoice');

  return refresh(orgId, id);
};

export const getInvoice = async (id: string) => {
  await visibleInvoice(id, 'reader');

  return withOrg(requestOrgId(), (tx) => shownInvoice(tx, id));
};

/** Cancels a pending invoice with the gateway (best effort), then here. Call it outside any scope. */
export const cancelInvoice = async (id: string) => {
  const { invoice, gateway } = await visibleInvoice(id, 'owner');

  if (invoice.status !== 'pending') throw fail('NOT_PENDING', `The invoice is ${invoice.status}`);

  await driverOf(gateway)
    .cancel(invoice.gatewayInvoiceId ?? '')
    .catch((error: unknown) =>
      log.warn({ invoice: id, err: error }, 'gateway could not cancel the invoice'),
    );

  return withOrg(requestOrgId(), async (tx) => {
    const [cancelled] = await tx
      .update(paymentInvoices)
      .set({ status: 'cancelled', updatedAt: sql`now()` })
      .where(and(eq(paymentInvoices.id, id), eq(paymentInvoices.status, 'pending')))
      .returning();

    if (cancelled) {
      await publishCoreEvents(tx, {
        type: 'core.payment.cancelled',
        entityType: 'payment_invoice',
        entityId: id,
        payload: eventPayload(invoice),
      });
    }

    return shownInvoice(tx, id);
  });
};

export const listInvoices = async (
  client: Db,
  query: CursorQuery & { status?: Invoice['status']; source?: string; referenceId?: string },
) => {
  return keysetPage(
    client,
    {
      table: paymentInvoices,
      id: paymentInvoices.id,
      createdAt: paymentInvoices.createdAt,

      countCap: 10_000,
    },
    and(
      query.status ? eq(paymentInvoices.status, query.status) : undefined,
      query.source ? eq(paymentInvoices.source, query.source) : undefined,
      query.referenceId ? eq(paymentInvoices.referenceId, query.referenceId) : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      selectInvoices(client)
        .where(where)
        .orderBy(...orderBy, desc(paymentInvoices.id))
        .limit(limit),
  );
};

/** Test gateway only: the payer "pays". Call it outside any scope. */
export const payTestInvoice = async (id: string) => {
  const orgId = requestOrgId();

  await withOrg(orgId, async (tx) => {
    const { gateway } = await invoiceWithGateway(tx, id);

    if (gateway.kind !== 'test')
      throw fail('NOT_TEST', 'Only invoices of the test gateway can be paid this way');

    await tx
      .update(paymentInvoices)
      .set({ payment: sql`${paymentInvoices.payment} || '{"testPaid": true}'::jsonb` })
      .where(eq(paymentInvoices.id, id));
  });

  await refresh(orgId, id);

  return withOrg(orgId, (tx) => shownInvoice(tx, id));
};

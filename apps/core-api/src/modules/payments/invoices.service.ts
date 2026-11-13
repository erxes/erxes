import type { CursorQuery, Invoice, InvoiceLineInput } from '@erxes/core-contract';
import { type Db, newId, paymentGateways, paymentInvoices, withOrg } from '@erxes/core-db';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { Actor, Caller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
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
  toInvoiceDto,
} from './invoiceState';

const log = logger.child({ component: 'payments' });

const invoiceByDedupeKey = async (client: Db, caller: Caller, dedupeKey: string) => {
  const [existing] = await client
    .select({ invoice: paymentInvoices, kind: paymentGateways.kind })
    .from(paymentInvoices)
    .innerJoin(paymentGateways, eq(paymentGateways.id, paymentInvoices.gatewayId))
    .where(
      and(
        eq(paymentInvoices.orgId, caller.orgId),
        eq(paymentInvoices.source, caller.source),
        eq(paymentInvoices.dedupeKey, dedupeKey),
      ),
    )
    .limit(1);

  return existing ? toInvoiceDto(existing.invoice, existing.kind) : null;
};

interface InvoiceInput {
  gatewayId?: string;
  amount: number;
  /** The organisation's unless given. */
  currency?: string;
  description: string;
  reference: { type: string; id: string };
  expiresInMinutes: number;
  dedupeKey?: string;
  metadata?: Record<string, unknown>;
  lines?: InvoiceLineInput[];
}

/** What creating an invoice needs before asking the gateway, or the invoice its dedupe key already made. */
const prepareInvoice = (caller: Caller, input: InvoiceInput) =>
  withOrg(caller.orgId, async (tx) => {
    const existing = input.dedupeKey ? await invoiceByDedupeKey(tx, caller, input.dedupeKey) : null;

    if (existing) return { existing };

    const lines = await resolveInvoiceLines(tx, caller.orgId, input.amount, input.lines ?? []);
    const currency = input.currency ?? (await getOrganization(tx, caller.orgId)).currency;
    const gateway = await resolveGateway(tx, caller, currency, input.gatewayId);
    const id = newId();
    const path = `/core/v1/payments/callback/${id}?sig=${callbackSignature(id)}`;

    return { gateway, id, lines, currency, callbackUrl: await appLink(tx, caller.orgId, path) };
  });

/**
 * Opens an invoice with the gateway, then stores it. The gateway is asked
 * between two short scopes; two calls at once with one dedupe key both get
 * the invoice stored first. Call it outside any scope.
 */
export const createInvoice = async (caller: Caller, input: InvoiceInput) => {
  const prepared = await prepareInvoice(caller, input);

  if (prepared.existing) return prepared.existing;

  const { gateway, id, lines, currency, callbackUrl } = prepared;

  const created = await driverOf(gateway).createInvoice({
    invoiceId: id,
    amount: input.amount,
    currency,
    description: input.description,
    callbackUrl,
  });

  return withOrg(caller.orgId, async (tx) => {
    const [row] = await tx
      .insert(paymentInvoices)
      .values({
        id,
        orgId: caller.orgId,
        gatewayId: gateway.id,
        source: caller.source,
        referenceType: input.reference.type,
        referenceId: input.reference.id,
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
      const first = input.dedupeKey ? await invoiceByDedupeKey(tx, caller, input.dedupeKey) : null;

      if (!first) throw new Error(`invoice ${id} was neither stored nor found`);

      return first;
    }

    await queueCheck(tx, row, 0);

    return toInvoiceDto(row, gateway.kind);
  });
};

/**
 * The invoice, refreshed with its gateway. Plugins see their own invoices,
 * and read those with a line for them (`reader`); only the owner changes one.
 */
const visibleInvoice = async (caller: Caller, id: string, access: 'owner' | 'reader') => {
  const { invoice } = await withOrg(caller.orgId, (tx) => invoiceWithGateway(tx, caller.orgId, id));
  const hasLine = invoice.lines.some((line) => line.plugin === caller.source);

  if (
    caller.actorType === 'plugin' &&
    invoice.source !== caller.source &&
    !(access === 'reader' && hasLine)
  )
    throw notFound('Invoice');

  return refresh(caller.orgId, id);
};

export const getInvoice = async (caller: Caller, id: string) => {
  const { invoice, gateway } = await visibleInvoice(caller, id, 'reader');

  return toInvoiceDto(invoice, gateway.kind);
};

/** Cancels a pending invoice with the gateway (best effort), then here. Call it outside any scope. */
export const cancelInvoice = async (caller: Caller, id: string) => {
  const { invoice, gateway } = await visibleInvoice(caller, id, 'owner');

  if (invoice.status !== 'pending')
    throw new HttpError(409, 'NOT_PENDING', `The invoice is ${invoice.status}`);

  await driverOf(gateway)
    .cancel(invoice.gatewayInvoiceId ?? '')
    .catch((error: unknown) =>
      log.warn({ invoice: id, err: error }, 'gateway could not cancel the invoice'),
    );

  return withOrg(caller.orgId, async (tx) => {
    const [cancelled] = await tx
      .update(paymentInvoices)
      .set({ status: 'cancelled', updatedAt: sql`now()` })
      .where(and(eq(paymentInvoices.id, id), eq(paymentInvoices.status, 'pending')))
      .returning();

    if (cancelled) {
      await publishCoreEvents(tx, caller, {
        type: 'core.payment.cancelled',
        entity: { type: 'payment_invoice', id },
        payload: eventPayload(invoice),
      });
    }

    return toInvoiceDto(cancelled ?? invoice, gateway.kind);
  });
};

export const listInvoices = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & { status?: Invoice['status']; source?: string; referenceId?: string },
) => {
  const page = await keysetPage(
    client,
    {
      table: paymentInvoices,
      id: paymentInvoices.id,
      createdAt: paymentInvoices.createdAt,
      scope: eq(paymentInvoices.orgId, actor.orgId),
      countCap: 10_000,
    },
    and(
      query.status ? eq(paymentInvoices.status, query.status) : undefined,
      query.source ? eq(paymentInvoices.source, query.source) : undefined,
      query.referenceId ? eq(paymentInvoices.referenceId, query.referenceId) : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(paymentInvoices)
        .where(where)
        .orderBy(...orderBy, desc(paymentInvoices.id))
        .limit(limit),
  );

  const kinds = new Map(
    (
      await client
        .select({ id: paymentGateways.id, kind: paymentGateways.kind })
        .from(paymentGateways)
        .where(eq(paymentGateways.orgId, actor.orgId))
    ).map((row) => [row.id, row.kind]),
  );

  return {
    ...page,
    data: page.data.map((row) => toInvoiceDto(row, kinds.get(row.gatewayId) ?? 'test')),
  };
};

/** Test gateway only: the payer "pays". Call it outside any scope. */
export const payTestInvoice = async (actor: Actor, id: string) => {
  await withOrg(actor.orgId, async (tx) => {
    const { gateway } = await invoiceWithGateway(tx, actor.orgId, id);

    if (gateway.kind !== 'test')
      throw new HttpError(
        400,
        'NOT_TEST',
        'Only invoices of the test gateway can be paid this way',
      );

    await tx
      .update(paymentInvoices)
      .set({ payment: sql`${paymentInvoices.payment} || '{"testPaid": true}'::jsonb` })
      .where(eq(paymentInvoices.id, id));
  });

  const { invoice, gateway } = await refresh(actor.orgId, id);

  return toInvoiceDto(invoice, gateway.kind);
};

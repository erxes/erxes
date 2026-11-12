import type { CursorQuery, Invoice } from '@erxes/core-contract';
import {
  type Db,
  newId,
  paymentGateways,
  paymentInvoices,
  paymentPluginSettings,
} from '@erxes/core-db';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import type { Actor, Caller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { logger } from '~/logger';
import { appLink } from '~/modules/email/email';
import { publishCoreEvents } from '~/modules/events/events.service';
import { driverOf } from './gateways.service';
import { callbackSignature, eventPayload, queueCheck, refresh, toInvoiceDto } from './invoiceState';

const log = logger.child({ component: 'payments' });

const pluginSettingsOf = async (client: Db, caller: Caller) => {
  if (caller.actorType !== 'plugin') return null;

  const [settings] = await client
    .select()
    .from(paymentPluginSettings)
    .where(
      and(
        eq(paymentPluginSettings.orgId, caller.orgId),
        eq(paymentPluginSettings.plugin, caller.source),
      ),
    )
    .limit(1);

  return settings ?? null;
};

/**
 * The gateway an invoice goes through: the one asked for, else the plugin's
 * default (Settings › Payments), else the first active one — within the
 * gateways the owner allowed the plugin, if any are listed.
 */
const resolveGateway = async (client: Db, caller: Caller, requested?: string) => {
  const settings = await pluginSettingsOf(client, caller);
  const allowed = settings?.allowedGatewayIds ?? [];

  if (requested && allowed.length && !allowed.includes(requested)) {
    throw new HttpError(
      403,
      'GATEWAY_NOT_ALLOWED',
      'This plugin may not use that gateway (Settings › Payments)',
    );
  }

  const active = await client
    .select()
    .from(paymentGateways)
    .where(
      and(
        eq(paymentGateways.orgId, caller.orgId),
        eq(paymentGateways.status, 'active'),
        requested
          ? eq(paymentGateways.id, requested)
          : allowed.length
            ? inArray(paymentGateways.id, allowed)
            : undefined,
      ),
    )
    .orderBy(paymentGateways.createdAt);

  const preferred = requested
    ? undefined
    : active.find((row) => row.id === settings?.defaultGatewayId);

  const gateway = preferred ?? active[0];

  if (!gateway) {
    throw new HttpError(
      400,
      'NO_GATEWAY',
      requested
        ? 'That gateway is not connected or is turned off'
        : 'Connect a payment gateway first (Settings › Payments)',
    );
  }

  return gateway;
};

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

export const createInvoice = async (
  client: Db,
  caller: Caller,
  input: {
    gatewayId?: string;
    amount: number;
    currency: 'MNT';
    description: string;
    reference: { type: string; id: string };
    expiresInMinutes: number;
    dedupeKey?: string;
    metadata?: Record<string, unknown>;
  },
) => {
  const existing = input.dedupeKey
    ? await invoiceByDedupeKey(client, caller, input.dedupeKey)
    : null;

  if (existing) return existing;

  const gateway = await resolveGateway(client, caller, input.gatewayId);
  const id = newId();

  const callbackUrl = await appLink(
    client,
    caller.orgId,
    `/core/v1/payments/callback/${id}?sig=${callbackSignature(id)}`,
  );

  const created = await driverOf(gateway).createInvoice({
    invoiceId: id,
    amount: input.amount,
    description: input.description,
    callbackUrl,
  });

  const row = oneRow(
    await client
      .insert(paymentInvoices)
      .values({
        id,
        orgId: caller.orgId,
        gatewayId: gateway.id,
        source: caller.source,
        referenceType: input.reference.type,
        referenceId: input.reference.id,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        gatewayInvoiceId: created.gatewayInvoiceId,
        payment: created.payment,
        expiresAt: sql`now() + make_interval(mins => ${input.expiresInMinutes})`,
        dedupeKey: input.dedupeKey ?? null,
        metadata: input.metadata ?? {},
      })
      .returning(),
  );

  await queueCheck(client, row, 0);

  return toInvoiceDto(row, gateway.kind);
};

/** The invoice, refreshed with its gateway; plugins see their own invoices only. */
const visibleInvoice = async (client: Db, caller: Caller, id: string) => {
  const refreshed = await refresh(client, caller.orgId, id);

  if (caller.actorType === 'plugin' && refreshed.invoice.source !== caller.source)
    throw notFound('Invoice');

  return refreshed;
};

export const getInvoice = async (client: Db, caller: Caller, id: string) => {
  const { invoice, kind } = await visibleInvoice(client, caller, id);

  return toInvoiceDto(invoice, kind);
};

export const cancelInvoice = async (client: Db, caller: Caller, id: string) => {
  const { invoice, kind } = await visibleInvoice(client, caller, id);

  if (invoice.status !== 'pending')
    throw new HttpError(409, 'NOT_PENDING', `The invoice is ${invoice.status}`);

  const gateway = oneRow(
    await client
      .select()
      .from(paymentGateways)
      .where(eq(paymentGateways.id, invoice.gatewayId))
      .limit(1),
  );

  await driverOf(gateway)
    .cancel(invoice.gatewayInvoiceId ?? '')
    .catch((error: unknown) =>
      log.warn({ invoice: id, err: error }, 'gateway could not cancel the invoice'),
    );

  const [cancelled] = await client
    .update(paymentInvoices)
    .set({ status: 'cancelled', updatedAt: sql`now()` })
    .where(and(eq(paymentInvoices.id, id), eq(paymentInvoices.status, 'pending')))
    .returning();

  if (cancelled) {
    await publishCoreEvents(client, caller, {
      type: 'core.payment.cancelled',
      entity: { type: 'payment_invoice', id },
      payload: eventPayload(invoice),
    });
  }

  return toInvoiceDto(cancelled ?? invoice, kind);
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

/** Test gateway only: the payer "pays". */
export const payTestInvoice = async (client: Db, actor: Actor, id: string) => {
  const [row] = await client
    .select({ invoice: paymentInvoices, kind: paymentGateways.kind })
    .from(paymentInvoices)
    .innerJoin(paymentGateways, eq(paymentGateways.id, paymentInvoices.gatewayId))
    .where(and(eq(paymentInvoices.orgId, actor.orgId), eq(paymentInvoices.id, id)))
    .limit(1);

  if (!row) throw notFound('Invoice');

  if (row.kind !== 'test')
    throw new HttpError(400, 'NOT_TEST', 'Only invoices of the test gateway can be paid this way');

  await client
    .update(paymentInvoices)
    .set({ payment: sql`${paymentInvoices.payment} || '{"testPaid": true}'::jsonb` })
    .where(eq(paymentInvoices.id, id));

  return toInvoiceDto((await refresh(client, actor.orgId, id)).invoice, row.kind);
};

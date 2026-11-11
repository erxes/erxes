import type { CursorQuery, GatewayConfig, Invoice, PaymentGateway } from '@erxes/core-contract';
import { type Db, newId, paymentGateways, paymentInvoices, type Transaction, withOrg, withSystem } from '@erxes/core-db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { Router, type Request, type Response } from 'express';
import { createHmac, hkdfSync, timingSafeEqual } from 'node:crypto';
import { config } from '~/config';
import { type Actor, type Caller, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { log } from '~/lib/log';
import { seal, unseal } from '~/lib/secrets';
import { recordAudit } from '~/modules/audit/audit.service';
import { appLink } from '~/modules/email/email';
import { publishCoreEvents } from '~/modules/events/events.service';
import { enqueueJob, type JobDefinition } from '~/modules/jobs/jobs';
import { driverOf } from './gateways';

type GatewayRow = typeof paymentGateways.$inferSelect;
type InvoiceRow = typeof paymentInvoices.$inferSelect;

const configOf = (row: GatewayRow) => JSON.parse(unseal(row.configSealed)) as GatewayConfig;

/** What may be shown of a gateway's settings: never secrets. */
const visibleSettings = (settings: GatewayConfig): Record<string, unknown> =>
  settings.kind === 'qpay' ? { invoiceCode: settings.invoiceCode, sandbox: settings.sandbox, clientId: settings.clientId } : {};

const toGatewayDto = (row: GatewayRow): PaymentGateway => ({
  id: row.id,
  kind: row.kind,
  name: row.name,
  status: row.status,
  settings: visibleSettings(configOf(row)),
  createdAt: row.createdAt.toISOString(),
});

const toInvoiceDto = (row: InvoiceRow, kind: GatewayRow['kind']): Invoice => {
  const payment = row.payment as Partial<Invoice['payment']>;

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
    payment: { qrText: payment.qrText ?? null, qrImage: payment.qrImage ?? null, shortUrl: payment.shortUrl ?? null, links: payment.links ?? [] },
    expiresAt: row.expiresAt.toISOString(),
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
};

const gatewayOrThrow = async (client: Db, orgId: string, id: string) => {
  const [row] = await client.select().from(paymentGateways).where(and(eq(paymentGateways.orgId, orgId), eq(paymentGateways.id, id))).limit(1);

  if (!row) throw notFound('Gateway');

  return row;
};

const verifyGateway = async (id: string, settings: GatewayConfig) => {
  try {
    await driverOf(id, settings).verify();
  } catch (error) {
    throw new HttpError(400, 'GATEWAY_REFUSED', `The gateway refused these credentials: ${(error as Error).message}`);
  }
};

export const listGateways = async (client: Db, actor: Actor) => ({
  data: (await client.select().from(paymentGateways).where(eq(paymentGateways.orgId, actor.orgId)).orderBy(paymentGateways.createdAt)).map(toGatewayDto),
});

export const addGateway = async (client: Db, actor: Actor, input: { name: string; config: GatewayConfig }) => {
  const id = newId();

  await verifyGateway(id, input.config);

  const [row] = await client
    .insert(paymentGateways)
    .values({ id, orgId: actor.orgId, kind: input.config.kind, name: input.name, configSealed: seal(JSON.stringify(input.config)), createdBy: actor.userId })
    .returning();

  await recordAudit(client, userCaller(actor), {
    action: 'payment.gateway_added',
    targetType: 'payment_gateway',
    targetId: id,
    targetLabel: input.name,
    metadata: { kind: input.config.kind, ...visibleSettings(input.config) },
  });

  return toGatewayDto(row!);
};

export const updateGateway = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { name?: string; config?: GatewayConfig; status?: 'active' | 'disabled' },
) => {
  const before = await gatewayOrThrow(client, actor.orgId, id);

  if (input.config) {
    if (input.config.kind !== before.kind) throw new HttpError(400, 'KIND_CHANGED', 'Add a new gateway to change its kind');
    await verifyGateway(id, input.config);
  }

  const [row] = await client
    .update(paymentGateways)
    .set({
      ...(input.name ? { name: input.name } : {}),
      ...(input.config ? { configSealed: seal(JSON.stringify(input.config)) } : {}),
      ...(input.status ? { status: input.status } : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(paymentGateways.id, id))
    .returning();

  await recordAudit(client, userCaller(actor), {
    action: 'payment.gateway_updated',
    targetType: 'payment_gateway',
    targetId: id,
    targetLabel: row!.name,
    metadata: { credentialsChanged: Boolean(input.config), status: input.status },
  });

  return toGatewayDto(row!);
};

export const removeGateway = async (client: Db, actor: Actor, id: string) => {
  const row = await gatewayOrThrow(client, actor.orgId, id);
  const [used] = await client.select({ id: paymentInvoices.id }).from(paymentInvoices).where(eq(paymentInvoices.gatewayId, id)).limit(1);

  if (used) throw new HttpError(409, 'GATEWAY_IN_USE', 'It has invoices: turn it off instead');

  await client.delete(paymentGateways).where(eq(paymentGateways.id, id));
  await recordAudit(client, userCaller(actor), { action: 'payment.gateway_removed', targetType: 'payment_gateway', targetId: id, targetLabel: row.name });

  return { ok: true as const };
};

const callbackKey = () => Buffer.from(hkdfSync('sha256', config.auth.encryptionKey ?? config.auth.jwtSecret, Buffer.alloc(0), 'erxes-payment-callback-v1', 32));
const callbackSignature = (invoiceId: string) => createHmac('sha256', callbackKey()).update(invoiceId).digest('base64url');

/** Checks pending invoices with the gateway every 30 s at first, then every 2 minutes, until they expire. */
const queueCheck = (client: Db, invoice: InvoiceRow, round: number) =>
  enqueueJob(client, {
    orgId: invoice.orgId,
    queue: 'payment.check',
    payload: { invoiceId: invoice.id, round },
    runAt: new Date(Date.now() + (round < 20 ? 30_000 : 120_000)),
    dedupeKey: `${invoice.id}:${round}`,
    maxAttempts: 3,
  });

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
  },
) => {
  if (input.dedupeKey) {
    const [existing] = await client
      .select({ invoice: paymentInvoices, kind: paymentGateways.kind })
      .from(paymentInvoices)
      .innerJoin(paymentGateways, eq(paymentGateways.id, paymentInvoices.gatewayId))
      .where(and(eq(paymentInvoices.orgId, caller.orgId), eq(paymentInvoices.source, caller.source), eq(paymentInvoices.dedupeKey, input.dedupeKey)))
      .limit(1);

    if (existing) return toInvoiceDto(existing.invoice, existing.kind);
  }

  const gateways = await client
    .select()
    .from(paymentGateways)
    .where(and(eq(paymentGateways.orgId, caller.orgId), eq(paymentGateways.status, 'active'), input.gatewayId ? eq(paymentGateways.id, input.gatewayId) : undefined))
    .orderBy(paymentGateways.createdAt)
    .limit(1);
  const gateway = gateways[0];

  if (!gateway) throw new HttpError(400, 'NO_GATEWAY', 'Connect a payment gateway first (Settings › Payments)');

  const id = newId();
  const callbackUrl = await appLink(client, caller.orgId, `/core/v1/payments/callback/${id}?sig=${callbackSignature(id)}`);
  const created = await driverOf(gateway.id, configOf(gateway)).createInvoice({
    invoiceId: id,
    amount: input.amount,
    description: input.description,
    callbackUrl,
  });
  const [row] = await client
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
    })
    .returning();

  await queueCheck(client, row!, 0);

  return toInvoiceDto(row!, gateway.kind);
};

/** Paid: once (a conditional update), then `core.payment.paid` for whoever waits on it. */
const markPaid = async (tx: Db, invoice: InvoiceRow, kind: string) => {
  const [paid] = await tx
    .update(paymentInvoices)
    .set({ status: 'paid', paidAt: sql`now()`, updatedAt: sql`now()` })
    .where(and(eq(paymentInvoices.id, invoice.id), eq(paymentInvoices.status, 'pending')))
    .returning();

  if (!paid) return invoice;

  await publishCoreEvents(tx, { orgId: invoice.orgId, actorType: 'system', actorId: null, source: 'core' } as never, {
    type: 'core.payment.paid',
    entity: { type: 'payment_invoice', id: invoice.id },
    payload: {
      invoiceId: invoice.id,
      source: invoice.source,
      reference: { type: invoice.referenceType, id: invoice.referenceId },
      amount: invoice.amount,
      currency: invoice.currency,
      gateway: kind,
    },
  });

  return paid;
};

/** Asks the gateway about a pending invoice (row locked: one check at a time). */
const refresh = async (tx: Transaction | Db, orgId: string, id: string) => {
  const [row] = await tx
    .select({ invoice: paymentInvoices, gateway: paymentGateways })
    .from(paymentInvoices)
    .innerJoin(paymentGateways, eq(paymentGateways.id, paymentInvoices.gatewayId))
    .where(and(eq(paymentInvoices.orgId, orgId), eq(paymentInvoices.id, id)))
    .for('update', { of: paymentInvoices })
    .limit(1);

  if (!row) throw notFound('Invoice');

  let invoice = row.invoice;

  if (invoice.status === 'pending' && invoice.gatewayInvoiceId) {
    const paid = await driverOf(row.gateway.id, configOf(row.gateway)).isPaid(invoice.gatewayInvoiceId, invoice.amount, invoice.payment);

    if (paid) invoice = await markPaid(tx, invoice, row.gateway.kind);
    else if (invoice.expiresAt.getTime() < Date.now()) {
      [invoice] = await tx
        .update(paymentInvoices)
        .set({ status: 'expired', updatedAt: sql`now()` })
        .where(eq(paymentInvoices.id, invoice.id))
        .returning() as [InvoiceRow];
    }
  }

  return { invoice, kind: row.gateway.kind };
};

export const getInvoice = async (client: Db, caller: Caller, id: string) => {
  const { invoice, kind } = await refresh(client, caller.orgId, id);

  // Plugins see their own invoices only.
  if (caller.actorType === 'plugin' && invoice.source !== caller.source) throw notFound('Invoice');

  return toInvoiceDto(invoice, kind);
};

export const cancelInvoice = async (client: Db, caller: Caller, id: string) => {
  const { invoice, kind } = await refresh(client, caller.orgId, id);

  if (caller.actorType === 'plugin' && invoice.source !== caller.source) throw notFound('Invoice');
  if (invoice.status !== 'pending') throw new HttpError(409, 'NOT_PENDING', `The invoice is ${invoice.status}`);

  const [gateway] = await client.select().from(paymentGateways).where(eq(paymentGateways.id, invoice.gatewayId)).limit(1);

  await driverOf(gateway!.id, configOf(gateway!))
    .cancel(invoice.gatewayInvoiceId ?? '')
    .catch((error: unknown) => log.warn('gateway could not cancel the invoice', { invoice: id, error }));

  const [cancelled] = await client
    .update(paymentInvoices)
    .set({ status: 'cancelled', updatedAt: sql`now()` })
    .where(and(eq(paymentInvoices.id, id), eq(paymentInvoices.status, 'pending')))
    .returning();

  if (cancelled) {
    await publishCoreEvents(client, caller, {
      type: 'core.payment.cancelled',
      entity: { type: 'payment_invoice', id },
      payload: { invoiceId: id, source: invoice.source, reference: { type: invoice.referenceType, id: invoice.referenceId } },
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
    { table: paymentInvoices, id: paymentInvoices.id, createdAt: paymentInvoices.createdAt, scope: eq(paymentInvoices.orgId, actor.orgId), countCap: 10_000 },
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
    (await client.select({ id: paymentGateways.id, kind: paymentGateways.kind }).from(paymentGateways).where(eq(paymentGateways.orgId, actor.orgId))).map(
      (row) => [row.id, row.kind],
    ),
  );

  return { ...page, data: page.data.map((row) => toInvoiceDto(row, kinds.get(row.gatewayId) ?? 'test')) };
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
  if (row.kind !== 'test') throw new HttpError(400, 'NOT_TEST', 'Only invoices of the test gateway can be paid this way');

  await client
    .update(paymentInvoices)
    .set({ payment: sql`${paymentInvoices.payment} || '{"testPaid": true}'::jsonb` })
    .where(eq(paymentInvoices.id, id));

  return toInvoiceDto((await refresh(client, actor.orgId, id)).invoice, row.kind);
};

/** Background check of pending invoices (callbacks can be lost). */
export const paymentCheckJob: JobDefinition = {
  queue: 'payment.check',
  atomic: true,
  async handle(job, tx) {
    const db = tx as Transaction;
    const { invoice } = await refresh(db, job.orgId, job.payload.invoiceId as string).catch(() => ({ invoice: null }));

    if (invoice?.status === 'pending') await queueCheck(db, invoice, Number(job.payload.round ?? 0) + 1);
  },
};

/**
 * `GET|POST /core/v1/payments/callback/:id?sig=…`: the gateway says something
 * happened. The signature proves the address is ours; the status is then
 * asked of the gateway itself — the callback alone never marks anything paid.
 */
export const paymentCallbackRouter = Router();

paymentCallbackRouter.all('/payments/callback/:id', (req: Request, res: Response) => {
  const id = req.params.id ?? '';
  const given = Buffer.from(String(req.query.sig ?? ''));
  const expected = Buffer.from(callbackSignature(id));

  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    res.status(403).json({ error: 'invalid signature' });
    return;
  }

  (async () => {
    const [owner] = await withSystem('payment callback lookup', (tx) =>
      tx.select({ orgId: paymentInvoices.orgId }).from(paymentInvoices).where(eq(paymentInvoices.id, id)).limit(1),
    );

    if (owner) await withOrg(owner.orgId, (tx) => refresh(tx, owner.orgId, id));

    res.status(200).json({ ok: true });
  })().catch((error: unknown) => {
    log.error('payment callback failed', { invoice: id, error });
    res.status(500).json({ error: 'try again' });
  });
});


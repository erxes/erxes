import type {
  CursorQuery,
  GatewayConfig,
  Invoice,
  PaymentGateway,
  PluginPaymentSettings,
  Refund,
} from '@erxes/core-contract';
import {
  type Db,
  newId,
  paymentGateways,
  paymentInvoices,
  paymentPluginSettings,
  paymentRefunds,
  pluginInstallations,
  plugins,
  type Transaction,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { createGateway, GATEWAY_REFUNDS } from '@erxes/payment-gateways';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
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

type GatewayRow = typeof paymentGateways.$inferSelect;
type InvoiceRow = typeof paymentInvoices.$inferSelect;
type RefundRow = typeof paymentRefunds.$inferSelect;

const configOf = (row: GatewayRow) => JSON.parse(unseal(row.configSealed)) as GatewayConfig;
const driverOf = (row: GatewayRow) => createGateway(configOf(row), { cacheKey: row.id });
const systemCaller = (orgId: string) =>
  ({ orgId, actorType: 'system', actorId: null, source: 'core' }) as never;

/** What may be shown of a gateway's settings: never secrets. */
const visibleSettings = (settings: GatewayConfig): Record<string, unknown> =>
  settings.kind === 'qpay'
    ? { invoiceCode: settings.invoiceCode, sandbox: settings.sandbox, clientId: settings.clientId }
    : {};

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

const gatewayOrThrow = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(paymentGateways)
    .where(and(eq(paymentGateways.orgId, orgId), eq(paymentGateways.id, id)))
    .limit(1);

  if (!row) throw notFound('Gateway');

  return row;
};

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

const verifyGateway = async (id: string, settings: GatewayConfig) => {
  try {
    await createGateway(settings, { cacheKey: id }).verify();
  } catch (error) {
    throw new HttpError(
      400,
      'GATEWAY_REFUSED',
      `The gateway refused these credentials: ${(error as Error).message}`,
    );
  }
};

export const listGateways = async (client: Db, actor: Actor) => ({
  data: (
    await client
      .select()
      .from(paymentGateways)
      .where(eq(paymentGateways.orgId, actor.orgId))
      .orderBy(paymentGateways.createdAt)
  ).map(toGatewayDto),
});

export const addGateway = async (
  client: Db,
  actor: Actor,
  input: { name: string; config: GatewayConfig },
) => {
  const id = newId();

  await verifyGateway(id, input.config);

  const [row] = await client
    .insert(paymentGateways)
    .values({
      id,
      orgId: actor.orgId,
      kind: input.config.kind,
      name: input.name,
      configSealed: seal(JSON.stringify(input.config)),
      createdBy: actor.userId,
    })
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
    if (input.config.kind !== before.kind)
      throw new HttpError(400, 'KIND_CHANGED', 'Add a new gateway to change its kind');
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
  const [used] = await client
    .select({ id: paymentInvoices.id })
    .from(paymentInvoices)
    .where(eq(paymentInvoices.gatewayId, id))
    .limit(1);

  if (used) throw new HttpError(409, 'GATEWAY_IN_USE', 'It has invoices: turn it off instead');

  await client.delete(paymentGateways).where(eq(paymentGateways.id, id));
  // Plugins that used it go back to the organisation's other gateways.
  await client
    .update(paymentPluginSettings)
    .set({
      allowedGatewayIds: sql`array_remove(${paymentPluginSettings.allowedGatewayIds}, ${id})`,
      defaultGatewayId: sql`nullif(${paymentPluginSettings.defaultGatewayId}, ${id})`,
    })
    .where(eq(paymentPluginSettings.orgId, actor.orgId));
  await recordAudit(client, userCaller(actor), {
    action: 'payment.gateway_removed',
    targetType: 'payment_gateway',
    targetId: id,
    targetLabel: row.name,
  });

  return { ok: true as const };
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
const callbackSignature = (invoiceId: string) =>
  createHmac('sha256', callbackKey()).update(invoiceId).digest('base64url');

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

/**
 * The gateway an invoice goes through: the one asked for, else the plugin's
 * default (Settings › Payments), else the first active one — within the
 * gateways the owner allowed the plugin, if any are listed.
 */
const resolveGateway = async (client: Db, caller: Caller, requested?: string) => {
  const [settings] =
    caller.actorType === 'plugin'
      ? await client
          .select()
          .from(paymentPluginSettings)
          .where(
            and(
              eq(paymentPluginSettings.orgId, caller.orgId),
              eq(paymentPluginSettings.plugin, caller.source),
            ),
          )
          .limit(1)
      : [];
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
  const gateway =
    (!requested && active.find((row) => row.id === settings?.defaultGatewayId)) || active[0];

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
  if (input.dedupeKey) {
    const [existing] = await client
      .select({ invoice: paymentInvoices, kind: paymentGateways.kind })
      .from(paymentInvoices)
      .innerJoin(paymentGateways, eq(paymentGateways.id, paymentInvoices.gatewayId))
      .where(
        and(
          eq(paymentInvoices.orgId, caller.orgId),
          eq(paymentInvoices.source, caller.source),
          eq(paymentInvoices.dedupeKey, input.dedupeKey),
        ),
      )
      .limit(1);

    if (existing) return toInvoiceDto(existing.invoice, existing.kind);
  }

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
      metadata: input.metadata ?? {},
    })
    .returning();

  await queueCheck(client, row!, 0);

  return toInvoiceDto(row!, gateway.kind);
};

/** Paid: once (a conditional update), then `core.payment.paid` for whoever waits on it. */
const eventPayload = (invoice: InvoiceRow) => ({
  invoiceId: invoice.id,
  source: invoice.source,
  reference: { type: invoice.referenceType, id: invoice.referenceId },
  amount: invoice.amount,
  currency: invoice.currency,
  metadata: invoice.metadata,
});

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
    const check = await driverOf(row.gateway).check(
      invoice.gatewayInvoiceId,
      invoice.amount,
      invoice.payment,
    );

    if (check.paid) invoice = await markPaid(tx, invoice, row.gateway.kind, check);
    else if (invoice.expiresAt.getTime() < Date.now()) {
      [invoice] = (await tx
        .update(paymentInvoices)
        .set({ status: 'expired', updatedAt: sql`now()` })
        .where(eq(paymentInvoices.id, invoice.id))
        .returning()) as [InvoiceRow];
      await publishCoreEvents(tx, systemCaller(invoice.orgId), {
        type: 'core.payment.expired',
        entity: { type: 'payment_invoice', id: invoice.id },
        payload: eventPayload(invoice),
      });
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
  if (invoice.status !== 'pending')
    throw new HttpError(409, 'NOT_PENDING', `The invoice is ${invoice.status}`);

  const [gateway] = await client
    .select()
    .from(paymentGateways)
    .where(eq(paymentGateways.id, invoice.gatewayId))
    .limit(1);

  await driverOf(gateway!)
    .cancel(invoice.gatewayInvoiceId ?? '')
    .catch((error: unknown) =>
      log.warn('gateway could not cancel the invoice', { invoice: id, error }),
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

/**
 * Gives money back for a paid invoice (row locked: two refunds can't both
 * take what is left). Through the gateway when it can — QPay refunds whole
 * payments only — or `manual` to record money paid back outside erxes. A
 * gateway's refusal is kept as a failed refund and changes nothing else.
 */
export const refundInvoice = async (
  client: Db,
  caller: Caller,
  input: { id: string; amount?: number; reason: string; manual: boolean; dedupeKey?: string },
) => {
  const { invoice, gateway } = await ownInvoice(client, caller, input.id);

  if (input.dedupeKey) {
    const [existing] = await client
      .select()
      .from(paymentRefunds)
      .where(
        and(
          eq(paymentRefunds.orgId, caller.orgId),
          eq(paymentRefunds.invoiceId, invoice.id),
          eq(paymentRefunds.dedupeKey, input.dedupeKey),
        ),
      )
      .limit(1);

    if (existing)
      return { refund: toRefundDto(existing), invoice: toInvoiceDto(invoice, gateway.kind) };
  }

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

  const driver = driverOf(gateway);

  if (!input.manual) {
    if (driver.refunds === 'none')
      throw new HttpError(
        409,
        'PARTIAL_NOT_SUPPORTED',
        'This gateway does not refund: refund outside erxes and record it as manual',
      );
    if (driver.refunds === 'full' && (amount !== left || invoice.refundedAmount > 0)) {
      throw new HttpError(
        409,
        'PARTIAL_NOT_SUPPORTED',
        `${gateway.name} refunds whole payments only: refund the rest outside erxes and record it as manual`,
      );
    }
    if (!invoice.gatewayPaymentId)
      throw new HttpError(409, 'NOT_REFUNDABLE', 'The gateway gave no payment id to refund');
  }

  let outcome: {
    status: 'succeeded' | 'failed';
    gatewayRefundId: string | null;
    error: string | null;
  } = {
    status: 'succeeded',
    gatewayRefundId: null,
    error: null,
  };

  if (!input.manual) {
    try {
      const result = await driver.refund(
        { paymentId: invoice.gatewayPaymentId!, amount, note: input.reason },
        invoice.payment,
      );

      outcome.gatewayRefundId = result.refundId;
    } catch (error) {
      outcome = {
        status: 'failed',
        gatewayRefundId: null,
        error: (error as Error).message.slice(0, 500),
      };
      log.warn('gateway refused a refund', { invoice: invoice.id, error });
    }
  }

  const [refund] = await client
    .insert(paymentRefunds)
    .values({
      id: newId(),
      orgId: caller.orgId,
      invoiceId: invoice.id,
      amount,
      reason: input.reason,
      method: input.manual ? 'manual' : 'gateway',
      status: outcome.status,
      gatewayRefundId: outcome.gatewayRefundId,
      error: outcome.error,
      requestedByType: caller.actorType,
      requestedBy: caller.actorId,
      dedupeKey: input.dedupeKey ?? null,
    })
    .returning();

  if (outcome.status === 'failed')
    return { refund: toRefundDto(refund!), invoice: toInvoiceDto(invoice, gateway.kind) };

  const full = amount === left;
  const [updated] = await client
    .update(paymentInvoices)
    .set({
      refundedAmount: sql`${paymentInvoices.refundedAmount} + ${amount}`,
      status: full ? 'refunded' : 'paid',
      updatedAt: sql`now()`,
    })
    .where(eq(paymentInvoices.id, invoice.id))
    .returning();

  await publishCoreEvents(client, caller, {
    type: 'core.payment.refunded',
    entity: { type: 'payment_invoice', id: invoice.id },
    payload: {
      ...eventPayload(updated!),
      refundId: refund!.id,
      refundAmount: amount,
      refundedAmount: updated!.refundedAmount,
      full,
      method: refund!.method,
    },
  });
  await recordAudit(client, caller, {
    action: 'payment.refunded',
    targetType: 'payment_invoice',
    targetId: invoice.id,
    targetLabel: invoice.description,
    metadata: {
      amount,
      method: refund!.method,
      reason: input.reason,
      source: invoice.source,
      reference: `${invoice.referenceType}:${invoice.referenceId}`,
    },
  });

  return { refund: toRefundDto(refund!), invoice: toInvoiceDto(updated!, gateway.kind) };
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

/** Installed plugins that may create invoices (`payments:write`), with their settings. */
export const listPluginSettings = async (
  client: Db,
  actor: Actor,
): Promise<{ data: PluginPaymentSettings[] }> => {
  const rows = await client
    .select({
      plugin: pluginInstallations.plugin,
      manifest: plugins.manifest,
      settings: paymentPluginSettings,
    })
    .from(pluginInstallations)
    .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
    .leftJoin(
      paymentPluginSettings,
      and(
        eq(paymentPluginSettings.orgId, pluginInstallations.orgId),
        eq(paymentPluginSettings.plugin, pluginInstallations.plugin),
      ),
    )
    .where(
      and(
        eq(pluginInstallations.orgId, actor.orgId),
        sql`'payments:write' = any(${pluginInstallations.grantedScopes})`,
      ),
    )
    .orderBy(pluginInstallations.plugin);

  return {
    data: rows.map((row) => ({
      plugin: row.plugin,
      title: row.manifest?.title ?? row.plugin,
      defaultGatewayId: row.settings?.defaultGatewayId ?? null,
      allowedGatewayIds: row.settings?.allowedGatewayIds ?? [],
    })),
  };
};

export const updatePluginSettings = async (
  client: Db,
  actor: Actor,
  input: { plugin: string; defaultGatewayId: string | null; allowedGatewayIds: string[] },
) => {
  const current = (await listPluginSettings(client, actor)).data.find(
    (row) => row.plugin === input.plugin,
  );

  if (!current) throw notFound('Plugin taking payments');

  const allowed = [...new Set(input.allowedGatewayIds)];
  const wanted = [
    ...new Set([...allowed, ...(input.defaultGatewayId ? [input.defaultGatewayId] : [])]),
  ];
  const found = wanted.length
    ? await client
        .select({ id: paymentGateways.id })
        .from(paymentGateways)
        .where(and(eq(paymentGateways.orgId, actor.orgId), inArray(paymentGateways.id, wanted)))
    : [];

  if (found.length !== wanted.length) throw notFound('Gateway');
  if (input.defaultGatewayId && allowed.length && !allowed.includes(input.defaultGatewayId)) {
    throw new HttpError(
      400,
      'DEFAULT_NOT_ALLOWED',
      'The default gateway must be one of the allowed ones',
    );
  }

  await client
    .insert(paymentPluginSettings)
    .values({
      orgId: actor.orgId,
      plugin: input.plugin,
      defaultGatewayId: input.defaultGatewayId,
      allowedGatewayIds: allowed,
      updatedBy: actor.userId,
    })
    .onConflictDoUpdate({
      target: [paymentPluginSettings.orgId, paymentPluginSettings.plugin],
      set: {
        defaultGatewayId: input.defaultGatewayId,
        allowedGatewayIds: allowed,
        updatedBy: actor.userId,
        updatedAt: sql`now()`,
      },
    });
  await recordAudit(client, userCaller(actor), {
    action: 'payment.plugin_settings_updated',
    targetType: 'plugin',
    targetId: input.plugin,
    targetLabel: current.title,
    changes: {
      defaultGatewayId: { before: current.defaultGatewayId, after: input.defaultGatewayId },
      allowedGatewayIds: { before: current.allowedGatewayIds, after: allowed },
    } as never,
  });

  return { ...current, defaultGatewayId: input.defaultGatewayId, allowedGatewayIds: allowed };
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

/** Background check of pending invoices (callbacks can be lost). */
export const paymentCheckJob: JobDefinition = {
  queue: 'payment.check',
  atomic: true,
  async handle(job, tx) {
    const db = tx as Transaction;
    const { invoice } = await refresh(db, job.orgId, job.payload.invoiceId as string).catch(() => ({
      invoice: null,
    }));

    if (invoice?.status === 'pending')
      await queueCheck(db, invoice, Number(job.payload.round ?? 0) + 1);
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
      tx
        .select({ orgId: paymentInvoices.orgId })
        .from(paymentInvoices)
        .where(eq(paymentInvoices.id, id))
        .limit(1),
    );

    if (owner) await withOrg(owner.orgId, (tx) => refresh(tx, owner.orgId, id));

    res.status(200).json({ ok: true });
  })().catch((error: unknown) => {
    log.error('payment callback failed', { invoice: id, error });
    res.status(500).json({ error: 'try again' });
  });
});

import { GatewayConfig, gatewayTakes } from '@erxes/core-contract';
import {
  type Db,
  newId,
  paymentGateways,
  paymentInvoices,
  paymentPluginSettings,
} from '@erxes/core-db';
import { createGateway } from '@erxes/payment-gateways';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { type Actor, type Caller, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { seal, unseal } from '~/lib/secrets';
import { recordAudit } from '~/modules/audit/audit.service';

export type GatewayRow = typeof paymentGateways.$inferSelect;

const pluginSettingsOf = async (client: Db, caller: Caller) => {
  if (caller.actorType !== 'plugin') return null;

  const [settings] = await client
    .select()
    .from(paymentPluginSettings)
    .where(eq(paymentPluginSettings.plugin, caller.source))
    .limit(1);

  return settings ?? null;
};

/**
 * The gateway an invoice goes through: the one asked for, else the plugin's
 * default (Settings › Payments), else the first active one — within the
 * gateways the owner allowed the plugin, if any are listed, that take the
 * invoice's currency (QPay: MNT only).
 */
export const resolveGateway = async (
  client: Db,
  caller: Caller,
  currency: string,
  requested?: string,
) => {
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
        eq(paymentGateways.status, 'active'),
        requested
          ? eq(paymentGateways.id, requested)
          : allowed.length
            ? inArray(paymentGateways.id, allowed)
            : undefined,
      ),
    )
    .orderBy(paymentGateways.createdAt);

  if (!active.length) {
    throw new HttpError(
      400,
      'NO_GATEWAY',
      requested
        ? 'That gateway is not connected or is turned off'
        : 'Connect a payment gateway first (Settings › Payments)',
    );
  }

  const taking = active.filter((row) => gatewayTakes(row.kind, currency));

  const preferred = requested
    ? undefined
    : taking.find((row) => row.id === settings?.defaultGatewayId);

  const gateway = preferred ?? taking[0];

  if (!gateway) {
    throw new HttpError(
      400,
      'CURRENCY_NOT_SUPPORTED',
      requested
        ? `That gateway doesn't take ${currency}`
        : `No connected gateway takes ${currency} (Settings › Payments)`,
      { currency },
    );
  }

  return gateway;
};

const configOf = (row: GatewayRow) => GatewayConfig.parse(JSON.parse(unseal(row.configSealed)));

export const driverOf = (row: GatewayRow) => createGateway(configOf(row), { cacheKey: row.id });

/** What may be shown of a gateway's settings: never secrets. */
const visibleSettings = (settings: GatewayConfig) =>
  settings.kind === 'qpay'
    ? { invoiceCode: settings.invoiceCode, sandbox: settings.sandbox, clientId: settings.clientId }
    : {};

const toGatewayDto = (row: GatewayRow) => ({ ...row, settings: visibleSettings(configOf(row)) });

const gatewayOrThrow = async (client: Db, id: string) => {
  const [row] = await client
    .select()
    .from(paymentGateways)
    .where(eq(paymentGateways.id, id))
    .limit(1);

  if (!row) throw notFound('Gateway');

  return row;
};

const verifyGateway = async (id: string, settings: GatewayConfig) => {
  try {
    await createGateway(settings, { cacheKey: id }).verify();
  } catch (error) {
    throw new HttpError(
      400,
      'GATEWAY_REFUSED',
      `The gateway refused these credentials: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const listGateways = async (client: Db) => ({
  data: (
    await wholeList((limit) =>
      client.select().from(paymentGateways).orderBy(paymentGateways.createdAt).limit(limit),
    )
  ).map(toGatewayDto),
});

export const addGateway = async (
  client: Db,
  actor: Actor,
  input: { name: string; config: GatewayConfig },
) => {
  const id = newId();

  await verifyGateway(id, input.config);

  const row = oneRow(
    await client
      .insert(paymentGateways)
      .values({
        id,
        kind: input.config.kind,
        name: input.name,
        configSealed: seal(JSON.stringify(input.config)),
        createdBy: actor.userId,
      })
      .returning(),
  );

  await recordAudit(client, userCaller(actor), {
    action: 'payment.gateway_added',
    targetType: 'payment_gateway',
    targetId: id,
    targetLabel: input.name,
    metadata: { kind: input.config.kind, ...visibleSettings(input.config) },
  });

  return toGatewayDto(row);
};

export const updateGateway = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { name?: string; config?: GatewayConfig; status?: GatewayRow['status'] },
) => {
  const before = await gatewayOrThrow(client, id);

  if (input.config) {
    if (input.config.kind !== before.kind)
      throw new HttpError(400, 'KIND_CHANGED', 'Add a new gateway to change its kind');
    await verifyGateway(id, input.config);
  }

  const row = oneRow(
    await client
      .update(paymentGateways)
      .set({
        ...(input.name ? { name: input.name } : {}),
        ...(input.config ? { configSealed: seal(JSON.stringify(input.config)) } : {}),
        ...(input.status ? { status: input.status } : {}),
        updatedAt: sql`now()`,
      })
      .where(eq(paymentGateways.id, id))
      .returning(),
  );

  await recordAudit(client, userCaller(actor), {
    action: 'payment.gateway_updated',
    targetType: 'payment_gateway',
    targetId: id,
    targetLabel: row.name,
    metadata: { credentialsChanged: Boolean(input.config), status: input.status },
  });

  return toGatewayDto(row);
};

export const removeGateway = async (client: Db, actor: Actor, id: string) => {
  const row = await gatewayOrThrow(client, id);

  const [used] = await client
    .select({ id: paymentInvoices.id })
    .from(paymentInvoices)
    .where(eq(paymentInvoices.gatewayId, id))
    .limit(1);

  if (used) throw new HttpError(409, 'GATEWAY_IN_USE', 'It has invoices: turn it off instead');

  await client.delete(paymentGateways).where(eq(paymentGateways.id, id));
  // Plugins that used it go back to the organisation's other gateways.
  await client.update(paymentPluginSettings).set({
    allowedGatewayIds: sql`array_remove(${paymentPluginSettings.allowedGatewayIds}, ${id})`,
    defaultGatewayId: sql`nullif(${paymentPluginSettings.defaultGatewayId}, ${id})`,
  });
  await recordAudit(client, userCaller(actor), {
    action: 'payment.gateway_removed',
    targetType: 'payment_gateway',
    targetId: id,
    targetLabel: row.name,
  });

  return { ok: true as const };
};

import { GatewayConfig, type PaymentGateway } from '@erxes/core-contract';
import {
  type Db,
  newId,
  paymentGateways,
  paymentInvoices,
  paymentPluginSettings,
} from '@erxes/core-db';
import { createGateway } from '@erxes/payment-gateways';
import { and, eq, sql } from 'drizzle-orm';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { seal, unseal } from '~/lib/secrets';
import { recordAudit } from '~/modules/audit/audit.service';

export type GatewayRow = typeof paymentGateways.$inferSelect;

const configOf = (row: GatewayRow) => GatewayConfig.parse(JSON.parse(unseal(row.configSealed)));

export const driverOf = (row: GatewayRow) => createGateway(configOf(row), { cacheKey: row.id });

/** What may be shown of a gateway's settings: never secrets. */
const visibleSettings = (settings: GatewayConfig) =>
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

const gatewayOrThrow = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(paymentGateways)
    .where(and(eq(paymentGateways.orgId, orgId), eq(paymentGateways.id, id)))
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

  const row = oneRow(
    await client
      .insert(paymentGateways)
      .values({
        id,
        orgId: actor.orgId,
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
  input: { name?: string; config?: GatewayConfig; status?: 'active' | 'disabled' },
) => {
  const before = await gatewayOrThrow(client, actor.orgId, id);

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

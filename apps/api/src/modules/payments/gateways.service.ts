import { GatewayConfig, gatewayTakes, visibleGatewaySettings } from '@erxes/core-contract';
import {
  caller,
  type Db,
  newId,
  paymentGateways,
  paymentInvoices,
  paymentPluginSettings,
  secrets,
} from '@erxes/core-db';
import { createGateway } from '@erxes/payment-gateways';
import { and, eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { fail, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { openSecret, saveSecret, type WithSecret } from '~/modules/secrets/vault';

type GatewayRecord = typeof paymentGateways.$inferSelect;

export type GatewayRow = WithSecret<GatewayRecord>;

const gatewaysWithSecret = (client: Db) =>
  client
    .select({ ...getTableColumns(paymentGateways), secret: secrets })
    .from(paymentGateways)
    .innerJoin(secrets, eq(secrets.id, paymentGateways.configSecretId));

/** The calling plugin's payment settings; members have none. */
const pluginSettingsOf = async (client: Db) => {
  const who = caller();

  if (who.type !== 'plugin') return null;

  const [settings] = await client
    .select()
    .from(paymentPluginSettings)
    .where(eq(paymentPluginSettings.plugin, who.plugin))
    .limit(1);

  return settings ?? null;
};

/**
 * The gateway an invoice goes through: the one asked for, else the plugin's
 * default (Settings › Payments), else the first active one — within the
 * gateways the owner allowed the plugin, if any are listed, that take the
 * invoice's currency (QPay: MNT only).
 */
export const resolveGateway = async (client: Db, currency: string, requested?: string) => {
  const settings = await pluginSettingsOf(client);
  const allowed = settings?.allowedGatewayIds ?? [];

  if (requested && allowed.length && !allowed.includes(requested)) {
    throw fail('GATEWAY_NOT_ALLOWED', 'This plugin may not use that gateway (Settings › Payments)');
  }

  const active = await gatewaysWithSecret(client)
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
    throw fail(
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
    throw fail(
      'CURRENCY_NOT_SUPPORTED',
      requested
        ? `That gateway doesn't take ${currency}`
        : `No connected gateway takes ${currency} (Settings › Payments)`,
      { currency },
    );
  }

  return gateway;
};

const configOf = (row: GatewayRow) => GatewayConfig.parse(JSON.parse(openSecret(row.secret)));

export const driverOf = (row: GatewayRow) => createGateway(configOf(row), { cacheKey: row.id });

const withVisibleSettings = (row: GatewayRecord, settings: GatewayConfig) => ({
  ...row,
  settings: visibleGatewaySettings(settings),
});

const gatewayOrThrow = async (client: Db, id: string) => {
  const [row] = await gatewaysWithSecret(client).where(eq(paymentGateways.id, id)).limit(1);

  if (!row) throw notFound('Gateway');

  return row;
};

const verifyGateway = async (id: string, settings: GatewayConfig) => {
  try {
    await createGateway(settings, { cacheKey: id }).verify();
  } catch (error) {
    throw fail(
      'GATEWAY_REFUSED',
      `The gateway refused these credentials: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const listGateways = async (client: Db) => ({
  data: (
    await wholeList((limit) =>
      gatewaysWithSecret(client).orderBy(paymentGateways.createdAt).limit(limit),
    )
  ).map((row) => withVisibleSettings(row, configOf(row))),
});

export const addGateway = async (client: Db, input: { name: string; config: GatewayConfig }) => {
  const id = newId();

  await verifyGateway(id, input.config);

  const row = oneRow(
    await client
      .insert(paymentGateways)
      .values({
        id,
        kind: input.config.kind,
        name: input.name,
        configSecretId: await saveSecret(client, JSON.stringify(input.config)),
        createdBy: caller('user').userId,
      })
      .returning(),
  );

  await recordAudit(client, {
    action: 'payment.gateway_added',
    targetType: 'payment_gateway',
    targetId: id,
    targetLabel: input.name,
    metadata: { kind: input.config.kind, ...visibleGatewaySettings(input.config) },
  });

  return withVisibleSettings(row, input.config);
};

export const updateGateway = async (
  client: Db,
  id: string,
  input: { name?: string; config?: GatewayConfig; status?: GatewayRow['status'] },
) => {
  const before = await gatewayOrThrow(client, id);

  if (input.config) {
    if (input.config.kind !== before.kind)
      throw fail('KIND_CHANGED', 'Add a new gateway to change its kind');
    await verifyGateway(id, input.config);
    await saveSecret(client, JSON.stringify(input.config), before.configSecretId);
  }

  const row = oneRow(
    await client
      .update(paymentGateways)
      .set({
        name: input.name,
        status: input.status,
        updatedAt: sql`now()`,
      })
      .where(eq(paymentGateways.id, id))
      .returning(),
  );

  await recordAudit(client, {
    action: 'payment.gateway_updated',
    targetType: 'payment_gateway',
    targetId: id,
    targetLabel: row.name,
    metadata: { credentialsChanged: Boolean(input.config), status: input.status },
  });

  return withVisibleSettings(row, input.config ?? configOf(before));
};

export const removeGateway = async (client: Db, id: string) => {
  const row = await gatewayOrThrow(client, id);

  const [used] = await client
    .select({ id: paymentInvoices.id })
    .from(paymentInvoices)
    .where(eq(paymentInvoices.gatewayId, id))
    .limit(1);

  if (used) throw fail('GATEWAY_IN_USE', 'It has invoices: turn it off instead');

  await client.delete(paymentGateways).where(eq(paymentGateways.id, id));
  // Plugins that used it go back to the organisation's other gateways.
  await client.update(paymentPluginSettings).set({
    allowedGatewayIds: sql`array_remove(${paymentPluginSettings.allowedGatewayIds}, ${id})`,
    defaultGatewayId: sql`nullif(${paymentPluginSettings.defaultGatewayId}, ${id})`,
  });
  await recordAudit(client, {
    action: 'payment.gateway_removed',
    targetType: 'payment_gateway',
    targetId: id,
    targetLabel: row.name,
  });

  return { ok: true as const };
};

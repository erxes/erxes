import {
  type Db,
  integrationConnections,
  organizations,
  paymentInvoices,
  pluginInstallations,
  plugins,
  withOrg,
} from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import {
  clientOf,
  type ConnectionRow,
  connectionsWithSecret,
  listConnections,
} from '~/modules/integrations/connections';
import { quickQrDistricts } from '~/modules/integrations/gateways/quickqr';
import { gatewayOf, PAYMENT_KEYS } from '~/modules/integrations/registry';
import { getOrganization } from '~/modules/organizations/organizations.service';

export type GatewayRow = ConnectionRow;

const takes = (key: string, currency: string) => {
  const { currencies } = gatewayOf(key).payments;

  return currencies.length === 0 || currencies.includes(currency);
};

const activeGateway = (id?: string) =>
  and(
    eq(integrationConnections.status, 'active'),
    inArray(integrationConnections.key, PAYMENT_KEYS),
    id ? eq(integrationConnections.id, id) : undefined,
  );

/**
 * The gateway an invoice goes through: the one asked for, else the
 * organisation's default (Settings › Payments), else the oldest active one,
 * of those that take the invoice's currency (QPay: MNT only).
 */
export const resolveGateway = async (client: Db, currency: string, requested?: string) => {
  const active = await connectionsWithSecret(client)
    .where(activeGateway(requested))
    .orderBy(integrationConnections.createdAt);

  if (!active.length) {
    throw fail(
      'NO_GATEWAY',
      requested
        ? 'That gateway is not connected or is turned off'
        : 'Connect a payment gateway first (Settings › Integrations)',
    );
  }

  const taking = active.filter((row) => takes(row.key, currency));

  const preferred = requested ? null : (await getOrganization(client)).defaultGatewayId;
  const gateway = taking.find((row) => row.id === preferred) ?? taking[0];

  if (!gateway) {
    throw fail(
      'CURRENCY_NOT_SUPPORTED',
      requested
        ? `That gateway doesn't take ${currency}`
        : `No connected gateway takes ${currency} (Settings › Integrations)`,
      { currency },
    );
  }

  return gateway;
};

/** The gateway and its client; a transfer gateway's bank connection is read in the gateway's organisation. */
export const gatewayAt = async (row: GatewayRow) => {
  const gateway = gatewayOf(row.key);

  return {
    payments: gateway.payments,
    client: await withOrg(row.orgId, (tx) => clientOf(tx, gateway, row)),
  };
};

export const listGateways = (client: Db) => listConnections(client, PAYMENT_KEYS);

/** The installed plugins that may create invoices (`payments:write`), by title. */
export const payingPlugins = async (client: Db) =>
  (
    await wholeList((limit) =>
      client
        .select({
          title: sql<string>`coalesce(${plugins.manifest} ->> 'title', ${pluginInstallations.plugin})`,
        })
        .from(pluginInstallations)
        .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
        .where(sql`'payments:write' = any(${pluginInstallations.grantedScopes})`)
        .orderBy(pluginInstallations.plugin)
        .limit(limit),
    )
  ).map((row) => row.title);

/** QPay QuickQR's districts of a city, for a merchant's address. */
export const listQuickQrDistricts = async (city: string) => {
  try {
    return { data: await quickQrDistricts(city, { quickQr: config.quickQr }) };
  } catch (error) {
    throw fail('GATEWAY_REFUSED', error instanceof Error ? error.message : String(error));
  }
};

export const releaseGateway = async (client: Db, id: string) => {
  const [used] = await client
    .select({ id: paymentInvoices.id })
    .from(paymentInvoices)
    .where(eq(paymentInvoices.gatewayId, id))
    .limit(1);

  if (used) throw fail('GATEWAY_IN_USE', 'It has invoices: turn it off instead');

  await client
    .update(organizations)
    .set({ defaultGatewayId: null })
    .where(eq(organizations.defaultGatewayId, id));
};

export const paymentSettings = (client: Db) => getOrganization(client);

export const savePaymentSettings = async (
  client: Db,
  input: { defaultGatewayId: string | null },
) => {
  const before = await getOrganization(client);

  const [gateway] = input.defaultGatewayId
    ? await client
        .select({ name: integrationConnections.name })
        .from(integrationConnections)
        .where(activeGateway(input.defaultGatewayId))
        .limit(1)
    : [];

  if (input.defaultGatewayId && !gateway) {
    throw fail('NO_GATEWAY', 'That gateway is not connected or is turned off');
  }

  const row = oneRow(
    await client
      .update(organizations)
      .set({ defaultGatewayId: input.defaultGatewayId, updatedAt: sql`now()` })
      .returning(),
  );

  await recordAudit(client, {
    action: 'payment.default_gateway_changed',
    targetType: 'organization',
    targetId: row.id,
    targetLabel: gateway?.name ?? null,
    changes: { defaultGatewayId: [before.defaultGatewayId, row.defaultGatewayId] },
  });

  return row;
};

import {
  caller,
  type Db,
  withOrg,
  integrationConnections,
  paymentInvoices,
  paymentPluginSettings,
} from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { quickQrDistricts } from '~/modules/integrations/gateways/quickqr';
import {
  type ConnectionRow,
  connectionsWithSecret,
  keysOf,
  listConnections,
} from '~/modules/integrations/connections';
import { driverOptions } from '~/modules/integrations/options';
import { gatewayOf, PAYMENT_KEYS } from '~/modules/integrations/registry';

export type GatewayRow = ConnectionRow;

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

const takes = (key: string, currency: string) => {
  const { currencies } = gatewayOf(key).payments;

  return currencies.length === 0 || currencies.includes(currency);
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

  const active = await connectionsWithSecret(client)
    .where(
      and(
        eq(integrationConnections.status, 'active'),
        inArray(integrationConnections.key, PAYMENT_KEYS),
        requested
          ? eq(integrationConnections.id, requested)
          : allowed.length
            ? inArray(integrationConnections.id, allowed)
            : undefined,
      ),
    )
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

  const preferred = requested
    ? undefined
    : taking.find((row) => row.id === settings?.defaultGatewayId);

  const gateway = preferred ?? taking[0];

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

/** The gateway's driver; a transfer gateway's bank connection is read in the gateway's organisation. */
export const driverOf = async (row: GatewayRow) => {
  const gateway = gatewayOf(row.key);
  const keys = keysOf(gateway, row);
  const options = await withOrg(row.orgId, (tx) => driverOptions(tx, gateway, row.id, keys));

  return gateway.payments.driver(keys, options);
};

export const listGateways = (client: Db) => listConnections(client, PAYMENT_KEYS);

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

  // Plugins that used it go back to the organisation's other gateways.
  await client.update(paymentPluginSettings).set({
    allowedGatewayIds: sql`array_remove(${paymentPluginSettings.allowedGatewayIds}, ${id})`,
    defaultGatewayId: sql`nullif(${paymentPluginSettings.defaultGatewayId}, ${id})`,
  });
};

import {
  caller,
  type Db,
  paymentGateways,
  paymentPluginSettings,
  pluginInstallations,
  plugins,
} from '@erxes/core-db';
import { and, eq, inArray, type SQL, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { HttpError, notFound } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';

/** Installed plugins that may create invoices (`payments:write`), with their settings (none yet: any gateway). */
const selectPluginSettings = (client: Db, where?: SQL) =>
  client
    .select({
      plugin: pluginInstallations.plugin,
      title: sql<string>`coalesce(${plugins.manifest} ->> 'title', ${pluginInstallations.plugin})`,
      defaultGatewayId: paymentPluginSettings.defaultGatewayId,
      allowedGatewayIds: sql<string[]>`coalesce(${paymentPluginSettings.allowedGatewayIds}, '{}')`,
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
    .where(and(sql`'payments:write' = any(${pluginInstallations.grantedScopes})`, where));

export const listPluginSettings = async (client: Db) => ({
  data: await wholeList((limit) =>
    selectPluginSettings(client).orderBy(pluginInstallations.plugin).limit(limit),
  ),
});

const pluginSettingsOf = async (client: Db, plugin: string) => {
  const [row] = await selectPluginSettings(client, eq(pluginInstallations.plugin, plugin)).limit(1);

  if (!row) throw notFound('Plugin taking payments');

  return row;
};

/** Every gateway named must be one of the organisation's, and the default one of the allowed. */
const checkGateways = async (client: Db, allowed: string[], fallback: string | null) => {
  const wanted = [...new Set([...allowed, ...(fallback ? [fallback] : [])])];

  const found = wanted.length
    ? await client
        .select({ id: paymentGateways.id })
        .from(paymentGateways)
        .where(inArray(paymentGateways.id, wanted))
    : [];

  if (found.length !== wanted.length) throw notFound('Gateway');

  if (fallback && allowed.length && !allowed.includes(fallback)) {
    throw new HttpError(
      400,
      'DEFAULT_NOT_ALLOWED',
      'The default gateway must be one of the allowed ones',
    );
  }
};

export const updatePluginSettings = async (
  client: Db,
  input: { plugin: string; defaultGatewayId: string | null; allowedGatewayIds: string[] },
) => {
  const me = caller('user');

  const current = await pluginSettingsOf(client, input.plugin);
  const allowed = [...new Set(input.allowedGatewayIds)];

  await checkGateways(client, allowed, input.defaultGatewayId);
  await client
    .insert(paymentPluginSettings)
    .values({
      plugin: input.plugin,
      defaultGatewayId: input.defaultGatewayId,
      allowedGatewayIds: allowed,
      updatedBy: me.userId,
    })
    .onConflictDoUpdate({
      target: [paymentPluginSettings.orgId, paymentPluginSettings.plugin],
      set: {
        defaultGatewayId: input.defaultGatewayId,
        allowedGatewayIds: allowed,
        updatedBy: me.userId,
        updatedAt: sql`now()`,
      },
    });
  await recordAudit(client, {
    action: 'payment.plugin_settings_updated',
    targetType: 'plugin',
    targetId: input.plugin,
    targetLabel: current.title,
    changes: {
      defaultGatewayId: [current.defaultGatewayId, input.defaultGatewayId],
      allowedGatewayIds: [current.allowedGatewayIds, allowed],
    },
  });

  return pluginSettingsOf(client, input.plugin);
};

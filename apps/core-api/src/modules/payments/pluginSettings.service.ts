import type { PluginPaymentSettings } from '@erxes/core-contract';
import {
  caller,
  type Db,
  paymentGateways,
  paymentPluginSettings,
  pluginInstallations,
  plugins,
} from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { HttpError, notFound } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';

/** Installed plugins that may create invoices (`payments:write`), with their settings. */
export const listPluginSettings = async (
  client: Db,
): Promise<{ data: PluginPaymentSettings[] }> => {
  const rows = await wholeList((limit) =>
    client
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
      .where(sql`'payments:write' = any(${pluginInstallations.grantedScopes})`)
      .orderBy(pluginInstallations.plugin)
      .limit(limit),
  );

  return {
    data: rows.map((row) => ({
      plugin: row.plugin,
      title: row.manifest?.title ?? row.plugin,
      defaultGatewayId: row.settings?.defaultGatewayId ?? null,
      allowedGatewayIds: row.settings?.allowedGatewayIds ?? [],
    })),
  };
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

  const current = (await listPluginSettings(client)).data.find(
    (row) => row.plugin === input.plugin,
  );

  if (!current) throw notFound('Plugin taking payments');

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

  return { ...current, defaultGatewayId: input.defaultGatewayId, allowedGatewayIds: allowed };
};

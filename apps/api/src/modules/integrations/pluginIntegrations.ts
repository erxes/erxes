import { caller, type Db, pluginIntegrationStates } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { callerCan } from '~/http/access';
import { notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { installedPlugin, installedPlugins } from '~/modules/plugins/installedPlugin';

const NOT_SET_UP = { state: 'not-set-up', count: null } as const;

/**
 * The integrations the manifests of the plugins installed here declare, with the state each
 * reported, for a member with `integrations.manage` and the integration's own permission.
 */
export const pluginIntegrations = async (client: Db) => {
  if (!callerCan('integrations.manage')) return [];

  const installed = await installedPlugins(client);
  const states = await client.select().from(pluginIntegrationStates);

  const stateOf = (plugin: string, key: string) =>
    states.find((row) => row.plugin === plugin && row.key === key) ?? NOT_SET_UP;

  return installed.flatMap(({ name, manifest }) =>
    (manifest?.integrations ?? [])
      .filter((integration) => callerCan(integration.permission))
      .map((integration) => ({
        ...integration,
        plugin: name,
        countries: integration.countries ?? [],
        dashboard: null,
        keyed: false,
        fields: [],
        payments: null,
        sms: false,
        oauth: null,
        status: stateOf(name, integration.key),
        actions: (manifest?.actions ?? [])
          .filter((action) => action.integration === integration.key)
          .map(({ type, label, description }) => ({
            type,
            label,
            description: description ?? null,
          })),
      })),
  );
};

/** Saves the state the calling plugin reports for one of its manifest's integrations. */
export const reportIntegrationState = async (
  client: Db,
  input: Pick<typeof pluginIntegrationStates.$inferInsert, 'key' | 'state' | 'count'>,
) => {
  const { plugin } = caller('plugin');
  const declared = (await installedPlugin(client, plugin))?.manifest?.integrations ?? [];

  if (!declared.some((integration) => integration.key === input.key)) {
    throw notFound('Integration');
  }

  const reported = { state: input.state, count: input.count ?? null };

  return oneRow(
    await client
      .insert(pluginIntegrationStates)
      .values({ plugin, key: input.key, ...reported })
      .onConflictDoUpdate({
        target: [
          pluginIntegrationStates.orgId,
          pluginIntegrationStates.plugin,
          pluginIntegrationStates.key,
        ],
        set: { ...reported, updatedAt: sql`now()` },
      })
      .returning(),
  );
};

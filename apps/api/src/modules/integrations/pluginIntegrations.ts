import type { IntegrationStatus } from '@erxes/core-contract';
import { caller, type Db, integrationConnections, newId } from '@erxes/core-db';
import { and, eq, inArray, isNotNull, sql, type SQL } from 'drizzle-orm';
import { callerCan } from '~/http/access';
import { notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { installedPlugin, installedPlugins } from '~/modules/plugins/installedPlugin';
import { readSecretAs, saveSecretAs } from '~/modules/secrets/vault';

type Connection = typeof integrationConnections.$inferSelect;

const pairOf = (plugin: string, key: string) => `${plugin}.${key}`;

const statusOf = (rows: Pick<Connection, 'status'>[]): IntegrationStatus => {
  if (!rows.length) return { state: 'not-set-up', count: null };

  const state = rows.some((row) => row.status === 'attention') ? 'attention' : 'connected';

  return { state, count: rows.length };
};

/**
 * The integrations the manifests of the plugins installed here declare, with the state their
 * connections give them, for a member with `integrations.manage` and the integration's own
 * permission.
 */
export const pluginIntegrations = async (client: Db) => {
  if (!callerCan('integrations.manage')) return [];

  const installed = await installedPlugins(client);

  const connections = await client
    .select({
      plugin: integrationConnections.plugin,
      key: integrationConnections.key,
      status: integrationConnections.status,
    })
    .from(integrationConnections)
    .where(isNotNull(integrationConnections.plugin));

  return installed.flatMap(({ name, manifest }) =>
    (manifest?.integrations ?? [])
      .filter((integration) => callerCan(integration.permission))
      .map((integration) => ({
        ...integration,
        plugin: name,
        pluginTitle: manifest?.title ?? name,
        countries: integration.countries ?? [],
        dashboard: null,
        keyed: false,
        fields: [],
        payments: null,
        status: statusOf(
          connections.filter((row) => row.plugin === name && row.key === integration.key),
        ),
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

export const pluginConnectionsOf = async (
  client: Db,
  only: { plugin?: string; key?: string } = {},
) => {
  const titles = new Map(
    (await pluginIntegrations(client))
      .filter(
        (integration) =>
          (!only.plugin || integration.plugin === only.plugin) &&
          (!only.key || integration.key === only.key),
      )
      .map((integration) => [pairOf(integration.plugin, integration.key), integration.pluginTitle]),
  );

  if (!titles.size) return [];

  const rows = await wholeList((limit) =>
    client
      .select()
      .from(integrationConnections)
      .where(
        and(
          isNotNull(integrationConnections.plugin),
          inArray(sql`${integrationConnections.plugin} || '.' || ${integrationConnections.key}`, [
            ...titles.keys(),
          ]),
        ),
      )
      .orderBy(integrationConnections.createdAt)
      .limit(limit),
  );

  return rows.flatMap((row) => {
    const title = row.plugin && titles.get(pairOf(row.plugin, row.key));

    return title ? [{ ...row, settings: {}, usedBy: [title] }] : [];
  });
};

export const removePluginConnection = async (
  client: Db,
  input: { plugin: string; key: string; id: string },
) => {
  const [visible] = await pluginConnectionsOf(client, input).then((rows) =>
    rows.filter((row) => row.id === input.id),
  );

  if (!visible) throw notFound('Connection');

  await client.delete(integrationConnections).where(eq(integrationConnections.id, input.id));
  await recordAudit(client, {
    action: 'integration.removed',
    targetType: 'integration_connection',
    targetId: input.id,
    targetLabel: visible.name,
    metadata: { plugin: input.plugin, key: input.key },
  });
  await publishCoreEvents(client, {
    type: 'core.integration.connection.removed',
    entityType: 'integration_connection',
    entityId: input.id,
    payload: { plugin: input.plugin, key: input.key, id: input.id, name: visible.name },
  });

  return { ok: true as const };
};

const callingPlugin = () => caller('plugin').plugin;

const own = (id: string, ...more: (SQL | undefined)[]) =>
  and(
    eq(integrationConnections.id, id),
    eq(integrationConnections.plugin, callingPlugin()),
    ...more,
  );

const ownedOrThrow = (rows: Connection[]) => {
  const [row] = rows;

  if (!row) throw notFound('Connection');

  return row;
};

export const savePluginSecret = async (
  client: Db,
  input: { key: string; name: string; value: string },
) => {
  const plugin = callingPlugin();
  const declared = (await installedPlugin(client, plugin))?.manifest?.integrations ?? [];

  if (!declared.some((integration) => integration.key === input.key)) {
    throw notFound('Integration');
  }

  const row = oneRow(
    await client
      .insert(integrationConnections)
      .values({
        id: newId(),
        plugin,
        key: input.key,
        name: input.name,
        secretId: await saveSecretAs(client, plugin, input.value),
      })
      .returning(),
  );

  await recordAudit(client, {
    action: 'integration.connected',
    targetType: 'integration_connection',
    targetId: row.id,
    targetLabel: row.name,
    metadata: { plugin, key: row.key },
  });

  return row;
};

export const listPluginSecrets = async (client: Db, key?: string) => ({
  data: await wholeList((limit) =>
    client
      .select()
      .from(integrationConnections)
      .where(
        and(
          eq(integrationConnections.plugin, callingPlugin()),
          key ? eq(integrationConnections.key, key) : undefined,
        ),
      )
      .orderBy(integrationConnections.createdAt)
      .limit(limit),
  ),
});

export const readPluginSecret = async (client: Db, id: string) => {
  const row = ownedOrThrow(await client.select().from(integrationConnections).where(own(id)));

  return { value: await readSecretAs(client, callingPlugin(), row.secretId) };
};

export const replacePluginSecret = async (
  client: Db,
  input: { id: string; name?: string; value?: string },
) => {
  const before = ownedOrThrow(
    await client.select().from(integrationConnections).where(own(input.id)),
  );

  if (input.value !== undefined) {
    await saveSecretAs(client, callingPlugin(), input.value, before.secretId);
  }

  const fixed = input.value === undefined ? {} : { status: 'active' as const, problem: null };

  return ownedOrThrow(
    await client
      .update(integrationConnections)
      .set({ name: input.name, ...fixed, updatedAt: sql`now()` })
      .where(own(input.id))
      .returning(),
  );
};

export const markPluginSecret = async (client: Db, input: { id: string; problem: string | null }) =>
  ownedOrThrow(
    await client
      .update(integrationConnections)
      .set({
        status: input.problem ? 'attention' : 'active',
        problem: input.problem,
        updatedAt: sql`now()`,
      })
      .where(own(input.id))
      .returning(),
  );

export const removePluginSecret = async (client: Db, id: string) => {
  const row = ownedOrThrow(await client.delete(integrationConnections).where(own(id)).returning());

  await recordAudit(client, {
    action: 'integration.removed',
    targetType: 'integration_connection',
    targetId: row.id,
    targetLabel: row.name,
    metadata: { plugin: row.plugin, key: row.key },
  });

  return { ok: true as const };
};

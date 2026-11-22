import { type Db, integrationConnections, secrets } from '@erxes/core-db';
import { eq, getTableColumns, inArray } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { openSecret, type WithSecret } from '~/modules/secrets/vault';
import { fieldsOf, type KeyedIntegration, type Keys } from './define';
import { keyedOf } from './registry';

export type ConnectionRow = WithSecret<typeof integrationConnections.$inferSelect>;

export const connectionsWithSecret = (client: Db) =>
  client
    .select({ ...getTableColumns(integrationConnections), secret: secrets })
    .from(integrationConnections)
    .innerJoin(secrets, eq(secrets.id, integrationConnections.secretId));

export const keysOf = (integration: KeyedIntegration, row: ConnectionRow) =>
  integration.keys.parse(JSON.parse(openSecret(row.secret)));

/** The integration's client for the connection's keys. */
export const clientOf = <C>(integration: KeyedIntegration<Keys, C>, row: ConnectionRow) =>
  integration.client(keysOf(integration, row), { cacheKey: row.id });

export const visibleSettings = (integration: KeyedIntegration, keys: Record<string, unknown>) =>
  Object.fromEntries(
    fieldsOf(integration.keys).flatMap((field) =>
      field.type === 'secret' ? [] : [[field.key, keys[field.key]]],
    ),
  );

export const withSettings = <Row extends Pick<ConnectionRow, 'key'>>(
  row: Row,
  keys: Record<string, unknown>,
) => ({ ...row, settings: visibleSettings(keyedOf(row.key), keys) });

const shown = (row: ConnectionRow) => withSettings(row, keysOf(keyedOf(row.key), row));

export const listConnections = async (client: Db, keys: string[]) => ({
  data: (
    await wholeList((limit) =>
      connectionsWithSecret(client)
        .where(inArray(integrationConnections.key, keys))
        .orderBy(integrationConnections.createdAt)
        .limit(limit),
    )
  ).map(shown),
});

import { connectionUseScope } from '@erxes/core-contract';
import { caller, type Db, integrationConnections } from '@erxes/core-db';
import { oauthKeys } from '@erxes/plugin-sdk/integrations';
import { and, asc, eq } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { connectionsWithSecret } from './connections';
import { appClientOf, freshKeys } from './oauth';
import { keyedOf } from './registry';
import { withinReach } from './scopes';

// Plugins use the organisation's connections of core's integrations (decision 52): the
// organisation connects an account once, and every plugin the owner approved uses it.

/** 403 SCOPE_REQUIRED unless the owner approved the calling plugin's use of `key`'s connections. */
const assertUses = (key: string) => {
  if (!caller('plugin').scopes.includes(connectionUseScope(key))) {
    throw fail(
      'SCOPE_REQUIRED',
      `The plugin may not use ${key} connections: name it in the manifest's connections and have the owner approve it`,
    );
  }
};

/** The organisation's active connections of an integration the calling plugin may use. */
export const usableConnections = async (client: Db, key: string) => {
  assertUses(key);

  return {
    data: await wholeList((limit) =>
      client
        .select()
        .from(integrationConnections)
        .where(
          withinReach(
            and(eq(integrationConnections.key, key), eq(integrationConnections.status, 'active')),
          ),
        )
        .orderBy(asc(integrationConnections.createdAt), asc(integrationConnections.id))
        .limit(limit),
    ),
  };
};

/**
 * A fresh token of a connection the calling plugin may use (renewed first when it is about to
 * expire), and the app it signed in through, whose secret checks the service's webhooks.
 */
export const connectionCredentials = async (client: Db, id: string) => {
  const [row] = await connectionsWithSecret(
    client,
    and(eq(integrationConnections.id, id), eq(integrationConnections.status, 'active')),
  ).limit(1);

  if (!row) throw notFound('Connection');

  assertUses(row.key);

  const integration = keyedOf(row.key);

  if (!integration.oauth) {
    throw fail('NOT_CONNECTED', `${integration.name} signs in without OAuth: it has no token`);
  }

  const keys = oauthKeys.parse(await freshKeys(client, integration, row));
  const app = await appClientOf(client, row.key);

  return {
    connectionId: row.id,
    key: row.key,
    accessToken: keys.accessToken,
    expiresAt: keys.expiresAt ?? null,
    account: keys.account ?? null,
    appId: app?.clientId ?? null,
    appSecret: app?.clientSecret ?? null,
  };
};

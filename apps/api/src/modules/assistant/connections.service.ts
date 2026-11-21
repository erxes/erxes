import type { AssistantProvider } from '@erxes/core-contract';
import { assistantConnections, type Db, newId, requestOrgId, secrets } from '@erxes/core-db';
import { asc, eq, getTableColumns, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
import { openSecret, saveSecret, type SecretRow, type WithSecret } from '~/modules/secrets/vault';
import { unreadableKey } from './providers';

type ConnectionRow = WithSecret<typeof assistantConnections.$inferSelect>;

export const openKey = (secret: SecretRow) => {
  try {
    return openSecret(secret);
  } catch {
    return null;
  }
};

const orgRows = (client: Db) =>
  wholeList((limit) =>
    client
      .select({ ...getTableColumns(assistantConnections), secret: secrets })
      .from(assistantConnections)
      .innerJoin(secrets, eq(secrets.id, assistantConnections.keySecretId))
      .orderBy(asc(assistantConnections.createdAt), asc(assistantConnections.id))
      .limit(limit),
  );

const effectiveDefault = (rows: ConnectionRow[]) => rows.find((row) => row.isDefault) ?? rows[0];

const present = (rows: ConnectionRow[]) => {
  const chosen = effectiveDefault(rows);

  return rows.map((row) => ({
    ...row,
    isDefault: row === chosen,
    hasKey: openKey(row.secret) !== null,
  }));
};

/** The organisation's keys, which every agent uses. */
export const listConnections = async (client: Db) => ({ data: present(await orgRows(client)) });

const lockKeysOfOrg = (client: Db) => lockKeys(client, [`assistant-connections:${requestOrgId()}`]);

export const saveConnection = async (client: Db, provider: AssistantProvider, apiKey: string) => {
  await lockKeysOfOrg(client);

  const [before] = await client
    .select({ keySecretId: assistantConnections.keySecretId })
    .from(assistantConnections)
    .where(eq(assistantConnections.provider, provider))
    .limit(1);

  const keySecretId = await saveSecret(client, apiKey, before?.keySecretId);

  await client
    .insert(assistantConnections)
    .values({ id: newId(), provider, keySecretId })
    .onConflictDoUpdate({
      target: [assistantConnections.orgId, assistantConnections.provider],
      set: { keySecretId, updatedAt: sql`now()` },
    });

  const rows = present(await orgRows(client));
  const saved = rows.find((row) => row.provider === provider);

  if (!saved) throw notFound('Connection');

  return saved;
};

export const removeConnection = async (client: Db, provider: AssistantProvider) => {
  const removed = await client
    .delete(assistantConnections)
    .where(eq(assistantConnections.provider, provider))
    .returning({ id: assistantConnections.id });

  if (!removed.length) throw notFound('Connection');

  return { ok: true as const };
};

export const setDefaultProvider = async (client: Db, provider: AssistantProvider | null) => {
  await lockKeysOfOrg(client);

  const rows = await orgRows(client);

  if (provider && !rows.some((row) => row.provider === provider)) throw notFound('Connection');

  await client
    .update(assistantConnections)
    .set({ isDefault: false })
    .where(eq(assistantConnections.isDefault, true));

  if (provider) {
    await client
      .update(assistantConnections)
      .set({ isDefault: true })
      .where(eq(assistantConnections.provider, provider));
  }

  return listConnections(client);
};

export const findConnection = async (client: Db, provider?: AssistantProvider) => {
  const rows = await orgRows(client);

  return provider ? rows.find((row) => row.provider === provider) : effectiveDefault(rows);
};

/** The organisation's key for `provider`, or its default one, opened; fails when there is none. */
export const usableKey = async (client: Db, provider?: AssistantProvider) => {
  const connection = await findConnection(client, provider);

  if (!connection) {
    throw fail(
      'ASSISTANT_NO_CONNECTION',
      'An admin has to add a model provider key in Settings to use the assistant',
    );
  }

  const apiKey = openKey(connection.secret);

  if (apiKey === null) throw fail('ASSISTANT_KEY_UNREADABLE', unreadableKey(connection.provider));

  return { provider: connection.provider, apiKey };
};

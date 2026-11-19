import type { AssistantProvider } from '@erxes/core-contract';
import { assistantConnections, type Db, newId, requestOrgId } from '@erxes/core-db';
import { asc, eq, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
import { seal, unseal } from '~/lib/secrets';

type ConnectionRow = typeof assistantConnections.$inferSelect;

export const openKey = (sealed: string) => {
  try {
    return unseal(sealed);
  } catch {
    return null;
  }
};

const orgRows = (client: Db) =>
  wholeList((limit) =>
    client
      .select()
      .from(assistantConnections)
      .orderBy(asc(assistantConnections.createdAt), asc(assistantConnections.id))
      .limit(limit),
  );

const effectiveDefault = (rows: ConnectionRow[]) => rows.find((row) => row.isDefault) ?? rows[0];

const present = (rows: ConnectionRow[]) => {
  const chosen = effectiveDefault(rows);

  return rows.map((row) => ({
    ...row,
    isDefault: row === chosen,
    hasKey: openKey(row.sealedKey) !== null,
  }));
};

/** The organisation's keys, which every agent uses. */
export const listConnections = async (client: Db) => ({ data: present(await orgRows(client)) });

const lockKeysOfOrg = (client: Db) => lockKeys(client, [`assistant-connections:${requestOrgId()}`]);

export const saveConnection = async (client: Db, provider: AssistantProvider, apiKey: string) => {
  const sealedKey = seal(apiKey);

  await lockKeysOfOrg(client);
  await client
    .insert(assistantConnections)
    .values({ id: newId(), provider, sealedKey })
    .onConflictDoUpdate({
      target: [assistantConnections.orgId, assistantConnections.provider],
      set: { sealedKey, updatedAt: sql`now()` },
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

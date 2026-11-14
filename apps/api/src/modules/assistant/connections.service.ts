import type { AssistantProvider } from '@erxes/core-contract';
import { assistantConnections, caller, type Db, newId, requestOrgId } from '@erxes/core-db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
import { seal, unseal } from '~/lib/secrets';

type ConnectionRow = typeof assistantConnections.$inferSelect;

const mine = () => eq(assistantConnections.userId, caller('user').userId);

export const openKey = (sealed: string) => {
  try {
    return unseal(sealed);
  } catch {
    return null;
  }
};

const ownRows = (client: Db) =>
  wholeList((limit) =>
    client
      .select()
      .from(assistantConnections)
      .where(mine())
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

export const listConnections = async (client: Db) => ({ data: present(await ownRows(client)) });

const lockMine = (client: Db) =>
  lockKeys(client, [`assistant-connections:${requestOrgId()}:${caller('user').userId}`]);

export const saveConnection = async (client: Db, provider: AssistantProvider, apiKey: string) => {
  await lockMine(client);
  await client
    .insert(assistantConnections)
    .values({ id: newId(), userId: caller('user').userId, provider, sealedKey: seal(apiKey) })
    .onConflictDoUpdate({
      target: [
        assistantConnections.orgId,
        assistantConnections.userId,
        assistantConnections.provider,
      ],
      set: { sealedKey: seal(apiKey), updatedAt: sql`now()` },
    });

  const rows = present(await ownRows(client));
  const saved = rows.find((row) => row.provider === provider);

  if (!saved) throw notFound('Connection');

  return saved;
};

export const removeConnection = async (client: Db, provider: AssistantProvider) => {
  const removed = await client
    .delete(assistantConnections)
    .where(and(mine(), eq(assistantConnections.provider, provider)))
    .returning({ id: assistantConnections.id });

  if (!removed.length) throw notFound('Connection');

  return { ok: true as const };
};

export const setDefaultProvider = async (client: Db, provider: AssistantProvider | null) => {
  await lockMine(client);

  const rows = await ownRows(client);

  if (provider && !rows.some((row) => row.provider === provider)) throw notFound('Connection');

  await client
    .update(assistantConnections)
    .set({ isDefault: false })
    .where(and(mine(), eq(assistantConnections.isDefault, true)));

  if (provider) {
    await client
      .update(assistantConnections)
      .set({ isDefault: true })
      .where(and(mine(), eq(assistantConnections.provider, provider)));
  }

  return listConnections(client);
};

export const findConnection = async (client: Db, provider?: AssistantProvider) => {
  const rows = await ownRows(client);

  return provider ? rows.find((row) => row.provider === provider) : effectiveDefault(rows);
};

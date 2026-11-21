import { callerUserId, type Db, integrations, newId } from '@erxes/core-db';
import { asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { openSecret, readSecret, saveSecret, type SecretRow } from '~/modules/secrets/vault';
import { programsOf } from './programs.service';

const SealedValues = z.record(z.string(), z.string());

const parsed = (plain: string) => SealedValues.parse(JSON.parse(plain));

export const sealedValuesOf = (secret: SecretRow | null) =>
  secret ? parsed(openSecret(secret)) : {};

const findIntegration = async (client: Db, id: string) => {
  const [row] = await client.select().from(integrations).where(eq(integrations.id, id)).limit(1);

  if (!row) throw notFound('Integration');

  return row;
};

export const listIntegrations = async (client: Db) => ({
  data: await wholeList((limit) =>
    client
      .select()
      .from(integrations)
      .orderBy(asc(sql`lower(${integrations.name})`), asc(integrations.id))
      .limit(limit),
  ),
});

export const getIntegration = async (client: Db, id: string) => {
  const integration = await findIntegration(client, id);

  return { ...integration, programs: await programsOf(client, integration.id) };
};

export const createIntegration = async (
  client: Db,
  input: { key: string; name: string; hosts: string[] },
) =>
  oneRow(
    await client
      .insert(integrations)
      .values({ id: newId(), ...input, createdBy: callerUserId() })
      .returning(),
  );

export const updateIntegration = async (
  client: Db,
  id: string,
  changes: { name?: string; hosts?: string[] },
) => {
  await findIntegration(client, id);

  return oneRow(
    await client
      .update(integrations)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(eq(integrations.id, id))
      .returning(),
  );
};

export const setIntegrationSecrets = async (
  client: Db,
  id: string,
  changes: Record<string, string | null>,
) => {
  const integration = await findIntegration(client, id);

  const saved = integration.valuesSecretId
    ? parsed(await readSecret(client, integration.valuesSecretId))
    : {};

  const values = Object.fromEntries(
    Object.entries({ ...saved, ...changes }).flatMap(([name, value]) =>
      value === null ? [] : [[name, value]],
    ),
  );

  const sealedNames = Object.keys(values).toSorted();

  return oneRow(
    await client
      .update(integrations)
      .set({
        valuesSecretId: sealedNames.length
          ? await saveSecret(client, JSON.stringify(values), integration.valuesSecretId)
          : null,
        sealedNames,
        updatedAt: sql`now()`,
      })
      .where(eq(integrations.id, id))
      .returning(),
  );
};

export const removeIntegration = async (client: Db, id: string) => {
  await findIntegration(client, id);
  await client.delete(integrations).where(eq(integrations.id, id));

  return { ok: true as const };
};

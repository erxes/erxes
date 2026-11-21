import { pluginIntegrationRef } from '@erxes/core-contract';
import { caller, type Db, integrationAccounts } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { accountsOf, findAccount, recordCheck } from './accounts.service';
import { ownDefinition } from './definitions';
import { getSetupValues } from './setups.service';
import { openValues, sealValues } from './vault';

const ownAccount = async (client: Db, id: string) => {
  const row = await findAccount(client, id);

  if (!row.integration.startsWith(`${caller('plugin').plugin}.`)) throw notFound('Account');

  return row;
};

export const pluginAccounts = async (client: Db, key: string, kind?: string) => ({
  data: await accountsOf(client, pluginIntegrationRef(caller('plugin').plugin, key), kind),
});

export const openAccount = async (client: Db, id: string) => {
  const row = await ownAccount(client, id);

  return {
    ...row,
    secret: openValues(row, row.secretSealed),
    setup: await getSetupValues(client, row.integration),
  };
};

export const pluginUpdateAccount = async (
  client: Db,
  id: string,
  changes: {
    name?: string;
    detail?: string | null;
    config?: Record<string, unknown>;
    secret?: Record<string, unknown>;
  },
) => {
  await ownAccount(client, id);

  const { secret, ...plain } = changes;

  return oneRow(
    await client
      .update(integrationAccounts)
      .set({
        ...plain,
        ...(secret && {
          secretSealed: sealValues(secret),
          sealedNames: Object.keys(secret).toSorted(),
        }),
        updatedAt: sql`now()`,
      })
      .where(eq(integrationAccounts.id, id))
      .returning(),
  );
};

export const reportAccount = async (client: Db, id: string, error: string | null) => {
  await ownAccount(client, id);

  return recordCheck(client, id, error);
};

export const ownSetup = async (client: Db, key: string) => {
  const definition = await ownDefinition(client, key);

  return { setup: await getSetupValues(client, definition.ref) };
};

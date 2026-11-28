import type { coreContract } from '@erxes/core-contract';
import { assistantSettings, type Db } from '@erxes/core-db';
import type { InferContractRouterInputs } from '@orpc/contract';
import { sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { connectedProviders } from './connectedProviders';

type SettingsChange = InferContractRouterInputs<typeof coreContract>['assistant']['updateSettings'];

export const getSettings = async (client: Db) => {
  const [row] = await client.select().from(assistantSettings).limit(1);

  return {
    codeMode: row?.codeMode ?? false,
    defaultProvider: row?.defaultProvider ?? null,
    defaultModel: row?.defaultModel ?? null,
  };
};

export const updateSettings = async (client: Db, change: SettingsChange) => {
  const { defaultProvider } = change;

  if (
    defaultProvider &&
    !(await connectedProviders(client)).some((entry) => entry.provider === defaultProvider)
  ) {
    throw notFound('Connection');
  }

  const [row] = await client
    .insert(assistantSettings)
    .values(change)
    .onConflictDoUpdate({
      target: assistantSettings.orgId,
      set: { ...change, updatedAt: sql`now()` },
    })
    .returning();

  if (!row) throw new Error('The assistant settings were not returned');

  return row;
};

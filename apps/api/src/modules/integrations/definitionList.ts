import { type Db, integrationAccounts } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { mayManage, pluginDefinitions } from './definitions';
import { hasHook } from './owner';

const accountCounts = async (client: Db) =>
  new Map(
    (
      await client
        .select({
          integration: integrationAccounts.integration,
          total: sql<number>`count(*)::int`,
          broken: sql<number>`count(*) filter (where ${integrationAccounts.status} = 'broken')::int`,
        })
        .from(integrationAccounts)
        .groupBy(integrationAccounts.integration)
    ).map((row) => [row.integration, row]),
  );

export const listDefinitions = async (client: Db) => {
  const counts = await accountCounts(client);

  return {
    data: (await pluginDefinitions(client)).filter(mayManage).map((definition) => ({
      key: definition.ref,
      plugin: definition.plugin,
      name: definition.spec.name,
      summary: definition.spec.summary,
      category: definition.spec.category,
      countries: definition.spec.countries ?? [],
      accounts: definition.spec.accounts,
      connect: definition.spec.connect,
      pick: definition.spec.pick,
      setup: definition.spec.setup ?? null,
      checks: hasHook(definition, 'check'),
      accountCount: counts.get(definition.ref)?.total ?? 0,
      brokenCount: counts.get(definition.ref)?.broken ?? 0,
    })),
  };
};

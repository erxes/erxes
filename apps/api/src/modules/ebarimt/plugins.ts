import { type Db, pluginInstallations, plugins } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';

const SENDS_OWN = sql`${plugins.manifest} ->> 'taxReceipts' = 'own'`;

/** Of these plugins, those whose manifest says they issue their own tax receipts (`taxReceipts: 'own'`). */
export const ownReceiptPlugins = async (client: Db, names: string[]) => {
  if (!names.length) return new Set<string>();

  const rows = await client
    .select({ name: plugins.name })
    .from(plugins)
    .where(and(inArray(plugins.name, names), SENDS_OWN));

  return new Set(rows.map((row) => row.name));
};

export const receiptSources = async (client: Db) => {
  const installed = await client
    .select({
      plugin: pluginInstallations.plugin,
      title: sql<string>`coalesce(${plugins.manifest} ->> 'title', ${pluginInstallations.plugin})`,
    })
    .from(pluginInstallations)
    .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
    .where(
      and(
        sql`'payments:write' = any(${pluginInstallations.grantedScopes})`,
        sql`not coalesce(${SENDS_OWN}, false)`,
      ),
    )
    .orderBy(pluginInstallations.plugin);

  return [{ plugin: 'core', title: 'Core' }, ...installed];
};

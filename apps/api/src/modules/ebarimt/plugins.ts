import { type Db, plugins } from '@erxes/core-db';
import { and, inArray, sql } from 'drizzle-orm';
import { listPluginSettings } from '~/modules/payments/pluginSettings.service';

/** Of these plugins, those whose manifest says they issue their own tax receipts (`taxReceipts: 'own'`). */
export const ownReceiptPlugins = async (client: Db, names: string[]) => {
  if (!names.length) return new Set<string>();

  const rows = await client
    .select({ name: plugins.name })
    .from(plugins)
    .where(and(inArray(plugins.name, names), sql`${plugins.manifest} ->> 'taxReceipts' = 'own'`));

  return new Set(rows.map((row) => row.name));
};

/** The plugins that take payments here; `ownReceipts`: it sends its own, so it can't be picked. */
export const receiptPlugins = async (client: Db) => {
  const { data } = await listPluginSettings(client);

  const own = await ownReceiptPlugins(
    client,
    data.map((row) => row.plugin),
  );

  return {
    data: data.map(({ plugin, title }) => ({ plugin, title, ownReceipts: own.has(plugin) })),
  };
};

import { type Db, pluginInstallations, plugins } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';

/** The plugin `name` when it is active and this organisation has it installed and running. */
export const installedPlugin = async (client: Db, name: string) => {
  const [row] = await client
    .select({ plugin: plugins })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        eq(plugins.name, name),
        eq(plugins.status, 'active'),
        eq(pluginInstallations.status, 'active'),
      ),
    )
    .limit(1);

  return row?.plugin;
};

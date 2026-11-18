import { type Db, pluginInstallations, plugins } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';

/**
 * The plugin `name` when it is active and this organisation has it installed and running, with
 * the scopes the organisation granted it.
 */
export const installedPlugin = async (client: Db, name: string) => {
  const [row] = await client
    .select({ plugin: plugins, grantedScopes: pluginInstallations.grantedScopes })
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

  return row && { ...row.plugin, grantedScopes: row.grantedScopes };
};

/** Every plugin that is active and that this organisation has installed and running. */
export const installedPlugins = (client: Db) =>
  client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(and(eq(pluginInstallations.status, 'active'), eq(plugins.status, 'active')));

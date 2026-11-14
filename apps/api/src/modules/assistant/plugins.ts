import { type Db, pluginInstallations, plugins } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';

export const installedPlugins = async (client: Db) => {
  const rows = await client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(and(eq(plugins.status, 'active'), eq(pluginInstallations.status, 'active')))
    .orderBy(plugins.name);

  return rows.map(({ name, manifest }) => ({
    name,
    apiUrl: manifest?.api?.url ?? null,
    skills: manifest?.assistant?.skills ?? [],
    operations: manifest?.assistant?.operations ?? [],
  }));
};

export type InstalledPlugin = Awaited<ReturnType<typeof installedPlugins>>[number];

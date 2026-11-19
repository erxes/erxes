import { type Db, plugins } from '@erxes/core-db';
import { installedPlugins as activePlugins } from '~/modules/plugins/installedPlugin';

export const installedPlugins = async (client: Db) => {
  const rows = await activePlugins(client).orderBy(plugins.name);

  return rows.map(({ name, manifest }) => ({
    name,
    apiUrl: manifest?.api?.url ?? null,
    memberDoc: manifest?.api?.docs?.find((doc) => doc.audience === 'member')?.path ?? null,
    skills: manifest?.assistant?.skills ?? [],
  }));
};

export type InstalledPlugin = Awaited<ReturnType<typeof installedPlugins>>[number];

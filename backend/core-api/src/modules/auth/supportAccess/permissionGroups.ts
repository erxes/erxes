import { getPlugin, getPlugins } from 'erxes-api-shared/utils';

/** Every enabled plugin's admin group: what an allow-window visit gets when the policy names none. */
export const getAdminGroupIds = async () => {
  const ids: string[] = [];

  for (const name of await getPlugins()) {
    const plugin = await getPlugin(name);
    const groups: { id: string }[] =
      plugin?.config?.meta?.permissions?.defaultGroups || [];

    ids.push(
      ...groups.map((group) => group.id).filter((id) => id.endsWith(':admin')),
    );
  }

  return ids;
};

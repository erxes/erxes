import { IPermissionGroup } from '@/settings/permissions/types';

export const groupPermissionGroupsByPlugin = (groups: IPermissionGroup[]) => {
  const pluginGroups: Record<string, IPermissionGroup[]> = {};
  const customGroups: IPermissionGroup[] = [];

  for (const group of groups) {
    if (!group.plugin) {
      customGroups.push(group);
      continue;
    }

    if (!pluginGroups[group.plugin]) pluginGroups[group.plugin] = [];
    pluginGroups[group.plugin].push(group);
  }

  return { pluginGroups, customGroups };
};

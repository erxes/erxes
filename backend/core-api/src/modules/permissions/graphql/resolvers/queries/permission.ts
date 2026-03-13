import { IContext } from '~/connectionResolvers';
import { getPlugins, getPlugin } from 'erxes-api-shared/utils';

const mergePerm = (map: Map<string, any>, perm: any, plugin?: string) => {
  const existing = map.get(perm.module);

  if (!existing) {
    map.set(perm.module, {
      plugin: perm.plugin || plugin,
      module: perm.module,
      actions: [...perm.actions],
      scope: perm.scope,
    });
    return;
  }

  existing.actions = [...new Set([...existing.actions, ...perm.actions])];

  const priority: Record<string, number> = { own: 1, group: 2, all: 3 };
  if (priority[perm.scope] > priority[existing.scope]) {
    existing.scope = perm.scope;
  }
};

export const permissionQueries = {
  async permissionModules() {
    const grouped: { plugin: string; modules: any[] }[] = [];
    const services = await getPlugins();

    for (const name of services) {
      const service = await getPlugin(name);
      const permissions = service?.config?.meta?.permissions;
      if (!permissions?.modules) continue;

      const modules = permissions.modules
        .map((module: any) => ({ ...module, plugin: name }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      grouped.push({ plugin: name, modules });
    }

    return grouped.sort((a, b) => a.plugin.localeCompare(b.plugin));
  },

  async permissionDefaultGroups() {
    const groups: any[] = [];
    const services = await getPlugins();

    for (const name of services) {
      const service = await getPlugin(name);
      const permissions = service?.config?.meta?.permissions;
      if (!permissions?.defaultGroups) continue;

      for (const group of permissions.defaultGroups) {
        groups.push({ ...group, plugin: name });
      }
    }

    return groups;
  },

  async permissionGroups(_root: any, _args: any, { models }: IContext) {
    return models.PermissionGroups.find({}).sort({ name: 1 });
  },

  async permissionGroupDetail(
    _root: any,
    { id }: { id: string },
    { models }: IContext,
  ) {
    return models.PermissionGroups.findOne({ _id: id });
  },

  async currentUserPermissions(
    _root: any,
    _args: any,
    { user, models }: IContext,
  ) {
    if (!user) throw new Error('Login required');

    if (user.isOwner) {
      return [{ plugin: "*", module: '*', actions: ['*'], scope: 'all' }];
    }

    let groupIds = user.permissionGroupIds || [];
    const customPermissions = user.customPermissions || [];

    const plugins = await getPlugins();

    const allDefaultGroups: any[] = [];

    for (const pluginName of plugins) {
      const plugin = await getPlugin(pluginName);

      const permissions = plugin?.config?.meta?.permissions;

      if (!permissions?.defaultGroups) continue;

      allDefaultGroups.push(...permissions.defaultGroups);
    }

    if (groupIds.length === 0 && customPermissions.length === 0) {
      const viewerGroupIds = allDefaultGroups
        .filter((g) => g.id.endsWith(':viewer'))
        .map((g) => g.id);

      if (viewerGroupIds.length > 0) {
        await models.Users.updateOne(
          { _id: user._id },
          { $set: { permissionGroupIds: viewerGroupIds } },
        );
        groupIds = viewerGroupIds;
      }
    }

    const permMap = new Map();

    for (const groupId of groupIds) {
      if (groupId.includes(':')) {
        const group = allDefaultGroups.find((g) => g.id === groupId);
        if (group) {
          for (const perm of group.permissions) {
            mergePerm(permMap, perm);
          }
        }
      } else {
        const group = await models.PermissionGroups.findOne({ _id: groupId });

        if (group) {
          for (const perm of group.permissions) {
            mergePerm(permMap, perm);
          }
        }
      }
    }

    for (const perm of customPermissions) {
      mergePerm(permMap, perm);
    }

    return Array.from(permMap.values());
  },
};

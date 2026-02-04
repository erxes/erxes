import { IContext } from '~/connectionResolvers';
import { getPlugins, getPlugin } from 'erxes-api-shared/utils';

const mergePerm = (map: Map<string, any>, perm: any) => {
  const existing = map.get(perm.module);

  if (!existing) {
    map.set(perm.module, {
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
    const modules: any[] = [];
    const services = await getPlugins();

    for (const name of services) {
      const service = await getPlugin(name);
      const permissions = service?.config?.meta?.permissions;
      if (!permissions?.modules) continue;

      for (const module of permissions.modules) {
        modules.push({ ...module, plugin: name });
      }
    }

    return modules.sort((a, b) => a.name.localeCompare(b.name));
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
      return [{ module: '*', actions: ['*'], scope: 'all' }];
    }

    const groupIds = user.permissionGroupIds || [];
    const permMap = new Map();

    const services = await getPlugins();
    const allDefaultGroups: any[] = [];

    for (const name of services) {
      const service = await getPlugin(name);
      const permissions = service?.config?.meta?.permissions;
      if (!permissions?.defaultGroups) continue;
      allDefaultGroups.push(...permissions.defaultGroups);
    }

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

    for (const perm of user.customPermissions || []) {
      mergePerm(permMap, perm);
    }

    return Array.from(permMap.values());
  },
};

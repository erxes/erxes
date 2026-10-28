import { IContext } from '~/connectionResolvers';
import {
  IPermissionGroupPermission,
  IPermissionModule,
} from 'erxes-api-shared/core-types';
import {
  LEGACY_PERMISSION_SCOPES,
  PERMISSION_SCOPES,
  STRUCTURE_PERMISSION_SCOPES,
} from 'erxes-api-shared/core-modules';
import { getPlugins, getPlugin } from 'erxes-api-shared/utils';
import { getGroupHolderIds } from '@/organization/structure/utils';
import { getEffectiveGrants } from '../../../grants';
import { ensurePermissionGroups, getPermissionTemplates } from '../../../utils';

const withStructureScopes = (module: IPermissionModule) => {
  if (!module.scopeCollections?.length) {
    return module.scopes;
  }

  const declared = module.scopes.filter(
    (scope) => !LEGACY_PERMISSION_SCOPES.includes(scope.name),
  );
  const declaredNames = new Set(declared.map((scope) => scope.name));

  return [
    ...declared,
    ...STRUCTURE_PERMISSION_SCOPES.filter(
      (scope) => !declaredNames.has(scope.name),
    ),
  ];
};

const mergePerm = (
  map: Map<string, IPermissionGroupPermission>,
  perm: IPermissionGroupPermission,
) => {
  const existing = map.get(perm.module);

  if (!existing) {
    map.set(perm.module, {
      plugin: perm.plugin,
      module: perm.module,
      actions: [...perm.actions],
      scope: perm.scope,
    });
    return;
  }

  existing.actions = [...new Set([...existing.actions, ...perm.actions])];

  if (existing.scope === PERMISSION_SCOPES.SELF) {
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
        .map((module: IPermissionModule) => ({
          ...module,
          scopes: withStructureScopes(module),
          plugin: name,
        }))
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

      for (const group of getPermissionTemplates(name, permissions)) {
        groups.push({ ...group, plugin: name });
      }
    }

    return groups;
  },

  async permissionGroups(
    _root: any,
    _args: any,
    { models, subdomain }: IContext,
  ) {
    await ensurePermissionGroups(models, subdomain);

    return models.PermissionGroups.find({}).sort({ name: 1 });
  },

  async permissionGroupDetail(
    _root: any,
    { id }: { id: string },
    { models, subdomain }: IContext,
  ) {
    await ensurePermissionGroups(models, subdomain);

    return models.PermissionGroups.findOne({ _id: id });
  },

  async permissionGroupMembers(
    _root: any,
    {
      _id,
      page = 1,
      perPage = 10,
    }: { _id: string; page?: number; perPage?: number },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('permissionsManage');

    const userIds = await getGroupHolderIds(models, _id);
    const selector = { _id: { $in: userIds } };
    const limit = Math.min(Math.max(perPage, 1), 100);
    const skip = (Math.max(page, 1) - 1) * limit;

    const [list, totalCount] = await Promise.all([
      models.Users.find(selector).sort({ _id: 1 }).skip(skip).limit(limit),
      models.Users.countDocuments(selector),
    ]);

    return { list, totalCount };
  },

  async currentUserPermissions(
    _root: any,
    _args: any,
    { user, models, subdomain }: IContext,
  ) {
    if (!user) throw new Error('Login required');

    await ensurePermissionGroups(models, subdomain);

    const plugins = await getPlugins();

    const pluginsWithPermissions: string[] = [];

    for (const pluginName of plugins) {
      const plugin = await getPlugin(pluginName);
      const permissions = plugin?.config?.meta?.permissions;

      if (permissions?.modules?.length || permissions?.defaultGroups?.length) {
        pluginsWithPermissions.push(pluginName);
      }
    }

    if (user.isOwner) {
      return {
        permissions: [
          {
            plugin: '*',
            module: '*',
            actions: ['*'],
            scope: PERMISSION_SCOPES.ENTITY,
          },
        ],
        pluginsWithPermissions,
      };
    }

    const permMap = new Map<string, IPermissionGroupPermission>();

    for (const grant of await getEffectiveGrants(models, user._id)) {
      for (const perm of grant.permissions) {
        mergePerm(permMap, perm);
      }
    }

    return {
      permissions: Array.from(permMap.values()),
      pluginsWithPermissions,
    };
  },
};

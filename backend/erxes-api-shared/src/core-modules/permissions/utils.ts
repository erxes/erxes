import { IUserDocument, Resolver } from '../../core-types';
import { getPlugins, getPlugin, sendTRPCMessage, redis } from '../../utils';

export const checkLogin = (user?: IUserDocument) => {
  if (!user || !user._id) {
    throw new Error('Login required');
  }
};

export const wrapPermission = (resolver: Resolver, resolverKey: string) => {
  return async (parent: any, args: any, context: any, info: any) => {
    const { user } = context;

    checkLogin(user);

    return resolver(parent, args, context, info);
  };
};

const SCOPE_PRIORITY: Record<string, number> = { own: 1, group: 2, all: 3 };

const applyPermissions = (
  actionsMap: Record<string, string>,
  permissions: { actions?: string[]; scope?: string }[],
) => {
  for (const permission of permissions) {
    const scope = permission.scope || 'all';
    for (const act of permission.actions || []) {
      const existing = actionsMap[act];
      if (
        !existing ||
        (SCOPE_PRIORITY[scope] || 0) > (SCOPE_PRIORITY[existing] || 0)
      ) {
        actionsMap[act] = scope;
      }
    }
  }
};

const applyDefaultGroupActions = async (
  actionsMap: Record<string, string>,
  defaultGroupIds: string[],
) => {
  const plugins = await getPlugins();

  for (const pluginName of plugins) {
    const plugin = await getPlugin(pluginName);
    const defaultGroups = plugin?.config?.meta?.permissions?.defaultGroups;

    if (!defaultGroups) continue;

    for (const group of defaultGroups) {
      if (defaultGroupIds.includes(group.id)) {
        applyPermissions(actionsMap, group.permissions);
      }
    }
  }
};

const applyCustomGroupActions = async (
  actionsMap: Record<string, string>,
  subdomain: string,
  customGroupIds: string[],
) => {
  const groups = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'permissionGroups',
    action: 'find',
    input: {
      query: { _id: { $in: customGroupIds } },
    },
    defaultValue: [],
  });

  for (const group of groups) {
    applyPermissions(actionsMap, group.permissions || []);
  }
};

export const getGroupActionsMap = async (
  subdomain: string,
  user: IUserDocument,
): Promise<Record<string, string>> => {
  // const cacheKey = `user_actions_${user._id}`;

  // const cached = await redis.get(cacheKey);

  // if (cached) return JSON.parse(cached);

  const actionsMap: Record<string, string> = {};
  let groupIds = user.permissionGroupIds || [];
  const customPermissions = user.customPermissions || [];

  if (groupIds.length === 0 && customPermissions.length === 0) {
    const plugins = await getPlugins();

    for (const pluginName of plugins) {
      const plugin = await getPlugin(pluginName);
      const defaultGroups = plugin?.config?.meta?.permissions?.defaultGroups;

      if (!defaultGroups) continue;

      for (const group of defaultGroups) {
        if (group.id.endsWith(':viewer')) {
          groupIds = [...groupIds, group.id];
        }
      }
    }
  }

  const defaultGroupIds = groupIds.filter((id) => id.includes(':'));
  const customGroupIds = groupIds.filter((id) => !id.includes(':'));

  if (defaultGroupIds.length) {
    await applyDefaultGroupActions(actionsMap, defaultGroupIds);
  }

  if (customGroupIds.length) {
    await applyCustomGroupActions(actionsMap, subdomain, customGroupIds);
  }

  applyPermissions(actionsMap, customPermissions);

  // await redis.set(cacheKey, JSON.stringify(actionsMap));

  return actionsMap;
};

export const clearGroupActionsCache = async ({
  subdomain,
  userId,
  groupId,
}: {
  subdomain?: string;
  userId?: string;
  groupId?: string;
}) => {
  if (userId) {
    await redis.del(`user_actions_${userId}`);
  }

  if (groupId && subdomain) {
    const users = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'find',
      input: {
        query: { permissionGroupIds: groupId },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    for (const u of users) {
      await redis.del(`user_actions_${u._id}`);
    }
  }
};

export const canGroup = async (
  subdomain: string,
  action: string,
  user?: IUserDocument,
): Promise<boolean> => {
  if (!user || !user._id) return false;

  if (user.isOwner) return true;

  const actionsMap = await getGroupActionsMap(subdomain, user);

  return !!actionsMap[action];
};

export const getActionScope = async (
  subdomain: string,
  action: string,
  user?: IUserDocument,
): Promise<string | null> => {

  if (!user || !user._id) return null;

  if (user.isOwner) return 'all';

  const actionsMap = await getGroupActionsMap(subdomain, user);

  return actionsMap[action] || null;
};

export const checkPermissionGroup = (
  subdomain: string,
  user?: IUserDocument,
) => {
  return async (action: string, ownerId?: string) => {
    checkLogin(user);

    const scope = await getActionScope(subdomain, action, user);

    if (!scope) {
      throw new Error('Permission required');
    }

    if (scope === 'own' && ownerId && user?._id !== ownerId) {
      throw new Error('Permission required');
    }
  };
};

export const wrapPublicResolver = (resolver: Resolver, wrapperConfig: any) => {
  return async (parent: any, args: any, context: any, info: any) => {
    const { cpUserRequired, forClientPortal } = wrapperConfig || {};

    if (forClientPortal) {
      if (!context.clientPortal) {
        throw new Error('Client portal required');
      }

      if (cpUserRequired && !context.cpUser) {
        throw new Error('Client portal user required');
      }
    }

    return resolver(parent, args, context, info);
  };
};

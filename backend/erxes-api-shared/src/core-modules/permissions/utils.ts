import { IUserDocument, Resolver } from '../../core-types';
import {
  getEnv,
  getPlugins,
  getPlugin,
  sendTRPCMessage,
  redis,
} from '../../utils';
import { getUserActionsMap } from './user-actions-map';

export const getKey = (user: IUserDocument) => `user_permissions_${user._id}`;

export const checkLogin = (user?: IUserDocument) => {
  if (!user || !user._id) {
    throw new Error('Login required');
  }
};

export const permissionWrapper = (
  cls: any,
  methodName: string,
  checkers: any,
) => {
  const oldMethod = cls[methodName];

  cls[methodName] = async (root: any, args: any, context: any, info: any) => {
    const { user } = context;

    for (const checker of checkers) {
      checker(user);
    }

    return oldMethod(root, args, context, info);
  };
};

export const can = async (
  subdomain: string,
  action: string,
  user?: IUserDocument,
): Promise<boolean> => {
  if (!user || !user._id) {
    return false;
  }

  if (user.isOwner) {
    return true;
  }

  const actionMap = await getUserActionsMap(subdomain, user);

  if (!actionMap) {
    return false;
  }

  return actionMap[action] === true;
};

/*
 * Get allowed actions
 */
export const getUserAllowedActions = async (
  subdomain: string,
  user: any,
): Promise<string[]> => {
  const map = await getUserActionsMap(subdomain, user);

  const allowedActions: string[] = [];

  for (const key of Object.keys(map)) {
    if (map[key]) {
      allowedActions.push(key);
    }
  }

  return allowedActions;
};

export const checkPermission = async (
  cls: any,
  methodName: string,
  actionName: string,
  defaultValue?: any,
) => {
  const oldMethod = cls[methodName];

  cls[methodName] = async (
    root: any,
    args: any,
    context: { user?: IUserDocument; [x: string]: any },
    info: any,
  ) => {
    const { user, subdomain } = context;

    checkLogin(user);

    const VERSION = getEnv({ name: 'VERSION' });

    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    if (VERSION && VERSION === 'saas' && NODE_ENV === 'production') {
      //   await checkOrganizationCharge({
      //     actionName,
      //     methodName,
      //     context,
      //     params: args,
      //   });
    }

    return oldMethod(root, args, context, info);
  };
};

export const requireLogin = (cls: any, methodName: string) =>
  permissionWrapper(cls, methodName, [checkLogin]);

export const moduleRequireLogin = (mdl: any) => {
  for (const method in mdl) {
    if (Object.prototype.hasOwnProperty.call(mdl, method)) {
      requireLogin(mdl, method);
    }
  }
};

/**
 * Wraps all properties (methods) of a given object with 'Permission action required' permission checker
 */
export const moduleCheckPermission = async (
  mdl: any,
  action: string,
  defaultValue?: any,
) => {
  for (const method in mdl) {
    if (Object.prototype.hasOwnProperty.call(mdl, method)) {
      await checkPermission(mdl, method, action, defaultValue);
    }
  }
};

export const wrapPermission = (resolver: Resolver, resolverKey: string) => {
  return async (parent: any, args: any, context: any, info: any) => {
    const { user } = context;

    checkLogin(user);

    return resolver(parent, args, context, info);
  };
};

export const getGroupActionsMap = async (
  subdomain: string,
  user: IUserDocument,
): Promise<Record<string, boolean>> => {
  const cacheKey = `user_actions_${user._id}`;

  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const actionsMap: Record<string, boolean> = {};
  const groupIds = user.permissionGroupIds || [];

  const defaultGroupIds = groupIds.filter((id) => id.includes(':'));

  if (defaultGroupIds?.length) {
    const plugins = await getPlugins();

    for (const pluginName of plugins) {
      const plugin = await getPlugin(pluginName);
      const permissions = plugin?.config?.meta?.permissions;

      if (!permissions?.defaultGroups) continue;

      for (const group of permissions.defaultGroups) {
        if (!defaultGroupIds.includes(group.id)) continue;

        for (const permission of group.permissions) {
          for (const act of permission.actions || []) {
            actionsMap[act] = true;
          }
        }
      }
    }
  }

  const customGroupIds = groupIds.filter((id) => !id.includes(':'));

  if (customGroupIds?.length) {
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
      for (const permission of group.permissions || []) {
        for (const act of permission.actions || []) {
          actionsMap[act] = true;
        }
      }
    }
  }

  for (const permission of user.customPermissions || []) {
    for (const act of permission.actions || []) {
      actionsMap[act] = true;
    }
  }

  await redis.set(cacheKey, JSON.stringify(actionsMap));

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

  return actionsMap[action] === true;
};

export const checkPermissionGroup = (
  subdomain: string,
  user?: IUserDocument,
) => {
  return async (action: string) => {
    checkLogin(user);

    const allowed = await canGroup(subdomain, action, user);

    if (!allowed) {
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

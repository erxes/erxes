import { IUserDocument, Resolver } from '../../core-types';
import {
  getPlugin,
  sendTRPCMessage,
  redis,
  getActivePlugins,
} from '../../utils';

export const checkLogin = (user?: IUserDocument) => {
  if (!user?._id) {
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

const applyPermissions = (
  actionsMap: Record<string, boolean>,
  permissions: { actions?: string[] }[],
) => {
  for (const permission of permissions) {
    for (const act of permission.actions || []) {
      actionsMap[act] = true;
    }
  }
};

const applyDefaultGroupActions = async (
  actionsMap: Record<string, boolean>,
  defaultGroupIds: string[],
) => {
  const plugins = await getActivePlugins();

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
  actionsMap: Record<string, boolean>,
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
): Promise<Record<string, boolean>> => {
  const cacheKey = `user_actions_${user._id}`;

  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const actionsMap: Record<string, boolean> = {};
  const groupIds = user.permissionGroupIds || [];

  const defaultGroupIds = groupIds.filter((id) => id.includes(':'));
  const customGroupIds = groupIds.filter((id) => !id.includes(':'));

  if (defaultGroupIds.length) {
    await applyDefaultGroupActions(actionsMap, defaultGroupIds);
  }

  if (customGroupIds.length) {
    await applyCustomGroupActions(actionsMap, subdomain, customGroupIds);
  }

  applyPermissions(actionsMap, user.customPermissions || []);

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

const getOAuthActionScopeMap = async () => {
  const activePlugins = await getActivePlugins();
  const scopeMap: Record<string, string[]> = {};

  for (const pluginName of activePlugins) {
    const plugin = await getPlugin(pluginName);
    const modules = plugin?.config?.meta?.permissions?.modules || [];

    for (const module of modules) {
      for (const action of module.actions || []) {
        const actionScopes = action.oauthScopes?.length
          ? action.oauthScopes
          : action.oauthScope
            ? [action.oauthScope]
            : [];

        if (actionScopes.length) {
          scopeMap[action.name] = actionScopes;
        }
      }
    }
  }

  return scopeMap;
};

const checkOAuthScope = async (action: string, user?: IUserDocument) => {
  const oauthScopes = (
    (user || {}) as IUserDocument & {
      oauthScopes?: string[];
    }
  ).oauthScopes;

  if (!oauthScopes?.length) {
    return;
  }

  const scopeMap = await getOAuthActionScopeMap();
  const actionScopes = scopeMap[action] || [];

  if (
    actionScopes.length === 0 ||
    !actionScopes.some((scope) => oauthScopes.includes(scope))
  ) {
    throw new Error('OAuth scope required');
  }
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

    await checkOAuthScope(action, user);
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

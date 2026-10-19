import {
  IPermissionAction,
  IPermissionConfig,
  IPermissionModule,
  IUserDocument,
  Resolver,
} from '../../core-types';
import {
  getPlugin,
  sendTRPCMessage,
  redis,
  getActivePlugins,
  ExpectedError,
} from '../../utils';
import { extensionTenant } from '../extensions/tenant';

export const checkLogin = (user?: IUserDocument) => {
  if (!user?._id) {
    throw new ExpectedError('Login required', 'UNAUTHORIZED');
  }
};

export const wrapPermission = (resolver: Resolver, resolverKey: string) => {
  return async (parent: any, args: any, context: any, info: any) => {
    const { user } = context;

    checkLogin(user);

    return resolver(parent, args, context, info);
  };
};

// Extensions are installed per tenant, so their permission configs live under
// a tenant key instead of in service discovery. The extensions runtime writes
// it on every install change. Without a runtime the key is absent: no configs.
export const extensionPermissionsKey = (subdomain: string) =>
  `extensions:permissions:${subdomain}`;

// An extension may only define and grant its own actions: every module and
// action name starts with `<plugin>.`, which no core or plugin action does.
// Anything else is dropped, so a config can never grant e.g. permissionsManage.
const ownOnly = (config: IPermissionConfig): IPermissionConfig => {
  const own = (name: string) => name.startsWith(`${config.plugin}.`);

  return {
    ...config,
    modules: config.modules
      .filter((module) => own(module.name))
      .map((module) => ({
        ...module,
        actions: module.actions.filter((action) => own(action.name)),
      })),
    defaultGroups: (config.defaultGroups || []).map((group) => ({
      ...group,
      permissions: group.permissions
        .filter((p) => p.plugin === config.plugin && own(p.module))
        .map((p) => ({
          ...p,
          actions: p.actions.filter((a) => a === '*' || own(a)),
        })),
    })),
  };
};

export const getExtensionPermissionConfigs = async (
  subdomain: string,
): Promise<IPermissionConfig[]> => {
  const raw = await redis.get(
    extensionPermissionsKey(extensionTenant(subdomain)),
  );
  return raw ? (JSON.parse(raw) as IPermissionConfig[]).map(ownOnly) : [];
};

type GrantedPermission = {
  plugin?: string;
  module?: string;
  actions?: string[];
};

const resolveActionNames = async (
  permission: GrantedPermission,
  extensions: IPermissionConfig[],
): Promise<string[]> => {
  const actions = permission.actions || [];

  if (!actions.includes('*')) return actions;

  if (!permission.plugin || !permission.module) return [];

  const plugin = await getPlugin(permission.plugin);

  const modules: IPermissionModule[] =
    plugin?.config?.meta?.permissions?.modules ||
    extensions.find((config) => config.plugin === permission.plugin)?.modules ||
    [];

  const permissionModule = modules.find((m) => m.name === permission.module);

  return (permissionModule?.actions || []).map((action) => action.name);
};

const applyPermissions = async (
  actionsMap: Record<string, boolean>,
  permissions: GrantedPermission[],
  extensions: IPermissionConfig[],
) => {
  for (const permission of permissions) {
    for (const act of await resolveActionNames(permission, extensions)) {
      actionsMap[act] = true;
    }
  }
};

const applyDefaultGroupActions = async (
  actionsMap: Record<string, boolean>,
  defaultGroupIds: string[],
  extensions: IPermissionConfig[],
) => {
  const plugins = await getActivePlugins();

  for (const pluginName of plugins) {
    const plugin = await getPlugin(pluginName);
    const defaultGroups = plugin?.config?.meta?.permissions?.defaultGroups;

    if (!defaultGroups) continue;

    for (const group of defaultGroups) {
      if (defaultGroupIds.includes(group.id)) {
        await applyPermissions(actionsMap, group.permissions, extensions);
      }
    }
  }

  for (const config of extensions) {
    for (const group of config.defaultGroups || []) {
      if (defaultGroupIds.includes(group.id)) {
        await applyPermissions(actionsMap, group.permissions, extensions);
      }
    }
  }
};

const applyCustomGroupActions = async (
  actionsMap: Record<string, boolean>,
  subdomain: string,
  customGroupIds: string[],
  extensions: IPermissionConfig[],
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
    await applyPermissions(actionsMap, group.permissions || [], extensions);
  }
};

export const getGroupActionsMap = async (
  subdomain: string,
  user: PermissionUser,
): Promise<Record<string, boolean>> => {
  const cacheKey = `user_actions_${user._id}`;

  const cached = await redis.get(cacheKey);

  if (cached) {
    try {
      const cachedActions: unknown = JSON.parse(cached);

      if (
        cachedActions &&
        typeof cachedActions === 'object' &&
        !Array.isArray(cachedActions) &&
        Object.values(cachedActions).every(
          (isAllowed) => typeof isAllowed === 'boolean',
        )
      ) {
        return cachedActions as Record<string, boolean>;
      }
    } catch {
      // Rebuild malformed permission cache entries below.
    }

    await redis.del(cacheKey);
  }

  const actionsMap: Record<string, boolean> = {};
  const groupIds = user.permissionGroupIds || [];

  const defaultGroupIds = groupIds.filter((id) => id.includes(':'));
  const customGroupIds = groupIds.filter((id) => !id.includes(':'));
  const extensions = await getExtensionPermissionConfigs(subdomain);

  if (defaultGroupIds.length) {
    await applyDefaultGroupActions(actionsMap, defaultGroupIds, extensions);
  }

  if (customGroupIds.length) {
    await applyCustomGroupActions(
      actionsMap,
      subdomain,
      customGroupIds,
      extensions,
    );
  }

  await applyPermissions(actionsMap, user.customPermissions || [], extensions);

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

// The fields a permission check reads, so a caller holding a plain user
// document (not a model instance) can check too.
export type PermissionUser = Pick<
  IUserDocument,
  '_id' | 'isOwner' | 'permissionGroupIds' | 'customPermissions'
>;

export const canGroup = async (
  subdomain: string,
  action: string,
  user?: PermissionUser,
): Promise<boolean> => {
  if (!user || !user._id) return false;

  if (user.isOwner) return true;

  const actionsMap = await getGroupActionsMap(subdomain, user);

  return actionsMap[action] === true;
};

/** Whether a plugin action names its own OAuth scopes in its permission config. */
export const hasDeclaredOAuthScopes = (
  action: Pick<IPermissionAction, 'oauthScope' | 'oauthScopes'>,
): boolean => Boolean(action.oauthScopes?.length || action.oauthScope);

/**
 * OAuth scopes that grant an action. Declared scopes win; an action without
 * any (every non-core plugin today) maps to one scope for its whole module,
 * `<plugin>-<module>:manage`, so OAuth clients can be granted it on the
 * approval page and enforcement has something to compare against.
 */
export const resolveActionOAuthScopes = (
  pluginName: string,
  module: Pick<IPermissionModule, 'name'>,
  action: Pick<IPermissionAction, 'oauthScope' | 'oauthScopes'>,
): string[] => {
  if (action.oauthScopes?.length) {
    return action.oauthScopes;
  }

  if (action.oauthScope) {
    return [action.oauthScope];
  }

  return [`${pluginName}-${module.name}:manage`];
};

const getOAuthActionScopeMap = async () => {
  const activePlugins = await getActivePlugins();
  const scopeMap: Record<string, string[]> = {};

  for (const pluginName of activePlugins) {
    const plugin = await getPlugin(pluginName);
    const modules = plugin?.config?.meta?.permissions?.modules || [];

    for (const module of modules) {
      for (const action of module.actions || []) {
        scopeMap[action.name] = resolveActionOAuthScopes(
          pluginName,
          module,
          action,
        );
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

  // Only OAuth-token sessions carry `oauthScopes` (the gateway sets it from
  // the token's scope claim); a normal login has none and is not scope-checked.
  if (oauthScopes === undefined) {
    return;
  }

  // An OAuth token that was granted no scopes must not fall through to the
  // user's full permissions.
  if (oauthScopes.length === 0) {
    throw new ExpectedError('OAuth scope required', 'FORBIDDEN');
  }

  const scopeMap = await getOAuthActionScopeMap();
  const actionScopes = scopeMap[action] || [];

  if (
    actionScopes.length === 0 ||
    !actionScopes.some((scope) => oauthScopes.includes(scope))
  ) {
    throw new ExpectedError('OAuth scope required', 'FORBIDDEN');
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
      throw new ExpectedError('Permission required', 'FORBIDDEN');
    }

    await checkOAuthScope(action, user);
  };
};

export const wrapPublicResolver = (resolver: Resolver, wrapperConfig: any) => {
  return async (parent: any, args: any, context: any, info: any) => {
    const { cpUserRequired, forClientPortal } = wrapperConfig || {};

    if (forClientPortal) {
      if (!context.clientPortal) {
        throw new ExpectedError('Client portal required', 'UNAUTHORIZED');
      }

      if (cpUserRequired && !context.cpUser) {
        throw new ExpectedError('Client portal user required', 'UNAUTHORIZED');
      }
    }

    return resolver(parent, args, context, info);
  };
};

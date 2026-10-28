import {
  IEffectivePermissionGrant,
  IPermissionAction,
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
import { recordPermissionAction } from '../../utils/mongo/permission-scope';
import {
  bumpPermissionCacheVersion,
  getPermissionCacheVersion,
  permissionScopeCacheKey,
} from './scope';

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

type GrantedPermission = {
  plugin?: string;
  module?: string;
  actions?: string[];
};

const resolveActionNames = async (
  permission: GrantedPermission,
): Promise<string[]> => {
  const actions = permission.actions || [];

  if (!actions.includes('*')) return actions;

  if (!permission.plugin || !permission.module) return [];

  const plugin = await getPlugin(permission.plugin);
  
  const modules: IPermissionModule[] = plugin?.config?.meta?.permissions?.modules || [];
  
  const permissionModule = modules.find((m) => m.name === permission.module);

  return (permissionModule?.actions || []).map((action) => action.name);
};

const applyPermissions = async (
  actionsMap: Record<string, boolean>,
  permissions: GrantedPermission[],
) => {
  for (const permission of permissions) {
    for (const act of await resolveActionNames(permission)) {
      actionsMap[act] = true;
    }
  }
};

export const getGroupActionsMap = async (
  subdomain: string,
  user: IUserDocument,
): Promise<Record<string, boolean>> => {
  const cacheKey = `user_actions_${user._id}`;
  const version = await getPermissionCacheVersion(subdomain);
  const cached = await redis.get(cacheKey);

  if (cached) {
    try {
      const parsed: unknown = JSON.parse(cached);

      if (
        parsed &&
        typeof parsed === 'object' &&
        'version' in parsed &&
        'actions' in parsed &&
        parsed.version === `${subdomain}:${version}` &&
        parsed.actions &&
        typeof parsed.actions === 'object' &&
        Object.values(parsed.actions).every(
          (isAllowed) => typeof isAllowed === 'boolean',
        )
      ) {
        return parsed.actions as Record<string, boolean>;
      }
    } catch {
      // Rebuild malformed permission cache entries below.
    }
  }

  const grants: IEffectivePermissionGrant[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'permissions',
    action: 'effectiveGrants',
    input: { userId: user._id },
    defaultValue: [],
  });

  const actionsMap: Record<string, boolean> = {};

  for (const grant of grants) {
    await applyPermissions(actionsMap, grant.permissions || []);
  }

  await redis.set(
    cacheKey,
    JSON.stringify({ version: `${subdomain}:${version}`, actions: actionsMap }),
  );

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
    await redis.del(`user_actions_${userId}`, permissionScopeCacheKey(userId));
  }

  if (groupId && subdomain) {
    await bumpPermissionCacheVersion(subdomain);
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

    recordPermissionAction(action);
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

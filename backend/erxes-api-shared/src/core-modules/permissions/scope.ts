import { NextFunction, Request, Response } from 'express';
import { IPermissionScope, IStructureUserContext } from '../../core-types';
import { redis, sendTRPCMessage } from '../../utils';
import { extractUserFromHeader } from '../../utils/headers';
import {
  IPermissionScopeResolution,
  IPermissionScopeStore,
  runWithPermissionScope,
  setPermissionScopeResolver,
} from '../../utils/mongo/permission-scope';
import { getSubdomain } from '../../utils/utils';

export const PERMISSION_SCOPES = {
  SELF: 'self',
  ENTITY: 'entity',
} as const;

export const STRUCTURE_PERMISSION_SCOPES: IPermissionScope[] = [
  { name: PERMISSION_SCOPES.SELF, description: 'Records the user owns' },
  {
    name: PERMISSION_SCOPES.ENTITY,
    description:
      'Records within the granted structure node, and below it when the grant inherits',
  },
];

export const LEGACY_PERMISSION_SCOPES = ['own', 'group', 'all'];

const PERMISSION_SCOPE_CACHE_SECONDS = 60;

export const permissionScopeCacheKey = (userId: string) =>
  `permission_scope_${userId}`;

const permissionCacheVersionKey = (subdomain: string) =>
  `permission_cache_version_${subdomain}`;

export const getPermissionCacheVersion = async (subdomain: string) =>
  (await redis.get(permissionCacheVersionKey(subdomain))) || '0';

export const bumpPermissionCacheVersion = async (subdomain: string) => {
  await redis.incr(permissionCacheVersionKey(subdomain));
};

const getCached = async <T>(
  subdomain: string,
  userId: string,
  name: string,
  load: () => Promise<T | null>,
): Promise<T> => {
  const key = permissionScopeCacheKey(userId);
  const version = await getPermissionCacheVersion(subdomain);
  const field = `${subdomain}:${version}:${name}`;
  const cached = await redis.hget(key, field);

  if (cached) {
    return JSON.parse(cached);
  }

  const value = await load();

  if (!value) {
    throw new Error('Permission scope could not be resolved');
  }

  await redis
    .multi()
    .hset(key, field, JSON.stringify(value))
    .expire(key, PERMISSION_SCOPE_CACHE_SECONDS)
    .exec();

  return value;
};

const resolvePermissionScope = (
  { subdomain, user }: IPermissionScopeStore,
  plugin: string,
  module: string,
  actions: string[],
): Promise<IPermissionScopeResolution> =>
  getCached(
    subdomain,
    user._id,
    `${plugin}:${module}:${actions.join(',')}`,
    () =>
      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'permissions',
        action: 'resolveScope',
        input: { userId: user._id, plugin, module, actions },
        defaultValue: null,
      }),
  );

setPermissionScopeResolver(resolvePermissionScope);

export const getStructureUserContext = (
  subdomain: string,
  userId: string,
): Promise<IStructureUserContext> =>
  getCached(subdomain, userId, 'structure:context', () =>
    sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'structureEntities',
      action: 'userContext',
      input: { userId },
      defaultValue: null,
    }),
  );

export const permissionScopeMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const user = extractUserFromHeader(req.headers);

  if (!user?._id) {
    return next();
  }

  return runWithPermissionScope(
    { subdomain: getSubdomain(req), user, cache: new Map(), actions: [] },
    next,
  );
};

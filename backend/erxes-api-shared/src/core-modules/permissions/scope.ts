import { NextFunction, Request, Response } from 'express';
import { IPermissionScope } from '../../core-types';
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
  OWN: 'own',
  UNIT: 'unit',
  POSITION: 'position',
  DEPARTMENT: 'department',
  BRANCH: 'branch',
  ALL: 'all',
} as const;

export const STRUCTURE_PERMISSION_SCOPES: IPermissionScope[] = [
  { name: PERMISSION_SCOPES.OWN, description: 'Records the user owns' },
  {
    name: PERMISSION_SCOPES.UNIT,
    description: 'Records owned by members of the user units',
  },
  {
    name: PERMISSION_SCOPES.POSITION,
    description: 'Records owned by the user positions and positions below',
  },
  {
    name: PERMISSION_SCOPES.DEPARTMENT,
    description: 'Records of the user departments and sub-departments',
  },
  {
    name: PERMISSION_SCOPES.BRANCH,
    description: 'Records of the user branches and sub-branches',
  },
  { name: PERMISSION_SCOPES.ALL, description: 'All records' },
];

const PERMISSION_SCOPE_CACHE_SECONDS = 60;

export const permissionScopeCacheKey = (userId: string) =>
  `permission_scope_${userId}`;

const resolvePermissionScope = async (
  { subdomain, user }: IPermissionScopeStore,
  plugin: string,
  module: string,
): Promise<IPermissionScopeResolution> => {
  const key = permissionScopeCacheKey(user._id);
  const field = `${subdomain}:${plugin}:${module}`;
  const cached = await redis.hget(key, field);

  if (cached) {
    return JSON.parse(cached);
  }

  const resolution: IPermissionScopeResolution | null = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'permissions',
    action: 'resolveScope',
    input: { userId: user._id, plugin, module },
    defaultValue: null,
  });

  if (!resolution) {
    throw new Error('Permission scope could not be resolved');
  }

  await redis
    .multi()
    .hset(key, field, JSON.stringify(resolution))
    .expire(key, PERMISSION_SCOPE_CACHE_SECONDS)
    .exec();

  return resolution;
};

setPermissionScopeResolver(resolvePermissionScope);

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
    { subdomain: getSubdomain(req), user, cache: new Map() },
    next,
  );
};

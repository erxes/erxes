import { canGroup } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError, redis, sendWorkerQueue } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';
import {
  FILE_ACCESS_ROLE_RANK,
  FILE_ACCESS_ROLES,
  FILE_PRINCIPAL_TYPES,
  FILES_MAX_GRANTS,
  FILES_ORG_ROOT_KEY,
  FILES_PRINCIPALS_TTL_SECONDS,
  TFileAccessRole,
  TFilePrincipalType,
} from '@/files/constants';
import { IFileAccessGrant, IFilesAccessFields } from '@/files/db/definitions/folders';

export type TFilesActor = {
  subdomain: string;
  userId: string;
  principals: string[];
  // Read-only oversight, except managing the ownerless Org drive root.
  isAdmin: boolean;
};

export type TFilesItemRef = { itemType: 'file' | 'folder'; _id: string };

type TFilesAccessItem = Partial<IFilesAccessFields> & { rootKey?: string };

export type TFilesAccessGrantInput = { type: string; id?: string; role: string };

export const FILE_GRANT_ROLES: TFileAccessRole[] = [
  FILE_ACCESS_ROLES.VIEWER,
  FILE_ACCESS_ROLES.MANAGER,
];

type TRoleMap = Map<string, number>;

const ROLE_BY_RANK = Object.fromEntries(
  Object.entries(FILE_ACCESS_ROLE_RANK).map(([role, rank]) => [rank, role]),
) as Record<number, TFileAccessRole>;

export const principalKey = (type: TFilePrincipalType, id?: string) =>
  type === FILE_PRINCIPAL_TYPES.EVERYONE ? type : `${type}:${id}`;

export const toGrant = (
  type: TFilePrincipalType,
  role: TFileAccessRole,
  id?: string,
): IFileAccessGrant => ({
  type,
  role,
  ...(type === FILE_PRINCIPAL_TYPES.EVERYONE ? {} : { id }),
  key: principalKey(type, id),
});

export const grantFromKey = (key: string, role: TFileAccessRole): IFileAccessGrant => {
  const [type, id] = key.split(':') as [TFilePrincipalType, string | undefined];

  return toGrant(type, role, id);
};

const rankOf = (role?: TFileAccessRole | null) => (role ? FILE_ACCESS_ROLE_RANK[role] : 0);

export const normalizeGrants = (
  input: TFilesAccessGrantInput[],
  allowedRoles: TFileAccessRole[] = Object.values(FILE_ACCESS_ROLES),
): IFileAccessGrant[] => {
  const byKey = new Map<string, IFileAccessGrant>();

  for (const { type: rawType, id, role: rawRole } of input) {
    const type = Object.values(FILE_PRINCIPAL_TYPES).find((t) => t === rawType);
    const role = allowedRoles.find((r) => r === rawRole);

    if (!type || !role) {
      throw new ExpectedError('Unknown principal or role', 'FILES_INVALID_ACCESS');
    }

    if (type !== FILE_PRINCIPAL_TYPES.EVERYONE && !id) {
      throw new ExpectedError(`A ${type} grant needs an id`, 'FILES_INVALID_ACCESS');
    }

    const grant = toGrant(type, role, id);
    const current = byKey.get(grant.key);

    if (!current || rankOf(grant.role) > rankOf(current.role)) {
      byKey.set(grant.key, grant);
    }
  }

  if (byKey.size > FILES_MAX_GRANTS) {
    throw new ExpectedError(
      `Up to ${FILES_MAX_GRANTS} grants are allowed`,
      'FILES_INVALID_ACCESS',
    );
  }

  return [...byKey.values()];
};

export const withOwnerGrant = (grants: TFilesAccessGrantInput[], ownerId?: string) =>
  ownerId
    ? [
        ...grants.filter((g) => !(g.type === FILE_PRINCIPAL_TYPES.USER && g.id === ownerId)),
        { type: FILE_PRINCIPAL_TYPES.USER, id: ownerId, role: FILE_ACCESS_ROLES.MANAGER },
      ]
    : grants;

type TFolderAccess = Pick<IFilesAccessFields, 'readers' | 'managers'>;

const union = (...lists: string[][]) => [...new Set(lists.flat())].sort();

export const fileAccessFields = (folder: TFolderAccess, grants: IFileAccessGrant[]) => ({
  readers: union(folder.readers, grants.map((g) => g.key)),
  managers: union(
    folder.managers,
    grants.filter((g) => g.role === FILE_ACCESS_ROLES.MANAGER).map((g) => g.key),
  ),
});

export const fileAccessPipeline = (folder: TFolderAccess) => {
  const ownKeys = (cond: Record<string, unknown> | true) => ({
    $map: {
      input: {
        $filter: { input: { $ifNull: ['$access', []] }, as: 'grant', cond },
      },
      as: 'grant',
      in: '$$grant.key',
    },
  });

  return [
    {
      $set: {
        readers: { $setUnion: [folder.readers, ownKeys(true)] },
        managers: {
          $setUnion: [
            folder.managers,
            ownKeys({ $eq: ['$$grant.role', FILE_ACCESS_ROLES.MANAGER] }),
          ],
        },
      },
    },
  ];
};

export const toRoleMap = (fields?: Partial<IFilesAccessFields> | null): TRoleMap => {
  const map: TRoleMap = new Map();

  (fields?.readers || []).forEach((key) => map.set(key, 1));
  (fields?.contributors || []).forEach((key) => map.set(key, 2));
  (fields?.managers || []).forEach((key) => map.set(key, 3));

  return map;
};

export const mergeAccess = (inherited: TRoleMap | null, grants: IFileAccessGrant[]) => {
  const map: TRoleMap = new Map(inherited || []);

  for (const grant of grants) {
    map.set(grant.key, Math.max(map.get(grant.key) || 0, rankOf(grant.role)));
  }

  return map;
};

export const toAccessFields = (map: TRoleMap): IFilesAccessFields => {
  const atLeast = (rank: number) =>
    [...map.entries()].filter(([, r]) => r >= rank).map(([key]) => key).sort();

  return { readers: atLeast(1), contributors: atLeast(2), managers: atLeast(3) };
};

export const sameAccess = (a: Partial<IFilesAccessFields>, b: IFilesAccessFields) =>
  (['readers', 'contributors', 'managers'] as const).every(
    (field) => [...(a[field] || [])].sort().join() === b[field].join(),
  );

export const roleOf = (
  item: Partial<IFilesAccessFields>,
  principals: string[],
): TFileAccessRole | null => {
  const has = (keys?: string[]) => !!keys?.some((key) => principals.includes(key));

  if (has(item.managers)) {
    return FILE_ACCESS_ROLES.MANAGER;
  }

  if (has(item.contributors)) {
    return FILE_ACCESS_ROLES.CONTRIBUTOR;
  }

  return has(item.readers) ? FILE_ACCESS_ROLES.VIEWER : null;
};

export const readFilter = (actor: TFilesActor) =>
  actor.isAdmin ? {} : { readers: { $in: actor.principals } };

export const manageFilter = (actor: TFilesActor) => ({
  managers: { $in: actor.principals },
});

export const logAdminAccess = (actor: TFilesActor, operation: string, items: TFilesItemRef[]) => {
  if (!items.length) {
    return;
  }

  sendWorkerQueue('logs', 'put_log')
    .add(
      'put_log',
      {
        subdomain: actor.subdomain,
        source: 'graphql',
        action: 'filesAdminAccess',
        status: 'success',
        userId: actor.userId,
        payload: { operation, items: items.slice(0, 100), count: items.length },
      },
      { removeOnComplete: true },
    )
    .catch(() => undefined);
};

export const logAdminReads = <T extends Partial<IFilesAccessFields> & { _id: string }>(
  actor: TFilesActor,
  operation: string,
  itemType: TFilesItemRef['itemType'],
  items: T[],
) => {
  if (!actor.isAdmin) {
    return;
  }

  logAdminAccess(
    actor,
    operation,
    items
      .filter((item) => !roleOf(item, actor.principals))
      .map((item) => ({ itemType, _id: item._id })),
  );
};

// The Org drive root has no owner, so only admins can grant access to it.
const roleOrOrgAdmin = (actor: TFilesActor, item: TFilesAccessItem) =>
  actor.isAdmin && item.rootKey === FILES_ORG_ROOT_KEY
    ? FILE_ACCESS_ROLES.MANAGER
    : roleOf(item, actor.principals);

// No role at all reads as NOT_FOUND, so a hidden item looks missing.
export const assertRole = (
  actor: TFilesActor,
  item: TFilesAccessItem & { _id: string },
  required: TFileAccessRole,
  operation: string,
  itemType: TFilesItemRef['itemType'],
) => {
  const role = roleOrOrgAdmin(actor, item);

  if (rankOf(role) >= rankOf(required)) {
    return;
  }

  if (actor.isAdmin && required === FILE_ACCESS_ROLES.VIEWER) {
    logAdminAccess(actor, operation, [{ itemType, _id: item._id }]);

    return;
  }

  if (!role) {
    throw new ExpectedError(itemType === 'file' ? 'File not found' : 'Folder not found', 'NOT_FOUND');
  }

  throw new ExpectedError(
    `You need ${required} access to do this`,
    'FILES_FORBIDDEN',
  );
};

export const myRole = (actor: TFilesActor, item: TFilesAccessItem) =>
  roleOrOrgAdmin(actor, item) || (actor.isAdmin ? FILE_ACCESS_ROLES.VIEWER : null);

export const roleFromRank = (rank: number) => ROLE_BY_RANK[rank];

type TParentsOf = (ids: string[]) => Promise<{ parentId?: string }[]>;

// One query per tree level, not per id.
const withAncestors = async (parentsOf: TParentsOf, ids: string[] = []) => {
  const seen = new Set(ids);
  let level = ids;

  while (level.length) {
    const parents = await parentsOf(level);

    level = parents
      .map((p) => p.parentId)
      .filter((id): id is string => !!id && !seen.has(id));
    level.forEach((id) => seen.add(id));
  }

  return [...seen];
};

const principalsKey = (subdomain: string, userId: string) =>
  `files:principals:${subdomain}:${userId}`;

// Cached per user; org-structure and unit changes apply when it expires.
const getPrincipals = async (models: IModels, subdomain: string, user: IUserDocument) => {
  const key = principalsKey(subdomain, user._id);
  const cached = await redis.get(key);

  if (cached) {
    try {
      const parsed: unknown = JSON.parse(cached);

      if (Array.isArray(parsed) && parsed.every((p) => typeof p === 'string')) {
        return parsed as string[];
      }
    } catch {
      // Rebuilt below.
    }
  }

  const [departmentIds, branchIds, units] = await Promise.all([
    withAncestors(
      (ids) => models.Departments.find({ _id: { $in: ids } }, { parentId: 1 }).lean(),
      user.departmentIds,
    ),
    withAncestors(
      (ids) => models.Branches.find({ _id: { $in: ids } }, { parentId: 1 }).lean(),
      user.branchIds,
    ),
    models.Units.find({ userIds: user._id }, { _id: 1 }).lean<{ _id: string }[]>(),
  ]);

  const principals = [
    FILE_PRINCIPAL_TYPES.EVERYONE,
    principalKey(FILE_PRINCIPAL_TYPES.USER, user._id),
    ...departmentIds.map((id) => principalKey(FILE_PRINCIPAL_TYPES.DEPARTMENT, id)),
    ...branchIds.map((id) => principalKey(FILE_PRINCIPAL_TYPES.BRANCH, id)),
    ...units.map((u) => principalKey(FILE_PRINCIPAL_TYPES.UNIT, u._id)),
  ];

  await redis.set(key, JSON.stringify(principals), 'EX', FILES_PRINCIPALS_TTL_SECONDS);

  return principals;
};

const actorByRequest = new WeakMap<IContext, Promise<TFilesActor>>();

const buildActor = async ({ models, subdomain, user }: IContext): Promise<TFilesActor> => {
  const [principals, isAdmin] = await Promise.all([
    getPrincipals(models, subdomain, user),
    canGroup(subdomain, 'filesAdmin', user),
    // Adopts legacy data before anything is read.
    models.FileFolders.ensureOrgRoot(),
  ]);

  return { subdomain, userId: user._id, principals, isAdmin };
};

export const getFilesActor = (context: IContext) => {
  let actor = actorByRequest.get(context);

  if (!actor) {
    actor = buildActor(context);
    actorByRequest.set(context, actor);
  }

  return actor;
};

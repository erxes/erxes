import { PERMISSION_SCOPES } from 'erxes-api-shared/core-modules';
import {
  escapeRegExp,
  IPermissionScopeResolution,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

const SCOPE_ALIASES: Record<string, string> = {
  group: PERMISSION_SCOPES.DEPARTMENT,
};

const ALL_RECORDS: IPermissionScopeResolution = {
  all: true,
  userIds: [],
  branchIds: [],
  departmentIds: [],
};

const NO_RECORDS: IPermissionScopeResolution = {
  all: false,
  userIds: [],
  branchIds: [],
  departmentIds: [],
};

const orderPrefixQuery = (orders: string[]) => ({
  $or: orders.map((order) => ({
    order: { $regex: new RegExp(`^${escapeRegExp(order)}`) },
  })),
});

const toIds = (docs: { _id: unknown }[]) => docs.map((doc) => String(doc._id));

const ordersOf = (docs: { order?: string }[]) =>
  docs.map((doc) => doc.order).filter((order): order is string => !!order);

const getBranchIds = async (models: IModels, userId: string, ids: string[]) => {
  const roots = await models.Branches.find(
    { $or: [{ _id: { $in: ids } }, { supervisorId: userId }] },
    { order: 1 },
  ).lean();
  const orders = ordersOf(roots);
  const descendants = orders.length
    ? await models.Branches.find(orderPrefixQuery(orders), { _id: 1 }).lean()
    : [];

  return [...new Set([...toIds(roots), ...toIds(descendants)])];
};

const getDepartmentIds = async (
  models: IModels,
  userId: string,
  ids: string[],
) => {
  const roots = await models.Departments.find(
    { $or: [{ _id: { $in: ids } }, { supervisorId: userId }] },
    { order: 1 },
  ).lean();
  const orders = ordersOf(roots);
  const descendants = orders.length
    ? await models.Departments.find(orderPrefixQuery(orders), {
        _id: 1,
      }).lean()
    : [];

  return [...new Set([...toIds(roots), ...toIds(descendants)])];
};

const getPositionUserIds = async (
  models: IModels,
  userId: string,
  ids: string[],
) => {
  const roots = await models.Positions.find(
    { $or: [{ _id: { $in: ids } }, { userIds: userId }] },
    { order: 1 },
  ).lean();
  const orders = ordersOf(roots);
  const positions = orders.length
    ? await models.Positions.find(orderPrefixQuery(orders), {
        _id: 1,
        userIds: 1,
      }).lean()
    : [];
  const positionIds = [...new Set([...toIds(roots), ...toIds(positions)])];
  const users = await models.Users.find(
    { positionIds: { $in: positionIds } },
    { _id: 1 },
  ).lean();

  return [
    ...toIds(users),
    ...positions.flatMap((position) => position.userIds || []),
  ];
};

const getUnitUserIds = async (models: IModels, userId: string) => {
  const units = await models.Units.find(
    { $or: [{ userIds: userId }, { supervisorId: userId }] },
    { userIds: 1, supervisorId: 1 },
  ).lean();

  return units.flatMap((unit) => [
    ...(unit.userIds || []),
    ...(unit.supervisorId ? [unit.supervisorId] : []),
  ]);
};

const getUserIdsIn = async (
  models: IModels,
  field: 'branchIds' | 'departmentIds',
  ids: string[],
) => {
  if (!ids.length) {
    return [];
  }

  const users = await models.Users.find(
    { [field]: { $in: ids } },
    { _id: 1 },
  ).lean();

  return toIds(users);
};

export const resolvePermissionScope = async (
  models: IModels,
  {
    userId,
    plugin,
    module,
  }: { userId: string; plugin: string; module: string },
): Promise<IPermissionScopeResolution> => {
  const user = await models.Users.findOne({ _id: userId }).lean();

  if (!user) {
    return NO_RECORDS;
  }

  if (user.isOwner) {
    return ALL_RECORDS;
  }

  const groups = await models.PermissionGroups.find(
    { _id: { $in: user.permissionGroupIds || [] } },
    { permissions: 1 },
  ).lean();

  const scopes = new Set(
    [
      ...groups.flatMap((group) => group.permissions || []),
      ...(user.customPermissions || []),
    ]
      .filter(
        (permission) =>
          (permission.module === module || permission.module === '*') &&
          (!permission.plugin || permission.plugin === plugin),
      )
      .map((permission) => {
        const scope = permission.scope || PERMISSION_SCOPES.ALL;
        return SCOPE_ALIASES[scope] || scope;
      }),
  );

  if (!scopes.size || scopes.has(PERMISSION_SCOPES.ALL)) {
    return ALL_RECORDS;
  }

  const userIds = new Set<string>([userId]);
  let branchIds: string[] = [];
  let departmentIds: string[] = [];

  if (scopes.has(PERMISSION_SCOPES.BRANCH)) {
    branchIds = await getBranchIds(models, userId, user.branchIds || []);
    for (const id of await getUserIdsIn(models, 'branchIds', branchIds)) {
      userIds.add(id);
    }
  }

  if (scopes.has(PERMISSION_SCOPES.DEPARTMENT)) {
    departmentIds = await getDepartmentIds(
      models,
      userId,
      user.departmentIds || [],
    );
    for (const id of await getUserIdsIn(
      models,
      'departmentIds',
      departmentIds,
    )) {
      userIds.add(id);
    }
  }

  if (scopes.has(PERMISSION_SCOPES.POSITION)) {
    for (const id of await getPositionUserIds(
      models,
      userId,
      user.positionIds || [],
    )) {
      userIds.add(id);
    }
  }

  if (scopes.has(PERMISSION_SCOPES.UNIT)) {
    for (const id of await getUnitUserIds(models, userId)) {
      userIds.add(id);
    }
  }

  return {
    all: false,
    userIds: [...userIds],
    branchIds,
    departmentIds,
  };
};

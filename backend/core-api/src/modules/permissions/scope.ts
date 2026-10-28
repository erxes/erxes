import { PERMISSION_SCOPES } from 'erxes-api-shared/core-modules';
import { IPermissionGroupPermission } from 'erxes-api-shared/core-types';
import {
  IPermissionScopeResolution,
  withoutPermissionScope,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  activeMembershipFilter,
  getActiveMemberIds,
  getDescendantIds,
} from '@/organization/structure/utils';
import { getEffectiveGrants } from './grants';
import {
  STRUCTURE_PERMISSION_MODULE,
  STRUCTURE_READ_ACTION,
} from '@/organization/structure/constants';

const matchesModule = (
  permission: IPermissionGroupPermission,
  plugin: string,
  module: string,
) =>
  (permission.module === module || permission.module === '*') &&
  (!permission.plugin ||
    permission.plugin === '*' ||
    permission.plugin === plugin);

const matchesActions = (
  permission: IPermissionGroupPermission,
  actions: string[],
) =>
  !actions.length ||
  (permission.actions || []).some(
    (action) => action === '*' || actions.includes(action),
  );

const isSelfScope = (permission: IPermissionGroupPermission) =>
  permission.scope === PERMISSION_SCOPES.SELF;

const readsOwnNodes = (plugin: string, module: string, actions: string[]) =>
  plugin === STRUCTURE_PERMISSION_MODULE.plugin &&
  module === STRUCTURE_PERMISSION_MODULE.module &&
  actions.every((action) => action === STRUCTURE_READ_ACTION);

export const resolvePermissionScope = async (
  models: IModels,
  {
    userId,
    plugin,
    module,
    actions = [],
  }: { userId: string; plugin: string; module: string; actions?: string[] },
): Promise<IPermissionScopeResolution> => {
  const user = await models.Users.findOne(
    { _id: userId },
    { isOwner: 1 },
  ).lean();

  if (!user) {
    return { all: false, userIds: [], entityIds: [] };
  }

  const primaryEntityId = (
    await models.StructureEntityMembers.findOne(
      { userId, isPrimary: true, ...activeMembershipFilter() },
      { entityId: 1 },
    ).lean()
  )?.entityId;

  if (user.isOwner) {
    return { all: true, userIds: [], entityIds: [], primaryEntityId };
  }

  const grants = await getEffectiveGrants(models, userId);
  const matches = grants.flatMap((grant) =>
    grant.permissions
      .filter(
        (permission) =>
          matchesModule(permission, plugin, module) &&
          matchesActions(permission, actions),
      )
      .map((permission) => ({ grant, self: isSelfScope(permission) })),
  );

  const entityGrants = matches
    .filter((match) => !match.self)
    .map((match) => match.grant);

  const ownEntityIds = readsOwnNodes(plugin, module, actions)
    ? await models.StructureEntityMembers.distinct('entityId', {
        userId,
        ...activeMembershipFilter(),
      })
    : [];

  if (!entityGrants.length) {
    return {
      all: false,
      userIds: [userId],
      entityIds: ownEntityIds,
      primaryEntityId,
    };
  }

  const root = await models.StructureEntities.getRoot();

  if (
    entityGrants.some((grant) => grant.entityId === root._id && grant.inherit)
  ) {
    return { all: true, userIds: [], entityIds: [], primaryEntityId };
  }

  const nodes = await withoutPermissionScope(() =>
    models.StructureEntities.find(
      { _id: { $in: entityGrants.map((grant) => grant.entityId) } },
      { order: 1 },
    ).lean(),
  );

  const inheritOrders = nodes
    .filter((node) =>
      entityGrants.some(
        (grant) => grant.entityId === node._id && grant.inherit,
      ),
    )
    .map((node) => node.order);

  const entityIds = [
    ...new Set([
      ...nodes.map((node) => node._id),
      ...(await getDescendantIds(models, inheritOrders)),
    ]),
  ];
  const visibleEntityIds = [...new Set([...entityIds, ...ownEntityIds])];

  return {
    all: false,
    userIds: [
      ...new Set([userId, ...(await getActiveMemberIds(models, entityIds))]),
    ],
    entityIds: visibleEntityIds,
    primaryEntityId,
  };
};

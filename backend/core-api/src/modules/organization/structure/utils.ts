import {
  IStructurePluginCapability,
  IStructureSeatDocument,
  IStructureUserContext,
} from 'erxes-api-shared/core-types';
import {
  escapeRegExp,
  getPlugin,
  getPlugins,
  withoutPermissionScope,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  CORE_STRUCTURE_CAPABILITIES,
  STRUCTURE_SEAT_COVERAGES,
} from './constants';

export interface IStructureCapabilityInfo extends IStructurePluginCapability {
  plugin: string;
}

export const orderPrefixFilter = (orders: string[]) => ({
  $or: orders.map((order) => ({
    order: { $regex: new RegExp(`^${escapeRegExp(order)}`) },
  })),
});

export const pathIdsOf = (order: string) => order.split('/').filter(Boolean);

export const activeMembershipFilter = (now = new Date()) => ({
  startsAt: { $lte: now },
  endsAt: { $not: { $lte: now } },
});

export const getStructureCapabilities = async (): Promise<
  IStructureCapabilityInfo[]
> => {
  const capabilities: IStructureCapabilityInfo[] =
    CORE_STRUCTURE_CAPABILITIES.map((capability) => ({
      ...capability,
      plugin: 'core',
    }));

  for (const name of await getPlugins()) {
    if (name === 'core') {
      continue;
    }

    const plugin = await getPlugin(name);
    const declared: IStructurePluginCapability[] =
      plugin?.config?.meta?.structure?.capabilities || [];

    for (const capability of declared) {
      capabilities.push({
        ...capability,
        key: `${name}:${capability.key}`,
        plugin: name,
      });
    }
  }

  return capabilities;
};

export const getDescendantIds = async (
  models: IModels,
  orders: string[],
): Promise<string[]> => {
  if (!orders.length) {
    return [];
  }

  const nodes = await withoutPermissionScope(() =>
    models.StructureEntities.find(orderPrefixFilter(orders), { _id: 1 }).lean(),
  );

  return nodes.map((node) => node._id);
};

export const getActiveMemberIds = async (
  models: IModels,
  entityIds: string[],
): Promise<string[]> => {
  if (!entityIds.length) {
    return [];
  }

  return models.StructureEntityMembers.distinct('userId', {
    entityId: { $in: entityIds },
    ...activeMembershipFilter(),
  });
};

export const getUserSeats = async (
  models: IModels,
  userId: string,
): Promise<IStructureSeatDocument[]> => {
  const seatIds = await models.StructureEntityMembers.distinct('seatIds', {
    userId,
    seatIds: { $ne: [] },
    ...activeMembershipFilter(),
  });

  if (!seatIds.length) {
    return [];
  }

  return models.StructureSeats.find({ _id: { $in: seatIds } }).lean();
};

export const getSeatCoveredIds = async (
  models: IModels,
  seats: Pick<
    IStructureSeatDocument,
    'entityId' | 'coverage' | 'coveredEntityIds'
  >[],
): Promise<string[]> => {
  const belowIds = seats
    .filter((seat) => seat.coverage === STRUCTURE_SEAT_COVERAGES.BELOW)
    .map((seat) => seat.entityId);
  const belowNodes = belowIds.length
    ? await withoutPermissionScope(() =>
        models.StructureEntities.find(
          { _id: { $in: belowIds } },
          { order: 1 },
        ).lean(),
      )
    : [];

  return [
    ...new Set([
      ...seats.map((seat) => seat.entityId),
      ...seats.flatMap((seat) =>
        seat.coverage === STRUCTURE_SEAT_COVERAGES.SELECTED
          ? seat.coveredEntityIds
          : [],
      ),
      ...(await getDescendantIds(
        models,
        belowNodes.map((node) => node.order),
      )),
    ]),
  ];
};

export const getGroupHolderIds = async (
  models: IModels,
  groupId: string,
): Promise<string[]> => {
  const positionIds = await models.StructurePositions.distinct('_id', {
    groupIds: groupId,
  });

  if (!positionIds.length) {
    return [];
  }

  const seatIds = await models.StructureSeats.distinct('_id', {
    positionId: { $in: positionIds },
  });

  if (!seatIds.length) {
    return [];
  }

  return models.StructureEntityMembers.distinct('userId', {
    seatIds: { $in: seatIds },
    ...activeMembershipFilter(),
  });
};

export const getUserStructureContext = async (
  models: IModels,
  userId: string,
): Promise<IStructureUserContext> => {
  const memberships = await models.StructureEntityMembers.find({
    userId,
    ...activeMembershipFilter(),
  }).lean();

  const entities = await withoutPermissionScope(() =>
    models.StructureEntities.find(
      { _id: { $in: memberships.map((membership) => membership.entityId) } },
      { order: 1 },
    ).lean(),
  );

  const entityIds = entities.map((entity) => entity._id);
  const boundaryEntityIds = [
    ...new Set([
      ...entityIds,
      ...(await getSeatCoveredIds(models, await getUserSeats(models, userId))),
    ]),
  ];

  return {
    primaryEntityId: memberships.find((membership) => membership.isPrimary)
      ?.entityId,
    entityIds,
    principalEntityIds: [
      ...new Set(entities.flatMap((entity) => pathIdsOf(entity.order))),
    ],
    boundaryEntityIds,
    boundaryUserIds: await getActiveMemberIds(models, boundaryEntityIds),
  };
};

import { IEffectivePermissionGrant } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { STRUCTURE_SEAT_COVERAGES } from '@/organization/structure/constants';
import { getUserSeats } from '@/organization/structure/utils';

export interface IRawGrant {
  groupId: string;
  entityId: string;
  inherit: boolean;
}

export const getRawGrants = async (
  models: IModels,
  userId: string,
): Promise<IRawGrant[]> => {
  const seats = await getUserSeats(models, userId);

  if (!seats.length) {
    return [];
  }

  const positions = await models.StructurePositions.find(
    { _id: { $in: [...new Set(seats.map((seat) => seat.positionId))] } },
    { groupIds: 1 },
  ).lean();

  return seats.flatMap((seat) => {
    const groupIds =
      positions.find((position) => position._id === seat.positionId)
        ?.groupIds || [];
    const boundaries =
      seat.coverage === STRUCTURE_SEAT_COVERAGES.SELECTED
        ? [seat.entityId, ...seat.coveredEntityIds]
        : [seat.entityId];
    const inherit = seat.coverage === STRUCTURE_SEAT_COVERAGES.BELOW;

    return groupIds.flatMap((groupId) =>
      boundaries.map((entityId) => ({ groupId, entityId, inherit })),
    );
  });
};

export const getEffectiveGrants = async (
  models: IModels,
  userId: string,
): Promise<IEffectivePermissionGrant[]> => {
  const raw = await getRawGrants(models, userId);
  const groupIds = [...new Set(raw.map((grant) => grant.groupId))];
  const groups = groupIds.length
    ? await models.PermissionGroups.find(
        { _id: { $in: groupIds } },
        { permissions: 1 },
      ).lean()
    : [];

  return raw
    .map((grant) => ({
      permissions:
        groups.find((group) => group._id === grant.groupId)?.permissions || [],
      entityId: grant.entityId,
      inherit: grant.inherit,
    }))
    .filter((grant) => grant.permissions.length);
};

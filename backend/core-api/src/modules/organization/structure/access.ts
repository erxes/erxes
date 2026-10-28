import {
  IStructureSeatDocument,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { withoutPermissionScope } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getRawGrants, IRawGrant } from '@/permissions/grants';
import { STRUCTURE_SEAT_COVERAGES } from './constants';

interface IPathNode {
  _id: string;
  order: string;
}

export const SEAT_ACCESS_ERROR =
  'You can only manage seats whose permissions you hold over every node they cover';

export const assertNotSelf = (
  actor: IUserDocument,
  targetUserIds: string[],
) => {
  if (targetUserIds.includes(actor._id)) {
    throw new Error('You cannot change your own seats');
  }
};

export const assertCanManageSeat = async (
  models: IModels,
  actor: IUserDocument,
  seat: Pick<
    IStructureSeatDocument,
    'positionId' | 'entityId' | 'coverage' | 'coveredEntityIds'
  >,
  targetUserIds: string[] = [],
) => {
  assertNotSelf(actor, targetUserIds);

  if (actor.isOwner) {
    return;
  }

  const position = await models.StructurePositions.getPosition(seat.positionId);

  if (!position.groupIds.length) {
    return;
  }

  const grants = await getRawGrants(models, actor._id);
  const targetIds =
    seat.coverage === STRUCTURE_SEAT_COVERAGES.SELECTED
      ? [seat.entityId, ...seat.coveredEntityIds]
      : [seat.entityId];
  const nodes: IPathNode[] = await withoutPermissionScope(() =>
    models.StructureEntities.find(
      {
        _id: {
          $in: [...new Set([...targetIds, ...grants.map((g) => g.entityId)])],
        },
      },
      { order: 1 },
    ).lean(),
  );
  const nodeOf = (id: string) => nodes.find((node) => node._id === id);

  const covers = (grant: IRawGrant, target: IPathNode, subtree: boolean) => {
    if (grant.entityId === target._id && (!subtree || grant.inherit)) {
      return true;
    }

    const node = nodeOf(grant.entityId);

    return grant.inherit && !!node && target.order.startsWith(node.order);
  };

  for (const groupId of position.groupIds) {
    const held = grants.filter((grant) => grant.groupId === groupId);

    for (const targetId of targetIds) {
      const target = nodeOf(targetId);
      const subtree =
        targetId === seat.entityId &&
        seat.coverage === STRUCTURE_SEAT_COVERAGES.BELOW;

      if (!target || !held.some((grant) => covers(grant, target, subtree))) {
        throw new Error(SEAT_ACCESS_ERROR);
      }
    }
  }
};

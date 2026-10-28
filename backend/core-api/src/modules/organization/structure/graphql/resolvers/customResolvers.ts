import {
  IStructureEntityDocument,
  IStructureEntityMemberDocument,
  IStructureEntityTypeDocument,
  IStructurePositionDocument,
  IStructureSeatDocument,
} from 'erxes-api-shared/core-types';
import { withoutPermissionScope } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { STRUCTURE_ENTITY_STATUSES } from '../../constants';
import { activeMembershipFilter, pathIdsOf } from '../../utils';

const isActiveMembership = (member: IStructureEntityMemberDocument) => {
  const now = Date.now();
  const startsAt = member.startsAt ? new Date(member.startsAt).getTime() : 0;
  const endsAt = member.endsAt ? new Date(member.endsAt).getTime() : Infinity;

  return startsAt <= now && endsAt > now;
};

export const structureCustomResolvers = {
  StructureEntityType: {
    __resolveReference: async (
      { _id }: { _id: string },
      { models }: IContext,
    ) => models.StructureEntityTypes.findOne({ _id }),

    entityCount: async (
      type: IStructureEntityTypeDocument,
      _args: undefined,
      { models }: IContext,
    ) =>
      models.StructureEntities.countDocuments({
        typeId: type._id,
        status: STRUCTURE_ENTITY_STATUSES.ACTIVE,
      }),
  },

  StructureEntity: {
    __resolveReference: async (
      { _id }: { _id: string },
      { models }: IContext,
    ) =>
      withoutPermissionScope(() => models.StructureEntities.findOne({ _id })),

    type: async (
      entity: IStructureEntityDocument,
      _args: undefined,
      { models }: IContext,
    ) => models.StructureEntityTypes.findOne({ _id: entity.typeId }),

    parent: async (
      entity: IStructureEntityDocument,
      _args: undefined,
      { models }: IContext,
    ) =>
      entity.parentId
        ? models.StructureEntities.findOne({ _id: entity.parentId })
        : null,

    path: async (
      entity: IStructureEntityDocument,
      _args: undefined,
      { models }: IContext,
    ) => {
      const ids = pathIdsOf(entity.order).filter((id) => id !== entity._id);
      const nodes = await models.StructureEntities.find({
        _id: { $in: ids },
      }).lean();

      return ids
        .map((id) => nodes.find((node) => node._id === id))
        .filter(Boolean);
    },

    childCount: async (
      entity: IStructureEntityDocument,
      _args: undefined,
      { models }: IContext,
    ) =>
      models.StructureEntities.countDocuments({
        parentId: entity._id,
        status: STRUCTURE_ENTITY_STATUSES.ACTIVE,
      }),

    memberCount: async (
      entity: IStructureEntityDocument,
      _args: undefined,
      { models }: IContext,
    ) =>
      models.StructureEntityMembers.countDocuments({
        entityId: entity._id,
        ...activeMembershipFilter(),
      }),

    seatCount: async (
      entity: IStructureEntityDocument,
      _args: undefined,
      { models }: IContext,
    ) => models.StructureSeats.countDocuments({ entityId: entity._id }),
  },

  StructurePosition: {
    __resolveReference: async (
      { _id }: { _id: string },
      { models }: IContext,
    ) => models.StructurePositions.findOne({ _id }),

    groups: async (
      position: IStructurePositionDocument,
      _args: undefined,
      { models }: IContext,
    ) =>
      position.groupIds.length
        ? models.PermissionGroups.find({ _id: { $in: position.groupIds } })
        : [],

    seatCount: async (
      position: IStructurePositionDocument,
      _args: undefined,
      { models }: IContext,
    ) => models.StructureSeats.countDocuments({ positionId: position._id }),
  },

  StructureSeat: {
    __resolveReference: async (
      { _id }: { _id: string },
      { models }: IContext,
    ) => models.StructureSeats.findOne({ _id }),

    position: async (
      seat: IStructureSeatDocument,
      _args: undefined,
      { models }: IContext,
    ) => models.StructurePositions.findOne({ _id: seat.positionId }),

    entity: async (
      seat: IStructureSeatDocument,
      _args: undefined,
      { models }: IContext,
    ) => models.StructureEntities.findOne({ _id: seat.entityId }),

    coveredEntities: async (
      seat: IStructureSeatDocument,
      _args: undefined,
      { models }: IContext,
    ) =>
      seat.coveredEntityIds.length
        ? models.StructureEntities.find({
            _id: { $in: seat.coveredEntityIds },
          }).sort({ order: 1 })
        : [],

    holders: async (
      seat: IStructureSeatDocument,
      _args: undefined,
      { models }: IContext,
    ) => {
      const userIds = await models.StructureSeats.getHolderIds(seat._id);

      return withoutPermissionScope(() =>
        models.Users.find({ _id: { $in: userIds } }).sort({
          'details.firstName': 1,
        }),
      );
    },

    holderCount: async (
      seat: IStructureSeatDocument,
      _args: undefined,
      { models }: IContext,
    ) => (await models.StructureSeats.getHolderIds(seat._id)).length,
  },

  StructureEntityMember: {
    entity: async (
      member: IStructureEntityMemberDocument,
      _args: undefined,
      { models }: IContext,
    ) => models.StructureEntities.findOne({ _id: member.entityId }),

    user: async (
      member: IStructureEntityMemberDocument,
      _args: undefined,
      { models }: IContext,
    ) =>
      withoutPermissionScope(() =>
        models.Users.findOne({ _id: member.userId }),
      ),

    seats: async (
      member: IStructureEntityMemberDocument,
      _args: undefined,
      { models }: IContext,
    ) =>
      member.seatIds?.length
        ? models.StructureSeats.find({ _id: { $in: member.seatIds } })
        : [],

    isActive: async (member: IStructureEntityMemberDocument) =>
      isActiveMembership(member),
  },
};

import {
  buildStructureMembershipActivity,
  buildStructureSeatActivity,
  clearGroupActionsCache,
  sendNotification,
} from 'erxes-api-shared/core-modules';
import {
  IStructureEntityDocument,
  IStructureEntityMemberDocument,
  IStructurePosition,
  IStructurePositionDocument,
  IStructureSeatDocument,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { withoutPermissionScope } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { buildTarget } from '@/organization/team-member/meta/activity-log/utils';
import { assertCanManageSeat } from '../../access';
import {
  STRUCTURE_NOTIFICATION_TYPE,
  STRUCTURE_SEAT_NOTIFICATION_TYPE,
} from '../../constants';
import {
  IStructureEntityInput,
  TStructureEntityEditInput,
  TStructureEntityTypeInput,
} from '../../db/models/Structure';
import {
  IStructureSeatInput,
  TStructureSeatEditInput,
} from '../../db/models/Seats';
import { activeMembershipFilter } from '../../utils';

interface ISeatContext {
  seat: IStructureSeatDocument;
  position: IStructurePositionDocument;
  entity: IStructureEntityDocument;
}

const assertMembershipActor = (actor: IUserDocument, targetUserId: string) => {
  if (!actor.isOwner && targetUserId === actor._id) {
    throw new Error('You cannot change your own membership');
  }
};

const assertUsersExist = async ({ models }: IContext, userIds: string[]) => {
  const foundIds = await models.Users.distinct('_id', {
    _id: { $in: userIds },
  });
  const missing = userIds.filter((id) => !foundIds.includes(id));

  if (missing.length) {
    throw new Error(`Users not found: ${missing.join(', ')}`);
  }
};

const loadSeatContext = async (
  { models }: IContext,
  seatId: string,
): Promise<ISeatContext> => {
  const seat = await models.StructureSeats.getSeat(seatId);
  const [position, entity] = await Promise.all([
    models.StructurePositions.getPosition(seat.positionId),
    models.StructureEntities.getEntity(seat.entityId),
  ]);

  return { seat, position, entity };
};

const notifyMembership = (
  { subdomain, user }: IContext,
  entity: IStructureEntityDocument,
  member: IStructureEntityMemberDocument,
  assigned: boolean,
) => {
  if (member.userId === user._id) {
    return;
  }

  sendNotification(subdomain, {
    title: assigned
      ? `Added to ${entity.title}`
      : `Removed from ${entity.title}`,
    message: assigned
      ? `You were added to ${entity.title}.`
      : `Your membership in ${entity.title} has ended.`,
    type: 'info',
    fromUserId: user._id,
    userIds: [member.userId],
    contentType: 'core:structure.entity',
    contentTypeId: entity._id,
    action: assigned ? 'assigned' : 'unassigned',
    priority: 'medium',
    notificationType: STRUCTURE_NOTIFICATION_TYPE,
    event: `core:structure:${STRUCTURE_NOTIFICATION_TYPE}`,
  }).catch(() => undefined);
};

const logMembership = async (
  { models, eventHandlers }: IContext,
  entity: IStructureEntityDocument,
  member: IStructureEntityMemberDocument,
  assigned: boolean,
) => {
  const target = await withoutPermissionScope(() =>
    models.Users.findOne({ _id: member.userId }),
  );
  const { createActivityLog } = eventHandlers('core')('organization', 'users');

  createActivityLog(
    buildStructureMembershipActivity({
      activityType: assigned
        ? 'structure_entity.assigned'
        : 'structure_entity.unassigned',
      target: buildTarget(target || { _id: member.userId }),
      context: {
        moduleName: 'organization',
        collectionName: 'structure_entities',
        text: entity.title,
      },
      ids: [entity._id],
      labels: [entity.title],
      metadata: { seatIds: member.seatIds },
    }),
  );
};

const notifySeat = (
  { subdomain, user }: IContext,
  { seat, position, entity }: ISeatContext,
  userId: string,
  assigned: boolean,
) => {
  if (userId === user._id) {
    return;
  }

  sendNotification(subdomain, {
    title: assigned
      ? `Seat assigned: ${position.name}`
      : `Seat removed: ${position.name}`,
    message: assigned
      ? `You now hold ${position.name} at ${entity.title}.`
      : `You no longer hold ${position.name} at ${entity.title}.`,
    type: 'info',
    fromUserId: user._id,
    userIds: [userId],
    contentType: 'core:structure.seat',
    contentTypeId: seat._id,
    action: assigned ? 'assigned' : 'unassigned',
    priority: 'medium',
    notificationType: STRUCTURE_SEAT_NOTIFICATION_TYPE,
    event: `core:structure:${STRUCTURE_SEAT_NOTIFICATION_TYPE}`,
  }).catch(() => undefined);
};

const logSeat = async (
  { models, eventHandlers }: IContext,
  { seat, position, entity }: ISeatContext,
  userId: string,
  assigned: boolean,
) => {
  const target = await withoutPermissionScope(() =>
    models.Users.findOne({ _id: userId }),
  );
  const { createActivityLog } = eventHandlers('core')('organization', 'users');
  const label = `${position.name} at ${entity.title}`;

  createActivityLog(
    buildStructureSeatActivity({
      activityType: assigned
        ? 'structure_seat.assigned'
        : 'structure_seat.unassigned',
      target: buildTarget(target || { _id: userId }),
      context: {
        moduleName: 'organization',
        collectionName: 'structure_seats',
        text: label,
      },
      ids: [seat._id],
      labels: [label],
      metadata: { positionId: position._id, entityId: entity._id },
    }),
  );
};

const seatLeft = async (
  context: IContext,
  seatContext: ISeatContext,
  userIds: string[],
) => {
  for (const userId of userIds) {
    await clearGroupActionsCache({ userId });
    notifySeat(context, seatContext, userId, false);
    await logSeat(context, seatContext, userId, false);
  }
};

const clearSeatHolderCaches = async (
  { models }: IContext,
  seatIds: string[],
) => {
  if (!seatIds.length) {
    return;
  }

  const userIds = await models.StructureEntityMembers.distinct('userId', {
    seatIds: { $in: seatIds },
    ...activeMembershipFilter(),
  });

  await Promise.all(
    userIds.map((userId) => clearGroupActionsCache({ userId })),
  );
};

export const structureMutations = {
  async structureEntityTypesAdd(
    _root: undefined,
    doc: TStructureEntityTypeInput,
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('structureEntityTypesManage');

    return models.StructureEntityTypes.createType(doc, user._id);
  },

  async structureEntityTypesEdit(
    _root: undefined,
    { _id, ...doc }: Partial<TStructureEntityTypeInput> & { _id: string },
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('structureEntityTypesManage');

    return models.StructureEntityTypes.updateType(_id, doc, user._id);
  },

  async structureEntityTypesRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('structureEntityTypesManage');

    return models.StructureEntityTypes.removeType(_id);
  },

  async structureEntitiesAdd(
    _root: undefined,
    doc: IStructureEntityInput,
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('structureEntitiesManage');

    return models.StructureEntities.createEntity(doc, user._id);
  },

  async structureEntitiesEdit(
    _root: undefined,
    { _id, ...doc }: TStructureEntityEditInput & { _id: string },
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('structureEntitiesManage');

    return models.StructureEntities.updateEntity(_id, doc, user._id);
  },

  async structureEntitiesMove(
    _root: undefined,
    { _id, parentId }: { _id: string; parentId: string },
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('structureEntitiesManage');

    return models.StructureEntities.moveEntity(_id, parentId, user._id);
  },

  async structureEntitiesChangeType(
    _root: undefined,
    { _id, typeId }: { _id: string; typeId: string },
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('structureEntitiesManage');

    return models.StructureEntities.changeType(_id, typeId, user._id);
  },

  async structureEntitiesArchive(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('structureEntitiesManage');

    return models.StructureEntities.archiveEntity(_id, user._id);
  },

  async structureEntitiesRestore(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('structureEntitiesManage');

    return models.StructureEntities.restoreEntity(_id, user._id);
  },

  async structureEntityMembersAdd(
    _root: undefined,
    doc: {
      entityId: string;
      userId: string;
      isPrimary?: boolean;
      startsAt?: Date;
      endsAt?: Date;
    },
    context: IContext,
  ) {
    const { models, checkPermission, user } = context;

    await checkPermission('structureEntitiesManage');

    const entity = await models.StructureEntities.getEntity(doc.entityId);

    await assertUsersExist(context, [doc.userId]);
    assertMembershipActor(user, doc.userId);

    const member = await models.StructureEntityMembers.addMember(doc, user._id);

    await clearGroupActionsCache({ userId: doc.userId });
    notifyMembership(context, entity, member, true);
    await logMembership(context, entity, member, true);

    return member;
  },

  async structureEntityMembersEdit(
    _root: undefined,
    {
      _id,
      isPrimary,
      endsAt,
    }: { _id: string; isPrimary?: boolean; endsAt?: Date },
    context: IContext,
  ) {
    const { models, checkPermission, user } = context;

    await checkPermission('structureEntitiesManage');

    const member = await models.StructureEntityMembers.getMember(_id);

    await models.StructureEntities.getEntity(member.entityId);
    assertMembershipActor(user, member.userId);

    if (endsAt !== undefined) {
      for (const seatId of member.seatIds) {
        await assertCanManageSeat(
          models,
          user,
          await models.StructureSeats.getSeat(seatId),
          [member.userId],
        );
      }
    }

    const updated = await models.StructureEntityMembers.updateMember(
      _id,
      { isPrimary, endsAt },
      user._id,
    );

    await clearGroupActionsCache({ userId: member.userId });

    return updated;
  },

  async structureEntityMembersEnd(
    _root: undefined,
    { _id, endsAt }: { _id: string; endsAt?: Date },
    context: IContext,
  ) {
    const { models, checkPermission, user } = context;

    await checkPermission('structureEntitiesManage');

    const member = await models.StructureEntityMembers.getMember(_id);
    const entity = await models.StructureEntities.getEntity(member.entityId);

    assertMembershipActor(user, member.userId);

    const seats: ISeatContext[] = [];

    for (const seatId of member.seatIds) {
      const seatContext = await loadSeatContext(context, seatId);

      await assertCanManageSeat(models, user, seatContext.seat, [
        member.userId,
      ]);
      seats.push(seatContext);
    }

    const ended = await models.StructureEntityMembers.endMember(
      _id,
      user._id,
      endsAt,
    );

    await clearGroupActionsCache({ userId: member.userId });
    notifyMembership(context, entity, ended, false);
    await logMembership(context, entity, ended, false);

    for (const seatContext of seats) {
      await seatLeft(context, seatContext, [member.userId]);
    }

    return ended;
  },

  async structurePositionsAdd(
    _root: undefined,
    doc: IStructurePosition,
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('permissionsManage');

    return models.StructurePositions.createPosition(doc, user._id);
  },

  async structurePositionsEdit(
    _root: undefined,
    { _id, ...doc }: Partial<IStructurePosition> & { _id: string },
    context: IContext,
  ) {
    const { models, checkPermission, user } = context;

    await checkPermission('permissionsManage');

    const position = await models.StructurePositions.updatePosition(
      _id,
      doc,
      user._id,
    );

    if (doc.groupIds !== undefined) {
      await clearSeatHolderCaches(
        context,
        await models.StructureSeats.distinct('_id', { positionId: _id }),
      );
    }

    return position;
  },

  async structurePositionsRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('permissionsManage');

    return models.StructurePositions.removePosition(_id);
  },

  async structureSeatsAdd(
    _root: undefined,
    doc: IStructureSeatInput,
    { models, checkPermission, user }: IContext,
  ) {
    await checkPermission('structureEntitiesManage');

    const normalized = await models.StructureSeats.normalizeSeat(doc);

    await assertCanManageSeat(models, user, normalized);

    return models.StructureSeats.createSeat(normalized, user._id);
  },

  async structureSeatsEdit(
    _root: undefined,
    { _id, ...doc }: TStructureSeatEditInput & { _id: string },
    context: IContext,
  ) {
    const { models, checkPermission, user } = context;

    await checkPermission('structureEntitiesManage');

    const seat = await models.StructureSeats.getSeat(_id);
    const holderIds = await models.StructureSeats.getHolderIds(_id);
    const next = await models.StructureSeats.normalizeSeat({
      positionId: seat.positionId,
      entityId: seat.entityId,
      coverage: doc.coverage || seat.coverage,
      coveredEntityIds: doc.coveredEntityIds ?? seat.coveredEntityIds,
    });

    await assertCanManageSeat(models, user, seat, holderIds);
    await assertCanManageSeat(models, user, next, holderIds);

    const updated = await models.StructureSeats.updateSeat(_id, doc, user._id);

    await clearSeatHolderCaches(context, [_id]);

    return updated;
  },

  async structureSeatsRemove(
    _root: undefined,
    { _id }: { _id: string },
    context: IContext,
  ) {
    const { models, checkPermission, user } = context;

    await checkPermission('structureEntitiesManage');

    const seatContext = await loadSeatContext(context, _id);
    const holderIds = await models.StructureSeats.getHolderIds(_id);

    await assertCanManageSeat(models, user, seatContext.seat, holderIds);

    const removed = await models.StructureSeats.removeSeat(_id);

    await seatLeft(context, seatContext, holderIds);

    return removed;
  },

  async structureSeatHoldersAdd(
    _root: undefined,
    { seatId, userIds }: { seatId: string; userIds: string[] },
    context: IContext,
  ) {
    const { models, checkPermission, user } = context;

    await checkPermission('structureEntitiesManage');

    const seatContext = await loadSeatContext(context, seatId);
    const targetIds = [...new Set(userIds)];

    await assertUsersExist(context, targetIds);
    await assertCanManageSeat(models, user, seatContext.seat, targetIds);

    const holderIds = await models.StructureSeats.getHolderIds(seatId);
    const newHolderIds = targetIds.filter((id) => !holderIds.includes(id));
    const memberIds = await models.StructureEntityMembers.distinct('userId', {
      entityId: seatContext.entity._id,
      userId: { $in: newHolderIds },
      ...activeMembershipFilter(),
    });

    const seat = await models.StructureSeats.addHolders(
      seatId,
      newHolderIds,
      user._id,
    );

    for (const userId of newHolderIds) {
      await clearGroupActionsCache({ userId });

      if (!memberIds.includes(userId)) {
        const member = await models.StructureEntityMembers.findOne({
          entityId: seatContext.entity._id,
          userId,
          ...activeMembershipFilter(),
        });

        if (member) {
          notifyMembership(context, seatContext.entity, member, true);
          await logMembership(context, seatContext.entity, member, true);
        }
      }

      notifySeat(context, seatContext, userId, true);
      await logSeat(context, seatContext, userId, true);
    }

    return seat;
  },

  async structureSeatHoldersRemove(
    _root: undefined,
    { seatId, userId }: { seatId: string; userId: string },
    context: IContext,
  ) {
    const { models, checkPermission, user } = context;

    await checkPermission('structureEntitiesManage');

    const seatContext = await loadSeatContext(context, seatId);

    await assertCanManageSeat(models, user, seatContext.seat, [userId]);

    const seat = await models.StructureSeats.removeHolder(seatId, userId);

    await seatLeft(context, seatContext, [userId]);

    return seat;
  },
};

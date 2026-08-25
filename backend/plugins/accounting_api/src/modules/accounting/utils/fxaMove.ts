import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  JOURNALS,
  TR_DETAIL_FOLLOW_TYPES,
  TR_FOLLOW_TYPES,
  TR_SIDES,
} from '../@types/constants';
import {
  FXA_INSTANCE_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';
import { ITransactionDocument, ITrDetail } from '../@types/transaction';
import { createOrUpdateTr } from './utils';
import {
  cleanFxaFollowTr,
  getFxaMoveFollowInfos,
  getSelectedInstanceSelections,
  getUniqueFxaInstanceIds,
  rebuildFxaInstanceCurrentStates,
} from './fixedAssets';

export const removeFxaMoveInstances = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  const logs = await models.FxaInstanceLogs.findByTransaction(
    transaction._id,
    FXA_LOG_EVENT_TYPES.MOVE,
  );

  if (!logs.length) {
    return;
  }

  const positiveMoveInstanceIds = logs
    .filter((log) => (log.countDelta || 0) > 0)
    .map((log) => log.fxaInstanceId);
  const affectedInstanceIds = logs
    .filter((log) => (log.countDelta || 0) <= 0)
    .map((log) => log.fxaInstanceId);
  const uniquePositiveMoveInstanceIds = getUniqueFxaInstanceIds(
    positiveMoveInstanceIds,
  );

  await models.FxaInstanceLogs.deleteByTransaction(transaction._id);

  const remainingPositiveLogs = uniquePositiveMoveInstanceIds.length
    ? await models.FxaInstanceLogs.find({
        fxaInstanceId: { $in: uniquePositiveMoveInstanceIds },
      })
        .select({ fxaInstanceId: 1 })
        .lean()
    : [];
  const instanceIdsWithRemainingLogs = new Set(
    remainingPositiveLogs.map((log) => log.fxaInstanceId),
  );
  const removableInstanceIds = uniquePositiveMoveInstanceIds.filter(
    (instanceId) => !instanceIdsWithRemainingLogs.has(instanceId),
  );

  await models.FxaInstances.removeByIds(removableInstanceIds);
  await rebuildFxaInstanceCurrentStates(
    models,
    getUniqueFxaInstanceIds([
      ...affectedInstanceIds,
      ...uniquePositiveMoveInstanceIds.filter(
        (instanceId) => !removableInstanceIds.includes(instanceId),
      ),
    ]),
  );
};

export const createFxaMoveInFollowTr = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
) => {
  const followInfos = getFxaMoveFollowInfos(transaction);

  if (!followInfos.moveInBranchId) {
    throw new Error('Move destination branch is required');
  }

  const oldMoveInTr = await cleanFxaFollowTr(
    models,
    transaction._id,
    TR_FOLLOW_TYPES.FXA_MOVE_IN,
  );
  const details = (transaction.details || []).map((detail) => {
    const oldDetail = oldMoveInTr?.details.find(
      (item) => item.originId === detail._id,
    );

    return {
      ...oldDetail,
      originId: detail._id,
      originType: TR_DETAIL_FOLLOW_TYPES.FXA_MOVE_IN,
      fixedAssetId: detail.fixedAssetId,
      accountId: detail.accountId,
      count: detail.count,
      unitPrice: detail.unitPrice,
      amount: detail.amount,
    } as ITrDetail;
  });

  return createOrUpdateTr(
    models,
    userId,
    {
      ...oldMoveInTr,
      originId: transaction._id,
      originType: TR_FOLLOW_TYPES.FXA_MOVE_IN,
      ptrId: oldMoveInTr?.ptrId || transaction.ptrId || nanoid(),
      parentId: transaction.parentId,
      number: transaction.number,
      date: transaction.date,
      description: transaction.description,
      status: transaction.status,
      mentionOwnerId: transaction.mentionOwnerId,
      mentionUserIds: transaction.mentionUserIds,
      branchId: followInfos.moveInBranchId,
      departmentId: followInfos.moveInDepartmentId,
      customerType: transaction.customerType,
      customerId: transaction.customerId,
      journal: JOURNALS.FXA_MOVE_IN,
      side: TR_SIDES.DEBIT,
      details,
    },
    oldMoveInTr,
  );
};

export const syncFxaMoveInstances = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
) => {
  await removeFxaMoveInstances(models, transaction);

  const selections = await getSelectedInstanceSelections(models, transaction);
  const instanceIds = getUniqueFxaInstanceIds(
    selections.map((selection) => selection.fxaInstanceId),
  );

  if (!instanceIds.length) {
    return;
  }

  const date = transaction.date || new Date();
  const moveFollowInfos = getFxaMoveFollowInfos(transaction);
  const destinationBranchId = moveFollowInfos.moveInBranchId;
  const destinationDepartmentId = moveFollowInfos.moveInDepartmentId;

  if (!destinationBranchId) {
    throw new Error('Move destination branch is required');
  }

  const instances = await models.FxaInstances.findByIds(instanceIds);
  const instancesById = new Map(
    instances.map((instance) => [instance._id, instance]),
  );
  const affectedInstanceIds = [...instanceIds];

  for (const selection of selections) {
    const instance = instancesById.get(selection.fxaInstanceId);

    if (!instance) {
      continue;
    }

    const availableCount = instance.currentCount ?? instance.count ?? 1;
    const sourceBranchId = instance.currentBranchId || instance.branchId;
    const sourceDepartmentId =
      instance.currentDepartmentId || instance.departmentId;
    const sourceResponsibleUserId =
      instance.currentResponsibleUserId || instance.responsibleUserId;
    const sourceStatus = instance.currentStatus || instance.status;

    await models.FxaInstanceLogs.createLog({
      fxaInstanceId: instance._id,
      fixedAssetId: instance.fixedAssetId,
      eventType: FXA_LOG_EVENT_TYPES.MOVE,
      eventDate: date,
      transactionId: transaction._id,
      countDelta: -selection.count,
      fromBranchId: sourceBranchId,
      toBranchId: sourceBranchId,
      fromDepartmentId: sourceDepartmentId,
      toDepartmentId: sourceDepartmentId,
      fromResponsibleUserId: sourceResponsibleUserId,
      toResponsibleUserId: sourceResponsibleUserId,
      fromStatus: sourceStatus,
      toStatus:
        selection.count >= availableCount
          ? FXA_INSTANCE_STATUSES.INACTIVE
          : sourceStatus || FXA_INSTANCE_STATUSES.ACTIVE,
      createdBy: userId,
      createdAt: new Date(),
    });

    const movedInstance = await models.FxaInstances.findOrCreateMovementBucket({
      sourceInstance: instance,
      branchId: destinationBranchId,
      departmentId: destinationDepartmentId,
      responsibleUserId: sourceResponsibleUserId,
      userId,
    });

    affectedInstanceIds.push(movedInstance._id);

    await models.FxaInstanceLogs.createLog({
      fxaInstanceId: movedInstance._id,
      fixedAssetId: movedInstance.fixedAssetId,
      eventType: FXA_LOG_EVENT_TYPES.MOVE,
      eventDate: date,
      transactionId: transaction._id,
      countDelta: selection.count,
      fromBranchId: sourceBranchId,
      toBranchId: destinationBranchId,
      fromDepartmentId: sourceDepartmentId,
      toDepartmentId: destinationDepartmentId,
      fromResponsibleUserId: sourceResponsibleUserId,
      toResponsibleUserId: sourceResponsibleUserId,
      fromStatus: sourceStatus,
      toStatus: FXA_INSTANCE_STATUSES.ACTIVE,
      createdBy: userId,
      createdAt: new Date(),
    });
  }

  await rebuildFxaInstanceCurrentStates(models, affectedInstanceIds);
};

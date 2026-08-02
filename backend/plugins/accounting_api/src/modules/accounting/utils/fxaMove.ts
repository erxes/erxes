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
  getSelectedInstanceIds,
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

  for (const log of logs) {
    await models.FxaInstances.restoreMoveInstance(log.fxaInstanceId, {
      branchId: log.fromBranchId,
      departmentId: log.fromDepartmentId,
      responsibleUserId: log.fromResponsibleUserId,
      status: log.fromStatus || FXA_INSTANCE_STATUSES.ACTIVE,
    });
  }

  await models.FxaInstanceLogs.deleteByTransaction(transaction._id);
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

  const instanceIds = await getSelectedInstanceIds(models, transaction);

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

  for (const instance of instances) {
    await models.FxaInstances.applyMove({
      instanceId: instance._id,
      branchId: destinationBranchId,
      departmentId: destinationDepartmentId,
      transactionId: transaction._id,
      userId,
    });

    await models.FxaInstanceLogs.createLog({
      fxaInstanceId: instance._id,
      fixedAssetId: instance.fixedAssetId,
      eventType: FXA_LOG_EVENT_TYPES.MOVE,
      eventDate: date,
      transactionId: transaction._id,
      fromBranchId: instance.branchId,
      toBranchId: destinationBranchId,
      fromDepartmentId: instance.departmentId,
      toDepartmentId: destinationDepartmentId,
      fromResponsibleUserId: instance.responsibleUserId,
      toResponsibleUserId: instance.responsibleUserId,
      fromStatus: instance.status,
      toStatus: instance.status,
      createdBy: userId,
      createdAt: new Date(),
    });
  }
};

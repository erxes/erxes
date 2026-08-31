import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  JOURNALS,
  TR_DETAIL_FOLLOW_TYPES,
  TR_FOLLOW_TYPES,
  TR_SIDES,
} from '../@types/constants';
import { ITransactionDocument, ITrDetail } from '../@types/transaction';
import { createOrUpdateTr } from './utils';
import {
  cleanFxaFollowTr,
  getFxaMoveFollowInfos,
  getUniqueFxaOwnerRecordIds,
  rebuildFixedAssetCurrentCounts,
  removeFxaOwnerRecordsByTransaction,
  syncFxaOwnerRecordMovements,
} from './fixedAssets';
import {
  FXA_OWNER_RECORD_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';

export const removeFxaMoveInstances = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  await removeFxaOwnerRecordsByTransaction(models, transaction);
};

export const createFxaMoveInFollowTr = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
) => {
  const followInfos = getFxaMoveFollowInfos(transaction);

  if (!followInfos.moveInBranchId && !followInfos.moveInDepartmentId) {
    throw new Error('Move destination branch or department is required');
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
  await syncFxaOwnerRecordMovements({
    eventType: FXA_LOG_EVENT_TYPES.MOVE,
    models,
    status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
    transaction,
    userId,
  });

  await rebuildFixedAssetCurrentCounts(
    models,
    getUniqueFxaOwnerRecordIds(
      (transaction.details || [])
        .map((detail) => detail.fixedAssetId)
        .filter((fixedAssetId): fixedAssetId is string =>
          Boolean(fixedAssetId),
        ),
    ),
  );
};

import { nanoid } from 'nanoid';
import { fixNum } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  JOURNALS,
  TR_DETAIL_FOLLOW_TYPES,
  TR_FOLLOW_TYPES,
  TR_SIDES,
} from '../@types/constants';
import {
  ITransaction,
  ITransactionDocument,
  ITrDetail,
} from '../@types/transaction';
import { createOrUpdateTr } from './utils';
import {
  cleanFxaFollowTr,
  getFxaDisposalSummaries,
  getFxaMoveFollowInfos,
  getUniqueFxaOwnerRecordIds,
  rebuildFixedAssetCurrentCounts,
  removeFxaOwnerRecordsByTransaction,
  syncFxaOwnerRecordMovements,
  TFxaDisposalSummary,
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

const cleanGeneratedDetailBase = (detail?: ITrDetail) => {
  if (!detail) {
    return {};
  }

  const cleaned = { ...detail };
  cleaned.followInfos = undefined;
  return cleaned;
};

const cleanGeneratedTransactionBase = (
  transaction?: ITransactionDocument | null,
) => {
  if (!transaction) {
    return {};
  }

  const cleaned = { ...transaction };
  cleaned.contentId = undefined;
  cleaned.contentType = undefined;
  cleaned.extraData = undefined;
  cleaned.followInfos = undefined;
  return cleaned;
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
      ...cleanGeneratedDetailBase(oldDetail),
      originId: detail._id,
      originType: TR_DETAIL_FOLLOW_TYPES.FXA_MOVE_IN,
      fixedAssetId: detail.fixedAssetId,
      accountId: detail.accountId,
      branchId: followInfos.moveInBranchId,
      departmentId: followInfos.moveInDepartmentId,
      count: detail.count,
      unitPrice: detail.unitPrice,
      amount: detail.amount,
    } as ITrDetail;
  });

  return createOrUpdateTr(
    models,
    userId,
    {
      ...cleanGeneratedTransactionBase(oldMoveInTr),
      originId: transaction._id,
      originType: TR_FOLLOW_TYPES.FXA_MOVE_IN,
      ptrId: transaction.ptrId || oldMoveInTr?.ptrId || nanoid(),
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

const deleteEmptyFxaFollowTr = async (
  models: IModels,
  oldTr?: ITransactionDocument | null,
) => {
  if (!oldTr?._id) {
    return;
  }

  await models.Transactions.deleteMany({ _id: oldTr._id });
};

const buildFxaMoveDepreciationDetails = ({
  accountId,
  branchId,
  departmentId,
  oldTr,
  originType,
  summaries,
}: {
  accountId?: string;
  branchId?: string;
  departmentId?: string;
  oldTr?: ITransactionDocument | null;
  originType: string;
  summaries: TFxaDisposalSummary[];
}) =>
  summaries
    .filter((summary) => summary.accumulatedDepreciation > 0)
    .map((summary) => {
      const oldDetail = oldTr?.details.find(
        (detail) => detail.originId === summary.detailId,
      );

      return {
        ...cleanGeneratedDetailBase(oldDetail),
        originId: summary.detailId,
        originType,
        fixedAssetId: summary.fixedAssetId,
        accountId: accountId || '',
        branchId,
        departmentId,
        count: summary.count,
        unitPrice: summary.count
          ? fixNum(summary.accumulatedDepreciation / summary.count)
          : 0,
        amount: summary.accumulatedDepreciation,
      } as ITrDetail;
    });

const buildFxaMoveDepreciationTrDoc = ({
  branchId,
  departmentId,
  details,
  journal,
  oldTr,
  originType,
  ptrId,
  side,
  transaction,
}: {
  branchId?: string;
  departmentId?: string;
  details: ITrDetail[];
  journal: string;
  oldTr?: ITransactionDocument | null;
  originType: string;
  ptrId: string;
  side: string;
  transaction: ITransactionDocument;
}): ITransaction => ({
  ...cleanGeneratedTransactionBase(oldTr),
  originId: transaction._id,
  originType,
  ptrId,
  parentId: transaction.parentId,
  number: transaction.number,
  date: transaction.date,
  description: transaction.description,
  status: transaction.status,
  mentionOwnerId: transaction.mentionOwnerId,
  mentionUserIds: transaction.mentionUserIds,
  branchId,
  departmentId,
  customerType: transaction.customerType,
  customerId: transaction.customerId,
  journal,
  side,
  details,
});

export const createFxaMoveDepreciationFollowTrs = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
) => {
  const followInfos = getFxaMoveFollowInfos(transaction);

  if (!followInfos.moveInBranchId && !followInfos.moveInDepartmentId) {
    throw new Error('Move destination branch or department is required');
  }

  const summaries = await getFxaDisposalSummaries(models, transaction);
  const hasDepreciation = summaries.some(
    (summary) => summary.accumulatedDepreciation > 0,
  );

  const [oldOutTr, oldInTr] = await Promise.all([
    cleanFxaFollowTr(models, transaction._id, TR_FOLLOW_TYPES.FXA_DEP_OUT),
    cleanFxaFollowTr(models, transaction._id, TR_FOLLOW_TYPES.FXA_DEP_IN),
  ]);

  if (!hasDepreciation) {
    await Promise.all([
      deleteEmptyFxaFollowTr(models, oldOutTr),
      deleteEmptyFxaFollowTr(models, oldInTr),
    ]);

    return [];
  }

  if (!followInfos.accumulatedDepreciationAccountId) {
    throw new Error('Accumulated depreciation account is required');
  }

  const outDetails = buildFxaMoveDepreciationDetails({
    accountId: followInfos.accumulatedDepreciationAccountId,
    branchId: transaction.branchId,
    departmentId: transaction.departmentId,
    oldTr: oldOutTr,
    originType: TR_DETAIL_FOLLOW_TYPES.FXA_DEP_OUT,
    summaries,
  });
  const inDetails = buildFxaMoveDepreciationDetails({
    accountId: followInfos.accumulatedDepreciationAccountId,
    branchId: followInfos.moveInBranchId,
    departmentId: followInfos.moveInDepartmentId,
    oldTr: oldInTr,
    originType: TR_DETAIL_FOLLOW_TYPES.FXA_DEP_IN,
    summaries,
  });
  const ptrId =
    transaction.ptrId || oldOutTr?.ptrId || oldInTr?.ptrId || nanoid();

  // Дотоод хөдөлгөөнд хуримтлагдсан элэгдэл хөрөнгөө дагаж
  // хуучин байршлаас debit, шинэ байршил руу credit болж шилжинэ.
  return Promise.all([
    createOrUpdateTr(
      models,
      userId,
      buildFxaMoveDepreciationTrDoc({
        branchId: transaction.branchId,
        departmentId: transaction.departmentId,
        details: outDetails,
        journal: JOURNALS.FXA_DEP_OUT,
        oldTr: oldOutTr,
        originType: TR_FOLLOW_TYPES.FXA_DEP_OUT,
        ptrId,
        side: TR_SIDES.DEBIT,
        transaction,
      }),
      oldOutTr,
    ),
    createOrUpdateTr(
      models,
      userId,
      buildFxaMoveDepreciationTrDoc({
        branchId: followInfos.moveInBranchId,
        departmentId: followInfos.moveInDepartmentId,
        details: inDetails,
        journal: JOURNALS.FXA_DEP_IN,
        oldTr: oldInTr,
        originType: TR_FOLLOW_TYPES.FXA_DEP_IN,
        ptrId,
        side: TR_SIDES.CREDIT,
        transaction,
      }),
      oldInTr,
    ),
  ]);
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

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
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';
import {
  ITransaction,
  ITransactionDocument,
  ITrDetail,
} from '../@types/transaction';
import { createOrUpdateTr } from './utils';
import {
  cleanFxaFollowTr,
  getFxaDisposalFollowInfos,
  getFxaDisposalSummaries,
  getSelectedInstanceSelections,
  getUniqueFxaInstanceIds,
  rebuildFxaInstanceCurrentStates,
  TFxaDisposalSummary,
  validateFxaDisposalAccounts,
} from './fixedAssets';

export const removeFxaDisposalInstances = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  const logs = await models.FxaInstanceLogs.findByTransaction(transaction._id, [
    FXA_LOG_EVENT_TYPES.DISPOSAL,
    FXA_LOG_EVENT_TYPES.SALE,
  ]);
  const instanceIds = getUniqueFxaInstanceIds(
    logs.map((log) => log.fxaInstanceId),
  );

  await models.FxaInstanceLogs.deleteByTransaction(transaction._id);
  await rebuildFxaInstanceCurrentStates(models, instanceIds);
};

const buildFxaDisposalFollowDetails = ({
  accountId,
  amountKey,
  oldTr,
  originType,
  summaries,
}: {
  accountId?: string;
  amountKey: 'originalCost' | 'accumulatedDepreciation' | 'bookValue';
  oldTr?: ITransactionDocument | null;
  originType: string;
  summaries: TFxaDisposalSummary[];
}) =>
  summaries
    .filter((summary) => summary[amountKey] > 0)
    .map((summary) => {
      const oldDetail = oldTr?.details.find(
        (detail) => detail.originId === summary.detailId,
      );

      return {
        ...oldDetail,
        originId: summary.detailId,
        originType,
        fixedAssetId: summary.fixedAssetId,
        accountId: accountId || '',
        count: summary.count,
        unitPrice: summary.count
          ? fixNum(summary[amountKey] / summary.count)
          : 0,
        amount: summary[amountKey],
      } as ITrDetail;
    });

const buildFxaDisposalFollowTrDoc = ({
  details,
  journal,
  oldTr,
  originType,
  ptrId,
  side = TR_SIDES.DEBIT,
  transaction,
}: {
  details: ITrDetail[];
  journal: string;
  oldTr?: ITransactionDocument | null;
  originType: string;
  ptrId: string;
  side?: string;
  transaction: ITransactionDocument;
}): ITransaction => ({
  ...oldTr,
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
  branchId: transaction.branchId,
  departmentId: transaction.departmentId,
  customerType: transaction.customerType,
  customerId: transaction.customerId,
  journal,
  side,
  details,
});

const deleteEmptyFxaFollowTr = async (
  models: IModels,
  oldTr?: ITransactionDocument | null,
) => {
  if (!oldTr?._id) {
    return;
  }

  await models.Transactions.deleteMany({ _id: oldTr._id });
};

export const createFxaDisposalFollowTrs = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
) => {
  const summaries = await getFxaDisposalSummaries(models, transaction);
  validateFxaDisposalAccounts(transaction, summaries);

  const [oldCostTr, oldDepreciationTr, oldLossTr] = await Promise.all([
    cleanFxaFollowTr(models, transaction._id, TR_FOLLOW_TYPES.FXA_OUT_COST),
    cleanFxaFollowTr(
      models,
      transaction._id,
      TR_FOLLOW_TYPES.FXA_OUT_DEPRECIATION,
    ),
    cleanFxaFollowTr(models, transaction._id, TR_FOLLOW_TYPES.FXA_OUT_LOSS),
  ]);
  const ptrId =
    oldCostTr?.ptrId ||
    oldDepreciationTr?.ptrId ||
    oldLossTr?.ptrId ||
    nanoid();
  const followInfos = getFxaDisposalFollowInfos(transaction);
  const isSale = transaction.journal === JOURNALS.FXA_SALE;
  const costDetails = isSale
    ? buildFxaDisposalFollowDetails({
        accountId: followInfos.fixedAssetAccountId,
        amountKey: 'originalCost',
        oldTr: oldCostTr,
        originType: TR_DETAIL_FOLLOW_TYPES.FXA_OUT_COST,
        summaries,
      })
    : [];
  const depreciationDetails = buildFxaDisposalFollowDetails({
    accountId: followInfos.accumulatedDepreciationAccountId,
    amountKey: 'accumulatedDepreciation',
    oldTr: oldDepreciationTr,
    originType: TR_DETAIL_FOLLOW_TYPES.FXA_OUT_DEPRECIATION,
    summaries,
  });
  const lossDetails = buildFxaDisposalFollowDetails({
    accountId: followInfos.lossAccountId,
    amountKey: 'bookValue',
    oldTr: oldLossTr,
    originType: TR_DETAIL_FOLLOW_TYPES.FXA_OUT_LOSS,
    summaries,
  });
  const followTrs: ITransactionDocument[] = [];

  if (costDetails.length) {
    followTrs.push(
      await createOrUpdateTr(
        models,
        userId,
        buildFxaDisposalFollowTrDoc({
          details: costDetails,
          journal: JOURNALS.FXA_OUT_COST,
          oldTr: oldCostTr,
          originType: TR_FOLLOW_TYPES.FXA_OUT_COST,
          ptrId,
          side: TR_SIDES.CREDIT,
          transaction,
        }),
        oldCostTr,
      ),
    );
  } else {
    await deleteEmptyFxaFollowTr(models, oldCostTr);
  }

  if (depreciationDetails.length) {
    followTrs.push(
      await createOrUpdateTr(
        models,
        userId,
        buildFxaDisposalFollowTrDoc({
          details: depreciationDetails,
          journal: JOURNALS.FXA_OUT_DEPRECIATION,
          oldTr: oldDepreciationTr,
          originType: TR_FOLLOW_TYPES.FXA_OUT_DEPRECIATION,
          ptrId,
          transaction,
        }),
        oldDepreciationTr,
      ),
    );
  } else {
    await deleteEmptyFxaFollowTr(models, oldDepreciationTr);
  }

  if (lossDetails.length) {
    followTrs.push(
      await createOrUpdateTr(
        models,
        userId,
        buildFxaDisposalFollowTrDoc({
          details: lossDetails,
          journal: JOURNALS.FXA_OUT_LOSS,
          oldTr: oldLossTr,
          originType: TR_FOLLOW_TYPES.FXA_OUT_LOSS,
          ptrId,
          transaction,
        }),
        oldLossTr,
      ),
    );
  } else {
    await deleteEmptyFxaFollowTr(models, oldLossTr);
  }

  return followTrs;
};

export const syncFxaDisposalInstances = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
  eventType: string,
  status: string,
) => {
  await removeFxaDisposalInstances(models, transaction);

  const selections = await getSelectedInstanceSelections(models, transaction);
  const instanceIds = getUniqueFxaInstanceIds(
    selections.map((selection) => selection.fxaInstanceId),
  );

  if (!instanceIds.length) {
    return;
  }

  const date = transaction.date || new Date();
  const instances = await models.FxaInstances.findByIds(instanceIds);
  const instancesById = new Map(
    instances.map((instance) => [instance._id, instance]),
  );

  for (const selection of selections) {
    const instance = instancesById.get(selection.fxaInstanceId);

    if (!instance) {
      continue;
    }

    await models.FxaInstanceLogs.createLog({
      fxaInstanceId: instance._id,
      fixedAssetId: instance.fixedAssetId,
      eventType,
      eventDate: date,
      countDelta: -selection.count,
      transactionId: transaction._id,
      fromBranchId: instance.currentBranchId || instance.branchId,
      toBranchId: instance.currentBranchId || instance.branchId,
      fromDepartmentId: instance.currentDepartmentId || instance.departmentId,
      toDepartmentId: instance.currentDepartmentId || instance.departmentId,
      fromResponsibleUserId:
        instance.currentResponsibleUserId || instance.responsibleUserId,
      toResponsibleUserId:
        instance.currentResponsibleUserId || instance.responsibleUserId,
      fromStatus: instance.currentStatus || instance.status,
      toStatus: status,
      createdBy: userId,
      createdAt: new Date(),
    });
  }

  await rebuildFxaInstanceCurrentStates(models, instanceIds);
};

import { fixNum } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  FXA_INSTANCE_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';
import { IFixedAsset } from '@/fixedAssets/@types/fixedAsset';
import { ITransaction, ITransactionDocument } from '../@types/transaction';

export type TFxaInstanceInput = {
  _id?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId?: string;
  primaryInstanceId?: string;
  code?: string;
  sequence?: number;
  count?: number;
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
  originalCost?: number;
  depreciationStartDate?: Date;
};

export type TFxaIncomeInstanceFollowInfo = Pick<
  TFxaInstanceInput,
  | '_id'
  | 'tempId'
  | 'transactionDetailId'
  | 'fixedAssetId'
  | 'code'
  | 'sequence'
> & {
  salvageValue?: number;
  openingAccumulatedDepreciation?: number;
};

export type TFixedAssetSnapshot = Pick<
  IFixedAsset,
  | 'categoryId'
  | 'code'
  | 'depreciationMethod'
  | 'usefulLife'
  | 'salvageValue'
  | 'taxDepreciationMethod'
  | 'taxUsefulLife'
  | 'taxSalvageValue'
> & {
  _id: string;
};

export type TFxaTransactionExtraData = {
  fxaInstances?: TFxaInstanceInput[];
  fxaInstanceIds?: string[];
  fxaInstanceIdsByDetailId?: Record<string, string[]>;
  fxaInstanceSelections?: TFxaInstanceSelection[];
  fxaInstanceSelectionsByDetailId?: Record<string, TFxaInstanceSelection[]>;
};

export type TFxaInstanceSelection = {
  fxaInstanceId: string;
  count: number;
};

export type TFxaMoveFollowInfos = {
  moveInBranchId?: string;
  moveInDepartmentId?: string;
};

export type TFxaIncomeFollowInfos = {
  fxaIncomeInstances?: TFxaIncomeInstanceFollowInfo[];
};

export type TFxaDisposalFollowInfos = TFxaMoveFollowInfos & {
  fixedAssetAccountId?: string;
  accumulatedDepreciationAccountId?: string;
  lossAccountId?: string;
};

export type TFxaDisposalSummary = {
  detailId?: string;
  fixedAssetId?: string;
  count: number;
  originalCost: number;
  accumulatedDepreciation: number;
  bookValue: number;
};

export type TFxaIncomeInstanceRemoveOptions = {
  detailIds?: string[];
  validateOnly?: boolean;
};

export const getFxaExtraData = (
  transaction: ITransaction | ITransactionDocument,
): TFxaTransactionExtraData => transaction.extraData || {};

export const getFxaMoveFollowInfos = (
  transaction: ITransaction | ITransactionDocument,
): TFxaMoveFollowInfos => transaction.followInfos || {};

export const getFxaDisposalFollowInfos = (
  transaction: ITransaction | ITransactionDocument,
): TFxaDisposalFollowInfos => transaction.followInfos || {};

export const getFxaInstanceInputs = (transaction: ITransactionDocument) =>
  getFxaExtraData(transaction).fxaInstances || [];

export const getFxaIncomeFollowInfos = (
  transaction: ITransaction | ITransactionDocument,
): TFxaIncomeFollowInfos => transaction.followInfos || {};

export const getUniqueFxaInstanceIds = (ids: string[]) =>
  Array.from(new Set(ids));

export const getFxaInstanceIdsByDetailId = (
  transaction: ITransaction | ITransactionDocument,
) => getFxaExtraData(transaction).fxaInstanceIdsByDetailId || {};

const getLegacyFlatSelectedFxaInstanceIds = (
  transaction: ITransaction | ITransactionDocument,
) => {
  const idsByDetailId = getFxaInstanceIdsByDetailId(transaction);
  const mappedIds = Object.values(idsByDetailId).flat();

  if (mappedIds.length) {
    return getUniqueFxaInstanceIds(mappedIds);
  }

  return getUniqueFxaInstanceIds(
    getFxaExtraData(transaction).fxaInstanceIds || [],
  );
};

export const getFlatSelectedFxaInstanceIds = (
  transaction: ITransaction | ITransactionDocument,
) => {
  const selections = getFlatFxaInstanceSelections(transaction);

  if (selections.length) {
    return getUniqueFxaInstanceIds(
      selections.map((selection) => selection.fxaInstanceId),
    );
  }

  return getLegacyFlatSelectedFxaInstanceIds(transaction);
};

const normalizeFxaInstanceSelection = (
  selection: TFxaInstanceSelection,
): TFxaInstanceSelection | undefined => {
  const count = Math.max(0, Math.trunc(selection.count || 0));

  if (!selection.fxaInstanceId || count <= 0) {
    return;
  }

  return {
    fxaInstanceId: selection.fxaInstanceId,
    count,
  };
};

export const getFxaInstanceSelectionsByDetailId = (
  transaction: ITransaction | ITransactionDocument,
) => getFxaExtraData(transaction).fxaInstanceSelectionsByDetailId || {};

export const getFxaInstanceSelectionsForDetail = (
  transaction: ITransaction | ITransactionDocument,
  detailId?: string,
) => {
  if (!detailId) {
    return [];
  }

  const selections = getFxaInstanceSelectionsByDetailId(transaction)[detailId];

  if (selections?.length) {
    return selections
      .map(normalizeFxaInstanceSelection)
      .filter((selection): selection is TFxaInstanceSelection =>
        Boolean(selection),
      );
  }

  return (getFxaInstanceIdsByDetailId(transaction)[detailId] || []).map(
    (fxaInstanceId) => ({
      fxaInstanceId,
      count: 1,
    }),
  );
};

export const getFlatFxaInstanceSelections = (
  transaction: ITransaction | ITransactionDocument,
) => {
  const selectionsByDetailId = getFxaInstanceSelectionsByDetailId(transaction);
  const mappedSelections = Object.values(selectionsByDetailId)
    .flat()
    .map(normalizeFxaInstanceSelection)
    .filter((selection): selection is TFxaInstanceSelection =>
      Boolean(selection),
    );

  if (mappedSelections.length) {
    return mappedSelections;
  }

  const selections = getFxaExtraData(transaction).fxaInstanceSelections || [];

  if (selections.length) {
    return selections
      .map(normalizeFxaInstanceSelection)
      .filter((selection): selection is TFxaInstanceSelection =>
        Boolean(selection),
      );
  }

  return getLegacyFlatSelectedFxaInstanceIds(transaction).map(
    (fxaInstanceId) => ({
      fxaInstanceId,
      count: 1,
    }),
  );
};

export const getMapTotalCount = (countsByAsset: Map<string, number>) =>
  Array.from(countsByAsset.values()).reduce((sum, count) => sum + count, 0);

export const getExpectedInstanceCountsByAsset = (
  transaction: ITransaction | ITransactionDocument,
) => {
  const expectedByAsset = new Map<string, number>();

  for (const detail of transaction.details || []) {
    if (!detail.fixedAssetId) {
      continue;
    }

    expectedByAsset.set(
      detail.fixedAssetId,
      (expectedByAsset.get(detail.fixedAssetId) || 0) +
        Math.max(0, Math.trunc(detail.count || 0)),
    );
  }

  return expectedByAsset;
};

export const getSelectedInstanceCountsByAsset = (
  selections: TFxaInstanceSelection[],
  instances: Array<{ _id: string; fixedAssetId?: string }>,
) => {
  const selectedByAsset = new Map<string, number>();
  const instancesById = new Map(
    instances.map((instance) => [instance._id, instance]),
  );

  for (const selection of selections) {
    const instance = instancesById.get(selection.fxaInstanceId);

    if (!instance?.fixedAssetId) {
      continue;
    }

    selectedByAsset.set(
      instance.fixedAssetId,
      (selectedByAsset.get(instance.fixedAssetId) || 0) + selection.count,
    );
  }

  return selectedByAsset;
};

export const getDetailId = (detail: { _id?: string }) =>
  detail._id?.toString() || '';

export const getSelectedInstanceIds = async (
  models: IModels,
  transaction: ITransaction | ITransactionDocument,
) => {
  return (await getSelectedInstanceSelections(models, transaction)).map(
    (selection) => selection.fxaInstanceId,
  );
};

export const getSelectedInstanceSelections = async (
  models: IModels,
  transaction: ITransaction | ITransactionDocument,
) => {
  const selections = getFlatFxaInstanceSelections(transaction);
  const uniqueIds = getUniqueFxaInstanceIds(
    selections.map((selection) => selection.fxaInstanceId),
  );
  const expectedByAsset = getExpectedInstanceCountsByAsset(transaction);
  const expectedCount = getMapTotalCount(expectedByAsset);
  const selectedCount = selections.reduce(
    (sum, selection) => sum + selection.count,
    0,
  );

  if (expectedCount !== selectedCount) {
    throw new Error(
      'Selected fixed asset instance counts must match detail counts',
    );
  }

  const instances = await models.FxaInstances.findByIds(uniqueIds);
  const transactionLogs = transaction._id
    ? await models.FxaInstanceLogs.findByTransaction(transaction._id, [
        FXA_LOG_EVENT_TYPES.DISPOSAL,
        FXA_LOG_EVENT_TYPES.SALE,
        FXA_LOG_EVENT_TYPES.MOVE,
      ])
    : [];
  const transactionInstanceIds = new Set(
    transactionLogs.map((log) => log.fxaInstanceId),
  );
  const transactionReleasedCountByInstanceId = transactionLogs.reduce(
    (map, log) =>
      map.set(
        log.fxaInstanceId,
        (map.get(log.fxaInstanceId) || 0) - Math.min(log.countDelta || 0, 0),
      ),
    new Map<string, number>(),
  );
  const availableInstances = instances.filter(
    (instance) =>
      (instance.currentStatus || instance.status) ===
        FXA_INSTANCE_STATUSES.ACTIVE ||
      transactionInstanceIds.has(instance._id),
  );

  if (availableInstances.length !== uniqueIds.length) {
    throw new Error('Selected fixed asset instances are not available');
  }

  const instancesById = new Map(
    availableInstances.map((instance) => [instance._id, instance]),
  );

  for (const detail of transaction.details || []) {
    const detailSelections = getFxaInstanceSelectionsForDetail(
      transaction,
      detail._id,
    );

    if (!detailSelections.length) {
      continue;
    }

    if (detailSelections.length > 1) {
      throw new Error(
        'Only one fixed asset instance can be selected for each detail',
      );
    }

    const [selection] = detailSelections;
    const instance = instancesById.get(selection.fxaInstanceId);
    const detailCount = Math.max(0, Math.trunc(detail.count || 0));

    if (selection.count !== detailCount) {
      throw new Error(
        'Selected fixed asset instance count must match detail count',
      );
    }

    if (instance?.fixedAssetId !== detail.fixedAssetId) {
      throw new Error('Selected fixed asset instance must match detail asset');
    }
  }

  for (const selection of selections) {
    const instance = instancesById.get(selection.fxaInstanceId);
    const availableCount =
      (instance?.currentCount ?? instance?.count ?? 1) +
      (transactionReleasedCountByInstanceId.get(selection.fxaInstanceId) || 0);

    if (!instance || selection.count > availableCount) {
      throw new Error('Selected fixed asset instance count is not available');
    }
  }

  const selectedByAsset = getSelectedInstanceCountsByAsset(
    selections,
    availableInstances,
  );

  for (const [fixedAssetId, count] of expectedByAsset) {
    if ((selectedByAsset.get(fixedAssetId) || 0) !== count) {
      throw new Error('Selected instances must match each fixed asset detail');
    }
  }

  return selections;
};

export const rebuildFxaInstanceCurrentStates = async (
  models: IModels,
  instanceIds: string[],
) => {
  const uniqueIds = getUniqueFxaInstanceIds(instanceIds).filter(Boolean);

  if (!uniqueIds.length) {
    return;
  }

  const [instances, logs] = await Promise.all([
    models.FxaInstances.findByIds(uniqueIds),
    models.FxaInstanceLogs.find({ fxaInstanceId: { $in: uniqueIds } })
      .sort({ eventDate: 1, createdAt: 1 })
      .lean(),
  ]);
  const logsByInstanceId = new Map<string, typeof logs>();

  for (const log of logs) {
    logsByInstanceId.set(log.fxaInstanceId, [
      ...(logsByInstanceId.get(log.fxaInstanceId) || []),
      log,
    ]);
  }

  for (const instance of instances) {
    const instanceLogs = logsByInstanceId.get(instance._id) || [];
    const hasCountLogs = instanceLogs.some(
      (log) => typeof log.countDelta === 'number',
    );
    const currentCount = hasCountLogs
      ? fixNum(
          instanceLogs.reduce((sum, log) => sum + (log.countDelta || 0), 0),
        )
      : instance.currentCount ?? instance.count ?? 1;
    const latestLog = instanceLogs[instanceLogs.length - 1];
    const currentStatus =
      currentCount <= 0
        ? latestLog?.toStatus || FXA_INSTANCE_STATUSES.DISPOSED
        : FXA_INSTANCE_STATUSES.ACTIVE;
    const currentBranchId = latestLog?.toBranchId || instance.branchId;
    const currentDepartmentId =
      latestLog?.toDepartmentId || instance.departmentId;
    const currentResponsibleUserId =
      latestLog?.toResponsibleUserId || instance.responsibleUserId;
    const $set: Record<string, string | number | Date> = {
      currentCount,
      currentStatus,
      status: currentStatus,
      updatedAt: new Date(),
    };
    const $unset: Record<string, string> = {};

    if (currentBranchId) {
      $set.currentBranchId = currentBranchId;
      $set.branchId = currentBranchId;
    } else {
      $unset.currentBranchId = '';
      $unset.branchId = '';
    }

    if (currentDepartmentId) {
      $set.currentDepartmentId = currentDepartmentId;
      $set.departmentId = currentDepartmentId;
    } else {
      $unset.currentDepartmentId = '';
      $unset.departmentId = '';
    }

    if (currentResponsibleUserId) {
      $set.currentResponsibleUserId = currentResponsibleUserId;
      $set.responsibleUserId = currentResponsibleUserId;
    } else {
      $unset.currentResponsibleUserId = '';
      $unset.responsibleUserId = '';
    }

    await models.FxaInstances.updateOne(
      { _id: instance._id },
      {
        $set,
        ...(Object.keys($unset).length ? { $unset } : {}),
      },
    );
  }
};

const getLatestAdjustmentDetailsByInstanceId = async (
  models: IModels,
  instanceIds: string[],
) => {
  const details = await models.AdjustFxaDetails.find({
    fxaInstanceId: { $in: instanceIds },
  })
    .sort({ createdAt: -1 })
    .lean();
  const detailsByInstanceId = new Map<string, (typeof details)[number]>();

  for (const detail of details) {
    if (!detailsByInstanceId.has(detail.fxaInstanceId)) {
      detailsByInstanceId.set(detail.fxaInstanceId, detail);
    }
  }

  return detailsByInstanceId;
};

export const getFxaDisposalSummaries = async (
  models: IModels,
  transaction: ITransaction | ITransactionDocument,
) => {
  const selections = await getSelectedInstanceSelections(models, transaction);
  const instanceIds = getUniqueFxaInstanceIds(
    selections.map((selection) => selection.fxaInstanceId),
  );
  const instances = await models.FxaInstances.findByIds(instanceIds);
  const instancesById = new Map(
    instances.map((instance) => [instance._id, instance]),
  );
  const adjustmentDetails = await getLatestAdjustmentDetailsByInstanceId(
    models,
    instanceIds,
  );

  return (transaction.details || [])
    .map((detail) => {
      const detailSelections = getFxaInstanceSelectionsForDetail(
        transaction,
        detail._id,
      );
      const matchedSelections = detailSelections.length
        ? detailSelections
        : selections.filter((selection) => {
            const instance = instancesById.get(selection.fxaInstanceId);

            return instance?.fixedAssetId === detail.fixedAssetId;
          });
      const accumulatedDepreciation = fixNum(
        matchedSelections.reduce((sum, selection) => {
          const instance = instancesById.get(selection.fxaInstanceId);

          if (!instance) {
            return sum;
          }

          return (
            sum +
            (adjustmentDetails.get(instance._id)
              ?.closingAccumulatedDepreciation || 0) *
              selection.count
          );
        }, 0),
      );
      const originalCost = fixNum(
        matchedSelections.reduce((sum, selection) => {
          const instance = instancesById.get(selection.fxaInstanceId);

          return sum + (instance?.originalCost || 0) * selection.count;
        }, 0),
      );
      const count = matchedSelections.reduce(
        (sum, selection) => sum + selection.count,
        0,
      );

      return {
        detailId: detail._id,
        fixedAssetId: detail.fixedAssetId,
        count,
        originalCost,
        accumulatedDepreciation,
        bookValue: fixNum(originalCost - accumulatedDepreciation),
      };
    })
    .filter((summary) => summary.fixedAssetId && summary.count > 0);
};

export const validateFxaDisposalAccounts = (
  transaction: ITransaction | ITransactionDocument,
  summaries: TFxaDisposalSummary[],
) => {
  const followInfos = getFxaDisposalFollowInfos(transaction);
  const accumulatedDepreciation = summaries.reduce(
    (sum, summary) => sum + summary.accumulatedDepreciation,
    0,
  );
  const bookValue = summaries.reduce(
    (sum, summary) => sum + summary.bookValue,
    0,
  );
  const originalCost = summaries.reduce(
    (sum, summary) => sum + summary.originalCost,
    0,
  );

  if (originalCost > 0 && !followInfos.fixedAssetAccountId) {
    throw new Error('Fixed asset account is required');
  }

  if (
    accumulatedDepreciation > 0 &&
    !followInfos.accumulatedDepreciationAccountId
  ) {
    throw new Error('Accumulated depreciation account is required');
  }

  if (bookValue > 0 && !followInfos.lossAccountId) {
    throw new Error('Fixed asset loss account is required');
  }
};

export const prepareFxaInstanceTransaction = async (
  models: IModels,
  doc: ITransaction,
  options: {
    updateDetails?: boolean;
    validateDisposalAccounts?: boolean;
  } = {},
) => {
  const summaries = await getFxaDisposalSummaries(models, doc);

  if (options.validateDisposalAccounts) {
    validateFxaDisposalAccounts(doc, summaries);
  }

  if (options.updateDetails === false) {
    return doc;
  }

  return {
    ...doc,
    details: (doc.details || []).map((detail) => {
      const summary = summaries.find(
        (item) =>
          item.detailId === detail._id ||
          item.fixedAssetId === detail.fixedAssetId,
      );

      if (!summary) {
        return detail;
      }

      return {
        ...detail,
        count: summary.count,
        unitPrice: summary.count
          ? fixNum(summary.originalCost / summary.count)
          : 0,
        amount: summary.originalCost,
      };
    }),
  };
};

export const prepareFxaDisposalTransaction = async (
  models: IModels,
  doc: ITransaction,
  options: { updateDetails?: boolean } = {},
) =>
  prepareFxaInstanceTransaction(models, doc, {
    updateDetails: options.updateDetails,
    validateDisposalAccounts: true,
  });

export const cleanFxaFollowTr = async (
  models: IModels,
  transactionId: string,
  originType: string,
) => {
  const followTrs = await models.Transactions.find({
    originId: transactionId,
    originType,
  })
    .sort({ createdAt: -1 })
    .lean();

  if (followTrs.length <= 1) {
    return followTrs[0];
  }

  const [current, ...duplicates] = followTrs;
  await models.Transactions.deleteMany({
    _id: { $in: duplicates.map((transaction) => transaction._id) },
  });

  return current;
};

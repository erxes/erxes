import { fixNum } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { FXA_INSTANCE_STATUSES } from '@/fixedAssets/@types/constants';
import { IFixedAsset } from '@/fixedAssets/@types/fixedAsset';
import { ITransaction, ITransactionDocument } from '../@types/transaction';

export type TFxaInstanceInput = {
  _id?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId?: string;
  code?: string;
  sequence?: number;
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
  locationId?: string;
  originalCost?: number;
  depreciationStartDate?: Date;
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
};

export type TFxaMoveFollowInfos = {
  moveInBranchId?: string;
  moveInDepartmentId?: string;
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

export const getUniqueFxaInstanceIds = (ids: string[]) =>
  Array.from(new Set(ids));

export const getFxaInstanceIdsByDetailId = (
  transaction: ITransaction | ITransactionDocument,
) => getFxaExtraData(transaction).fxaInstanceIdsByDetailId || {};

export const getFlatSelectedFxaInstanceIds = (
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
  instances: Array<{ fixedAssetId?: string }>,
) => {
  const selectedByAsset = new Map<string, number>();

  for (const instance of instances) {
    if (!instance.fixedAssetId) {
      continue;
    }

    selectedByAsset.set(
      instance.fixedAssetId,
      (selectedByAsset.get(instance.fixedAssetId) || 0) + 1,
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
  const uniqueIds = getFlatSelectedFxaInstanceIds(transaction);
  const expectedByAsset = getExpectedInstanceCountsByAsset(transaction);
  const expectedCount = getMapTotalCount(expectedByAsset);

  if (expectedCount !== uniqueIds.length) {
    throw new Error('Selected fixed asset instances must match detail counts');
  }

  const instances = await models.FxaInstances.findAvailableSelected(
    uniqueIds,
    transaction._id || '',
    FXA_INSTANCE_STATUSES.ACTIVE,
  );

  if (instances.length !== uniqueIds.length) {
    throw new Error('Selected fixed asset instances are not available');
  }

  const selectedByAsset = getSelectedInstanceCountsByAsset(instances);

  for (const [fixedAssetId, count] of expectedByAsset) {
    if ((selectedByAsset.get(fixedAssetId) || 0) !== count) {
      throw new Error('Selected instances must match each fixed asset detail');
    }
  }

  return uniqueIds;
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
  const instanceIds = await getSelectedInstanceIds(models, transaction);
  const instances = await models.FxaInstances.findByIds(instanceIds);
  const instancesById = new Map(
    instances.map((instance) => [instance._id, instance]),
  );
  const instanceIdsByDetailId = getFxaInstanceIdsByDetailId(transaction);
  const adjustmentDetails = await getLatestAdjustmentDetailsByInstanceId(
    models,
    instanceIds,
  );

  return (transaction.details || [])
    .map((detail) => {
      const detailInstanceIds = detail._id
        ? instanceIdsByDetailId[detail._id] || []
        : [];
      const detailInstances = detailInstanceIds.length
        ? detailInstanceIds
            .map((instanceId) => instancesById.get(instanceId))
            .filter(
              (instance): instance is (typeof instances)[number] => !!instance,
            )
        : instances.filter(
            (instance) => instance.fixedAssetId === detail.fixedAssetId,
          );
      const accumulatedDepreciation = fixNum(
        detailInstances.reduce(
          (sum, instance) =>
            sum +
            (adjustmentDetails.get(instance._id)
              ?.closingAccumulatedDepreciation || 0),
          0,
        ),
      );
      const originalCost = fixNum(
        detailInstances.reduce(
          (sum, instance) => sum + (instance.originalCost || 0),
          0,
        ),
      );

      return {
        detailId: detail._id,
        fixedAssetId: detail.fixedAssetId,
        count: detailInstances.length,
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

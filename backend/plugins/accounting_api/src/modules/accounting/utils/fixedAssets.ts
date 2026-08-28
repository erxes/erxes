import { fixNum } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  FXA_OWNER_RECORD_ACTIONS,
  FXA_OWNER_RECORD_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';
import { JOURNALS, TR_INVENTORY_STATUS_TYPES } from '../@types/constants';
import { ITransaction, ITransactionDocument } from '../@types/transaction';

export type TFxaOwnerRecordInput = {
  _id?: string;
  fxaOwnerRecordId?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId?: string;
  code?: string;
  sequence?: number;
  count?: number;
  ownerId?: string;
};

export type TFxaIncomeDetailFollowInfo = Pick<
  TFxaOwnerRecordInput,
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

export type TFxaTransactionExtraData = {
  fxaOwnerRecords?: TFxaOwnerRecordInput[];
};

export type TFxaMoveFollowInfos = {
  moveInBranchId?: string;
  moveInDepartmentId?: string;
};

export type TFxaIncomeFollowInfos = {
  fxaIncomeDetails?: TFxaIncomeDetailFollowInfo[];
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

export type TFxaIncomeDetailRemoveOptions = {
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

export const getFxaOwnerRecordInputs = (transaction: ITransactionDocument) =>
  getFxaExtraData(transaction).fxaOwnerRecords || [];

export const getFxaIncomeFollowInfos = (
  transaction: ITransaction | ITransactionDocument,
): TFxaIncomeFollowInfos => transaction.followInfos || {};

export const getUniqueFxaOwnerRecordIds = (ids: string[]) =>
  Array.from(new Set(ids));

export const getDetailId = (detail: { _id?: string }) =>
  detail._id?.toString() || '';

const normalizeCount = (count?: number) => Math.max(0, Math.trunc(count || 0));

const getOwnerInputKey = (input: TFxaOwnerRecordInput) =>
  input.fxaOwnerRecordId || input._id || '';

const getTransactionOwnerId = (transaction: ITransactionDocument) =>
  transaction.followInfos?.ownerId || transaction.followInfos?.responsibleUserId;

const getOwnerRecordMovementInputs = (transaction: ITransactionDocument) => {
  const inputs = getFxaOwnerRecordInputs(transaction);

  if (inputs.length) {
    return inputs;
  }

  const ownerId = getTransactionOwnerId(transaction);

  if (!ownerId) {
    return [];
  }

  return (transaction.details || []).map((detail) => ({
    tempId: getDetailId(detail),
    transactionDetailId: getDetailId(detail),
    fixedAssetId: detail.fixedAssetId,
    count: detail.count,
    ownerId,
  }));
};

const getOwnerRecordCountSign = (action?: string) => {
  if (action === FXA_OWNER_RECORD_ACTIONS.RECEIVED) {
    return 1;
  }

  if (action === FXA_OWNER_RECORD_ACTIONS.HANDED_OVER) {
    return -1;
  }

  return 0;
};

export const removeFxaOwnerRecordsByTransaction = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  await models.FxaOwnerRecords.deleteMany({ transactionId: transaction._id });
};

const validateOwnerRecordCounts = (
  transaction: ITransactionDocument,
  inputs: TFxaOwnerRecordInput[],
) => {
  const countByDetailId = new Map<string, number>();

  for (const input of inputs) {
    if (!input.transactionDetailId) {
      continue;
    }

    countByDetailId.set(
      input.transactionDetailId,
      (countByDetailId.get(input.transactionDetailId) || 0) +
        normalizeCount(input.count),
    );
  }

  for (const detail of transaction.details || []) {
    const selectedCount = countByDetailId.get(getDetailId(detail));

    if (selectedCount === undefined) {
      continue;
    }

    const detailCount = normalizeCount(detail.count);

    if (selectedCount !== detailCount) {
      throw new Error('Selected owner record count must match detail count');
    }
  }
};

const getSourceOwnerRecords = async (
  models: IModels,
  inputs: TFxaOwnerRecordInput[],
) => {
  const ids = getUniqueFxaOwnerRecordIds(
    inputs.map(getOwnerInputKey).filter(Boolean),
  );

  if (!ids.length) {
    return new Map();
  }

  const records = await models.FxaOwnerRecords.find({ _id: { $in: ids } }).lean();

  return new Map(records.map((record) => [record._id, record]));
};

const getOwnerRecordBalance = async ({
  fixedAssetId,
  models,
  ownerId,
}: {
  fixedAssetId: string;
  models: IModels;
  ownerId?: string;
}) => {
  const records = await models.FxaOwnerRecords.find({
    fixedAssetId,
    ownerId: ownerId || '',
    status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
  }).lean();

  return records.reduce(
    (sum, record) =>
      sum + getOwnerRecordCountSign(record.action) * normalizeCount(record.count),
    0,
  );
};

const buildOwnerRecordDoc = ({
  action,
  count,
  detailId,
  fixedAssetId,
  input,
  transaction,
  userId,
}: {
  action: string;
  count: number;
  detailId: string;
  fixedAssetId: string;
  input: TFxaOwnerRecordInput;
  transaction: ITransactionDocument;
  userId: string;
}) => ({
  fixedAssetId,
  code: input.code || getOwnerInputKey(input),
  sequence: input.sequence,
  count,
  action,
  status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
  ownerId: input.ownerId || '',
  transactionId: transaction._id,
  transactionDetailId: detailId,
  createdBy: userId,
  createdAt: new Date(),
});

const getSourceInput = (
  input: TFxaOwnerRecordInput,
  sourceRecords: Map<string, { ownerId?: string; fixedAssetId?: string; code?: string }>,
) => {
  const source = sourceRecords.get(getOwnerInputKey(input));

  return {
    ...input,
    fixedAssetId: input.fixedAssetId || source?.fixedAssetId,
    ownerId: input.ownerId || source?.ownerId,
    code: input.code || source?.code,
  };
};

export const syncFxaOwnerRecordMovements = async ({
  eventType,
  models,
  status: _status,
  transaction,
  userId,
}: {
  eventType: string;
  models: IModels;
  status: string;
  transaction: ITransactionDocument;
  userId: string;
}) => {
  await removeFxaOwnerRecordsByTransaction(models, transaction);

  const inputs = getOwnerRecordMovementInputs(transaction).filter(
    (input) => input.transactionDetailId && (input.ownerId || getOwnerInputKey(input)),
  );

  if (!inputs.length) {
    return;
  }

  validateOwnerRecordCounts(transaction, inputs);

  const detailById = new Map(
    (transaction.details || []).map((detail) => [getDetailId(detail), detail]),
  );
  const sourceRecords = await getSourceOwnerRecords(models, inputs);
  const records: ReturnType<typeof buildOwnerRecordDoc>[] = [];

  for (const input of inputs) {
    const resolvedInput = getSourceInput(input, sourceRecords);
    const detail = input.transactionDetailId
      ? detailById.get(input.transactionDetailId)
      : undefined;
    const count = normalizeCount(input.count);
    const fixedAssetId = resolvedInput.fixedAssetId || detail?.fixedAssetId;
    const ownerId = resolvedInput.ownerId || '';

    if (!detail || !fixedAssetId || !ownerId || count <= 0) {
      continue;
    }

    const balance = await getOwnerRecordBalance({
      fixedAssetId,
      models,
      ownerId,
    });

    if (balance < count) {
      throw new Error('Selected owner record does not have enough count');
    }

    records.push(
      buildOwnerRecordDoc({
        action: FXA_OWNER_RECORD_ACTIONS.HANDED_OVER,
        count,
        detailId: getDetailId(detail),
        fixedAssetId,
        input: resolvedInput,
        transaction,
        userId,
      }),
    );

    if (eventType === FXA_LOG_EVENT_TYPES.MOVE) {
      records.push(
        buildOwnerRecordDoc({
          action: FXA_OWNER_RECORD_ACTIONS.RECEIVED,
          count,
          detailId: getDetailId(detail),
          fixedAssetId,
          input: resolvedInput,
          transaction,
          userId,
        }),
      );
    }
  }

  if (records.length) {
    await models.FxaOwnerRecords.insertMany(records);
  }
};

const getLatestAdjustmentDetailsByFixedAssetId = async (
  models: IModels,
  fixedAssetIds: string[],
) => {
  const details = await models.AdjustFxaDetails.find({
    fixedAssetId: { $in: fixedAssetIds },
  })
    .sort({ createdAt: -1 })
    .lean();
  const latestAdjustIdByAssetId = new Map<string, string>();
  const totalsByAssetId = new Map<
    string,
    { closingAccumulatedDepreciation: number; closingBookValue: number }
  >();

  for (const detail of details) {
    if (!detail.fixedAssetId || !detail.adjustId) {
      continue;
    }

    if (!latestAdjustIdByAssetId.has(detail.fixedAssetId)) {
      latestAdjustIdByAssetId.set(detail.fixedAssetId, detail.adjustId);
    }

    if (latestAdjustIdByAssetId.get(detail.fixedAssetId) !== detail.adjustId) {
      continue;
    }

    const current = totalsByAssetId.get(detail.fixedAssetId) || {
      closingAccumulatedDepreciation: 0,
      closingBookValue: 0,
    };

    totalsByAssetId.set(detail.fixedAssetId, {
      closingAccumulatedDepreciation:
        current.closingAccumulatedDepreciation +
        (detail.closingAccumulatedDepreciation || 0),
      closingBookValue: current.closingBookValue + (detail.closingBookValue || 0),
    });
  }

  return totalsByAssetId;
};

export const getFxaDisposalSummaries = async (
  models: IModels,
  transaction: ITransaction | ITransactionDocument,
) => {
  const fixedAssetIds = getUniqueFxaOwnerRecordIds(
    (transaction.details || [])
      .map((detail) => detail.fixedAssetId)
      .filter((fixedAssetId): fixedAssetId is string => Boolean(fixedAssetId)),
  );
  const fixedAssets = await models.FixedAssets.find({
    _id: { $in: fixedAssetIds },
  }).lean();
  const fixedAssetsById = new Map(
    fixedAssets.map((fixedAsset) => [fixedAsset._id, fixedAsset]),
  );
  const adjustmentDetails = await getLatestAdjustmentDetailsByFixedAssetId(
    models,
    fixedAssetIds,
  );

  return (transaction.details || [])
    .map((detail) => {
      const fixedAsset = detail.fixedAssetId
        ? fixedAssetsById.get(detail.fixedAssetId)
        : undefined;
      const count = Math.max(0, Math.trunc(detail.count || 0));
      const originalCost = fixNum((fixedAsset?.originalCost || 0) * count);
      const latestAdjustment = detail.fixedAssetId
        ? adjustmentDetails.get(detail.fixedAssetId)
        : undefined;
      const currentCount = fixedAsset?.currentCount ?? fixedAsset?.count ?? 0;
      const countBeforeThisDisposal = currentCount + count;
      const accumulatedDepreciation = fixNum(
        countBeforeThisDisposal
          ? ((latestAdjustment?.closingAccumulatedDepreciation || 0) /
              countBeforeThisDisposal) *
              count
          : 0,
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

const getFinancialFxaMovementSign = (journal?: string) => {
  switch (journal) {
    case JOURNALS.FXA_INCOME:
    case JOURNALS.FXA_MOVE_IN:
      return 1;
    case JOURNALS.FXA_OUT:
    case JOURNALS.FXA_SALE:
    case JOURNALS.FXA_MOVE:
      return -1;
    default:
      return 0;
  }
};

export const rebuildFixedAssetCurrentCounts = async (
  models: IModels,
  fixedAssetIds: string[],
) => {
  const uniqueIds = getUniqueFxaOwnerRecordIds(fixedAssetIds).filter(Boolean);

  if (!uniqueIds.length) {
    return;
  }

  const transactions = await models.Transactions.find({
    journal: {
      $in: [
        JOURNALS.FXA_INCOME,
        JOURNALS.FXA_OUT,
        JOURNALS.FXA_SALE,
        JOURNALS.FXA_MOVE,
        JOURNALS.FXA_MOVE_IN,
      ],
    },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    'details.fixedAssetId': { $in: uniqueIds },
  }).lean();
  const countByAssetId = new Map<string, number>();

  for (const transaction of transactions) {
    const sign = getFinancialFxaMovementSign(transaction.journal);

    if (!sign) {
      continue;
    }

    for (const detail of transaction.details || []) {
      if (!detail.fixedAssetId || !uniqueIds.includes(detail.fixedAssetId)) {
        continue;
      }

      countByAssetId.set(
        detail.fixedAssetId,
        (countByAssetId.get(detail.fixedAssetId) || 0) +
          sign * Math.max(0, Math.trunc(detail.count || 0)),
      );
    }
  }

  await Promise.all(
    uniqueIds.map((fixedAssetId) =>
      models.FixedAssets.updateOne(
        { _id: fixedAssetId },
        {
          $set: {
            currentCount: fixNum(countByAssetId.get(fixedAssetId) || 0),
            updatedAt: new Date(),
          },
        },
      ),
    ),
  );
};

export const prepareFxaOwnerRecordTransaction = async (
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
  prepareFxaOwnerRecordTransaction(models, doc, {
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

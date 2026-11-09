import { applyFxaDisposalRevaluation } from './fxaRevaluationState';
import { fixNum } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  FXA_OWNER_RECORD_ACTIONS,
  FXA_OWNER_RECORD_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';
import { JOURNALS } from '../@types/constants';
import {
  ITransaction,
  ITransactionDocument,
  ITrFollowInfos,
} from '../@types/transaction';
import { getFxaCapitalValuation } from './fxaCapitalValuation';

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
  sourceOwnerId?: string;
};

export type TFxaTransactionExtraData = {
  fxaOwnerRecords?: TFxaOwnerRecordInput[];
};

export type TFxaMoveFollowInfos = Pick<
  ITrFollowInfos,
  'moveInBranchId' | 'moveInDepartmentId' | 'accumulatedDepreciationAccountId'
>;

export type TFxaDisposalFollowInfos = TFxaMoveFollowInfos &
  Pick<
    ITrFollowInfos,
    | 'saleOutAccountId'
    | 'saleCostAccountId'
    | 'fixedAssetAccountId'
    | 'lossAccountId'
  >;

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
): TFxaDisposalFollowInfos => {
  const followInfos = transaction.followInfos || {};

  return {
    ...followInfos,
    saleOutAccountId:
      followInfos.saleOutAccountId || followInfos.fixedAssetAccountId,
    saleCostAccountId:
      followInfos.saleCostAccountId || followInfos.lossAccountId,
  };
};

type TOwnerRecordSequenceDoc = {
  fixedAssetId?: string;
  sequence?: number;
};

export const assignMissingFxaOwnerRecordSequences = async <
  T extends TOwnerRecordSequenceDoc,
>(
  models: IModels,
  records: T[],
) => {
  const fixedAssetIds = [
    ...new Set(records.map((record) => record.fixedAssetId).filter(Boolean)),
  ] as string[];

  if (!fixedAssetIds.length) {
    return records;
  }

  const usedSequences = new Map<string, Set<number>>();
  const existingRecords = await models.FxaOwnerRecords.find(
    {
      fixedAssetId: { $in: fixedAssetIds },
      sequence: { $ne: null },
    },
    { fixedAssetId: 1, sequence: 1 },
  ).lean();

  const addUsedSequence = (fixedAssetId?: string, sequence?: number) => {
    if (!fixedAssetId || typeof sequence !== 'number') {
      return;
    }

    const sequences = usedSequences.get(fixedAssetId) || new Set<number>();
    sequences.add(sequence);
    usedSequences.set(fixedAssetId, sequences);
  };

  for (const record of existingRecords) {
    addUsedSequence(record.fixedAssetId, record.sequence);
  }

  for (const record of records) {
    addUsedSequence(record.fixedAssetId, record.sequence);
  }

  for (const record of records) {
    if (!record.fixedAssetId || typeof record.sequence === 'number') {
      continue;
    }

    const sequences =
      usedSequences.get(record.fixedAssetId) || new Set<number>();
    let nextSequence = -1;

    while (sequences.has(nextSequence)) {
      nextSequence -= 1;
    }

    record.sequence = nextSequence;
    sequences.add(nextSequence);
    usedSequences.set(record.fixedAssetId, sequences);
  }

  return records;
};

export const getFxaOwnerRecordInputs = (transaction: ITransactionDocument) =>
  getFxaExtraData(transaction).fxaOwnerRecords || [];

export const getUniqueFxaOwnerRecordIds = (ids: string[]) =>
  Array.from(new Set(ids));

export const getDetailId = (detail: { _id?: string }) =>
  detail._id?.toString() || '';

const normalizeCount = (count?: number) => Math.max(0, Math.trunc(count || 0));

const getOwnerInputKey = (input: TFxaOwnerRecordInput) =>
  input.fxaOwnerRecordId || input._id || '';

const getTransactionOwnerId = (transaction: ITransactionDocument) =>
  transaction.followInfos?.ownerId ||
  transaction.followInfos?.responsibleUserId;

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

    if (selectedCount > detailCount) {
      throw new Error(
        'Selected owner record count must not exceed detail count',
      );
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

  const records = await models.FxaOwnerRecords.find({
    _id: { $in: ids },
  }).lean();

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
      sum +
      getOwnerRecordCountSign(record.action) * normalizeCount(record.count),
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
  sourceRecords: Map<
    string,
    { ownerId?: string; fixedAssetId?: string; code?: string }
  >,
) => {
  const source = sourceRecords.get(getOwnerInputKey(input));

  return {
    ...input,
    fixedAssetId: input.fixedAssetId || source?.fixedAssetId,
    ownerId: input.ownerId || source?.ownerId,
    sourceOwnerId: input.sourceOwnerId || source?.ownerId,
    code: input.code || source?.code,
  };
};

export const syncFxaOwnerRecordMovements = async ({
  eventType,
  models,
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
    (input) =>
      input.transactionDetailId && (input.ownerId || getOwnerInputKey(input)),
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
    const sourceOwnerId =
      resolvedInput.sourceOwnerId || resolvedInput.ownerId || '';
    const ownerId = resolvedInput.ownerId || sourceOwnerId;

    if (!detail || !fixedAssetId || !sourceOwnerId || count <= 0) {
      continue;
    }

    const balance = await getOwnerRecordBalance({
      fixedAssetId,
      models,
      ownerId: sourceOwnerId,
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
        input: {
          ...resolvedInput,
          ownerId: sourceOwnerId,
        },
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
          input: {
            ...resolvedInput,
            ownerId,
          },
          transaction,
          userId,
        }),
      );
    }
  }

  if (records.length) {
    await models.FxaOwnerRecords.insertMany(
      await assignMissingFxaOwnerRecordSequences(models, records),
    );
  }
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
  const valuations = new Map<
    string,
    Awaited<ReturnType<typeof getFxaCapitalValuation>>
  >();
  for (const id of fixedAssetIds) {
    valuations.set(
      id,
      await getFxaCapitalValuation(
        models,
        id,
        transaction.date,
        transaction._id,
      ),
    );
  }

  return (transaction.details || [])
    .map((detail) => {
      const valuation = detail.fixedAssetId
        ? valuations.get(detail.fixedAssetId)
        : undefined;
      const count = Math.max(0, Math.trunc(detail.count || 0));
      const originalCost = fixNum((valuation?.originalCost ?? 0) * count);
      const suppliedUnitDepreciation = detail.followInfos?.preDeprecation;
      if (
        suppliedUnitDepreciation !== undefined &&
        (!Number.isFinite(suppliedUnitDepreciation) ||
          suppliedUnitDepreciation < 0)
      ) {
        throw new Error('Fixed asset unit depreciation must be nonnegative');
      }
      const accumulatedDepreciation = fixNum(
        suppliedUnitDepreciation === undefined
          ? (valuation?.preDeprecation || 0) * count
          : suppliedUnitDepreciation * count,
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
  const isSale = transaction.journal === JOURNALS.FXA_SALE;

  if (isSale && originalCost > 0 && !followInfos.saleOutAccountId) {
    throw new Error('Fixed asset account is required');
  }

  if (
    accumulatedDepreciation > 0 &&
    !followInfos.accumulatedDepreciationAccountId
  ) {
    throw new Error('Accumulated depreciation account is required');
  }

  if (isSale && bookValue > 0 && !followInfos.saleCostAccountId) {
    throw new Error('Fixed asset loss account is required');
  }
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
) => {
  const prepared = await prepareFxaOwnerRecordTransaction(models, doc, {
    updateDetails: options.updateDetails,
    validateDisposalAccounts: true,
  });
  return applyFxaDisposalRevaluation(models, prepared);
};

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

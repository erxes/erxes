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
  FXA_INSTANCE_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';
import { IFixedAsset } from '@/fixedAssets/@types/fixedAsset';
import {
  ITransaction,
  ITransactionDocument,
  ITrDetail,
} from '../@types/transaction';
import { createOrUpdateTr } from './utils';

type TFxaInstanceInput = {
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
};

type TFixedAssetSnapshot = Pick<
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

type TFxaTransactionExtraData = {
  fxaInstances?: TFxaInstanceInput[];
  fxaInstanceIds?: string[];
};

type TFxaMoveFollowInfos = {
  moveInBranchId?: string;
  moveInDepartmentId?: string;
};

type TFxaDisposalFollowInfos = TFxaMoveFollowInfos & {
  accumulatedDepreciationAccountId?: string;
  lossAccountId?: string;
};

type TFxaDisposalSummary = {
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

const getFxaExtraData = (
  transaction: ITransaction | ITransactionDocument,
): TFxaTransactionExtraData => transaction.extraData || {};

const getFxaMoveFollowInfos = (
  transaction: ITransactionDocument,
): TFxaMoveFollowInfos => transaction.followInfos || {};

const getFxaDisposalFollowInfos = (
  transaction: ITransaction | ITransactionDocument,
): TFxaDisposalFollowInfos => transaction.followInfos || {};

const getFxaInstanceInputs = (transaction: ITransactionDocument) =>
  getFxaExtraData(transaction).fxaInstances || [];

const getDetailId = (detail: { _id?: string }) => detail._id?.toString() || '';

const getFixedAssetIdsFromInputs = (inputs: TFxaInstanceInput[]) =>
  Array.from(
    new Set(
      inputs
        .map((input) => input.fixedAssetId)
        .filter((fixedAssetId): fixedAssetId is string => !!fixedAssetId),
    ),
  );

const getFixedAssetsById = async (
  models: IModels,
  inputs: TFxaInstanceInput[],
) => {
  const fixedAssets = await models.FixedAssets.find({
    _id: { $in: getFixedAssetIdsFromInputs(inputs) },
  }).lean();

  return new Map<string, TFixedAssetSnapshot>(
    fixedAssets.map((fixedAsset) => [fixedAsset._id, fixedAsset]),
  );
};

const assignMissingInstanceSequences = async (
  models: IModels,
  inputs: TFxaInstanceInput[],
  fixedAssetsById: Map<string, TFixedAssetSnapshot>,
  transactionId?: string,
) => {
  const { maxSequences, usedSequences } =
    await models.FxaInstances.getSequenceState(
      Array.from(fixedAssetsById.values()),
      transactionId,
    );

  for (const input of inputs) {
    if (!input.fixedAssetId) {
      continue;
    }

    const fixedAssetCode = fixedAssetsById.get(input.fixedAssetId)?.code;
    const used = usedSequences.get(input.fixedAssetId) || new Set<number>();
    const assetCodeSequence = fixedAssetCode
      ? models.FxaInstances.getCodeSequence(input.code || '', fixedAssetCode)
      : 0;
    const idCodeSequence = models.FxaInstances.getCodeSequence(
      input.code || '',
      input.fixedAssetId,
    );
    const parsedSequence = Math.max(assetCodeSequence, idCodeSequence);
    let sequence = input._id ? input.sequence || parsedSequence || 0 : 0;

    if (!sequence || used.has(sequence)) {
      sequence = (maxSequences.get(input.fixedAssetId) || 0) + 1;
    }

    used.add(sequence);
    maxSequences.set(
      input.fixedAssetId,
      Math.max(maxSequences.get(input.fixedAssetId) || 0, sequence),
    );

    input.sequence = sequence;

    if (
      fixedAssetCode &&
      (!input.code || assetCodeSequence > 0 || idCodeSequence > 0)
    ) {
      input.code = `${fixedAssetCode}_${String(sequence).padStart(3, '0')}`;
    }
  }
};

const buildDefaultIncomeInputs = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  const inputs = getFxaInstanceInputs(transaction);

  if (inputs.length) {
    return inputs;
  }

  const result: TFxaInstanceInput[] = [];

  for (const detail of transaction.details || []) {
    const count = detail.count || 0;
    const fixedAssetId = detail.fixedAssetId || '';

    if (!fixedAssetId || count <= 0) {
      continue;
    }

    for (let index = 0; index < count; index++) {
      result.push({
        tempId: nanoid(),
        transactionDetailId: getDetailId(detail),
        fixedAssetId,
        branchId: detail.branchId || transaction.branchId,
        departmentId: detail.departmentId || transaction.departmentId,
        originalCost: detail.unitPrice || detail.amount || 0,
      });
    }
  }

  return result;
};

const getInputDetailId = (input: TFxaInstanceInput) =>
  input.transactionDetailId || '';

const getIncomeInstanceMatchKey = (fixedAssetId?: string, detailId?: string) =>
  `${fixedAssetId || ''}:${detailId || ''}`;

const buildIncomeInstanceDoc = ({
  date,
  detail,
  fixedAsset,
  fixedAssetId,
  input,
  transaction,
}: {
  date: Date;
  detail?: {
    _id?: string;
    unitPrice?: number;
    amount?: number;
    branchId?: string;
    departmentId?: string;
  };
  fixedAsset?: TFixedAssetSnapshot;
  fixedAssetId: string;
  input: TFxaInstanceInput;
  transaction: ITransactionDocument;
}) => {
  const transactionDetailId =
    input.transactionDetailId || getDetailId(detail || {});

  return {
    fixedAssetId,
    categoryId: fixedAsset?.categoryId,
    code:
      input.code ||
      (fixedAsset?.code && input.sequence
        ? `${fixedAsset.code}_${String(input.sequence).padStart(3, '0')}`
        : nanoid(6)),
    sequence: input.sequence,
    status: FXA_INSTANCE_STATUSES.ACTIVE,
    originalCost: input.originalCost ?? detail?.unitPrice ?? detail?.amount ?? 0,
    depreciationMethod: fixedAsset?.depreciationMethod,
    usefulLife: fixedAsset?.usefulLife,
    salvageValue: fixedAsset?.salvageValue,
    taxDepreciationMethod: fixedAsset?.taxDepreciationMethod,
    taxUsefulLife: fixedAsset?.taxUsefulLife,
    taxSalvageValue: fixedAsset?.taxSalvageValue,
    acquisitionDate: date,
    depreciationStartDate: input.depreciationStartDate,
    branchId: input.branchId || detail?.branchId || transaction.branchId,
    departmentId:
      input.departmentId || detail?.departmentId || transaction.departmentId,
    responsibleUserId: input.responsibleUserId,
    locationId: input.locationId,
    transactionId: transaction._id,
    transactionDetailId,
    acquisitionTransactionId: transaction._id,
    acquisitionTrDetailId: transactionDetailId,
  };
};

const removeFxaIncomeInstanceIds = async (
  models: IModels,
  instanceIds: string[],
  validateOnly?: boolean,
) => {
  if (!instanceIds.length) {
    return;
  }

  if (
    await models.FxaInstanceLogs.hasBlockingUsage(
      instanceIds,
      FXA_LOG_EVENT_TYPES.ACQUISITION,
    )
  ) {
    throw new Error(
      'Cannot remove transaction detail because fixed asset instances are already used in other transactions',
    );
  }

  if (validateOnly) {
    return;
  }

  await models.FxaInstanceLogs.deleteForInstances(instanceIds);
  await models.FxaInstances.removeByIds(instanceIds);
};

export const removeFxaIncomeInstances = async (
  models: IModels,
  transaction: ITransactionDocument,
  options: TFxaIncomeInstanceRemoveOptions = {},
) => {
  const instances = await models.FxaInstances.findIncomeInstances(
    transaction._id,
    options.detailIds,
  );

  if (!instances.length) {
    return;
  }

  await removeFxaIncomeInstanceIds(
    models,
    instances.map((instance) => instance._id),
    options.validateOnly,
  );
};

export const removeFxaDisposalInstances = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  const logs = await models.FxaInstanceLogs.findByTransaction(transaction._id, [
    FXA_LOG_EVENT_TYPES.DISPOSAL,
    FXA_LOG_EVENT_TYPES.SALE,
  ]);

  if (!logs.length) {
    return;
  }

  for (const log of logs) {
    await models.FxaInstances.restoreDisposalInstance({
      instanceId: log.fxaInstanceId,
      status: log.fromStatus || FXA_INSTANCE_STATUSES.ACTIVE,
    });
  }

  await models.FxaInstanceLogs.deleteByTransaction(transaction._id);
};

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

const matchFxaIncomeInputsToExisting = async (
  models: IModels,
  transaction: ITransactionDocument,
  inputs: TFxaInstanceInput[],
) => {
  const existingInstances = await models.FxaInstances.findIncomeInstances(
    transaction._id,
  );
  const existingById = new Map(
    existingInstances.map((instance) => [instance._id, instance]),
  );
  const existingByKey = new Map<string, (typeof existingInstances)[number][]>();
  const usedExistingIds = new Set<string>();

  for (const instance of existingInstances) {
    const key = getIncomeInstanceMatchKey(
      instance.fixedAssetId,
      instance.acquisitionTrDetailId || instance.transactionDetailId,
    );
    existingByKey.set(key, [...(existingByKey.get(key) || []), instance]);
  }

  for (const input of inputs) {
    const existingByInputId = input._id
      ? existingById.get(input._id)
      : undefined;
    const key = getIncomeInstanceMatchKey(
      input.fixedAssetId,
      getInputDetailId(input),
    );
    const existing =
      existingByInputId ??
      (existingByKey.get(key) || []).find(
        (instance) => !usedExistingIds.has(instance._id),
      );

    if (!existing) {
      continue;
    }

    usedExistingIds.add(existing._id);
    input._id = existing._id;
    input.code = existing.code;
    input.sequence = existing.sequence;
  }

  const removedInstanceIds = existingInstances
    .filter((instance) => !usedExistingIds.has(instance._id))
    .map((instance) => instance._id);

  return removedInstanceIds;
};

export const syncFxaIncomeInstances = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
) => {
  const inputs = await buildDefaultIncomeInputs(models, transaction);
  const removedInstanceIds = await matchFxaIncomeInputsToExisting(
    models,
    transaction,
    inputs,
  );
  const date = transaction.date || new Date();
  const fixedAssetsById = await getFixedAssetsById(models, inputs);
  await assignMissingInstanceSequences(
    models,
    inputs,
    fixedAssetsById,
    transaction._id,
  );

  await removeFxaIncomeInstanceIds(models, removedInstanceIds);
  await models.FxaInstanceLogs.deleteByTransaction(
    transaction._id,
    FXA_LOG_EVENT_TYPES.ACQUISITION,
  );

  for (const input of inputs) {
    const detail = (transaction.details || []).find(
      (item) => getDetailId(item) === input.transactionDetailId,
    );
    const fixedAssetId = input.fixedAssetId || detail?.fixedAssetId || '';

    if (!fixedAssetId) {
      continue;
    }

    const instanceDoc = buildIncomeInstanceDoc({
      date,
      detail,
      fixedAsset: fixedAssetsById.get(fixedAssetId),
      fixedAssetId,
      input,
      transaction,
    });
    const instance = await models.FxaInstances.upsertIncomeInstance({
      _id: input._id,
      doc: instanceDoc,
      userId,
    });

    if (!instance) {
      continue;
    }

    input._id = instance._id;
    input.code = instance.code;
    input.sequence = instance.sequence;

    await models.FxaInstanceLogs.createLog({
      fxaInstanceId: instance._id,
      fixedAssetId,
      eventType: FXA_LOG_EVENT_TYPES.ACQUISITION,
      eventDate: date,
      transactionId: transaction._id,
      transactionDetailId: instance.transactionDetailId,
      toBranchId: instance.branchId,
      toDepartmentId: instance.departmentId,
      toResponsibleUserId: instance.responsibleUserId,
      toStatus: instance.status,
      createdBy: userId,
      createdAt: new Date(),
    });
  }

  transaction.extraData = {
    ...transaction.extraData,
    fxaInstances: inputs,
  };

  await models.Transactions.updateOne(
    { _id: transaction._id },
    { $set: { 'extraData.fxaInstances': inputs } },
  );
};

const getSelectedInstanceIds = async (
  models: IModels,
  transaction: ITransaction | ITransactionDocument,
) => {
  const selectedIds = getFxaExtraData(transaction).fxaInstanceIds || [];

  const uniqueIds = Array.from(new Set(selectedIds));
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

  const expectedCount = Array.from(expectedByAsset.values()).reduce(
    (sum, count) => sum + count,
    0,
  );

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

  const selectedByAsset = new Map<string, number>();
  for (const instance of instances) {
    selectedByAsset.set(
      instance.fixedAssetId,
      (selectedByAsset.get(instance.fixedAssetId) || 0) + 1,
    );
  }

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

const getFxaDisposalSummaries = async (
  models: IModels,
  transaction: ITransaction | ITransactionDocument,
) => {
  const instanceIds = await getSelectedInstanceIds(models, transaction);
  const instances = await models.FxaInstances.findByIds(instanceIds);
  const adjustmentDetails = await getLatestAdjustmentDetailsByInstanceId(
    models,
    instanceIds,
  );

  return (transaction.details || [])
    .map((detail) => {
      const detailInstances = instances.filter(
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

const validateFxaDisposalAccounts = (
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

export const prepareFxaDisposalTransaction = async (
  models: IModels,
  doc: ITransaction,
) => {
  const summaries = await getFxaDisposalSummaries(models, doc);
  validateFxaDisposalAccounts(doc, summaries);

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

const cleanFxaFollowTr = async (
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

const buildFxaDisposalFollowDetails = ({
  accountId,
  amountKey,
  oldTr,
  originType,
  summaries,
}: {
  accountId?: string;
  amountKey: 'accumulatedDepreciation' | 'bookValue';
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
  transaction,
}: {
  details: ITrDetail[];
  journal: string;
  oldTr?: ITransactionDocument | null;
  originType: string;
  ptrId: string;
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
  side: TR_SIDES.DEBIT,
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

  const [oldDepreciationTr, oldLossTr] = await Promise.all([
    cleanFxaFollowTr(
      models,
      transaction._id,
      TR_FOLLOW_TYPES.FXA_OUT_DEPRECIATION,
    ),
    cleanFxaFollowTr(models, transaction._id, TR_FOLLOW_TYPES.FXA_OUT_LOSS),
  ]);
  const ptrId = oldDepreciationTr?.ptrId || oldLossTr?.ptrId || nanoid();
  const followInfos = getFxaDisposalFollowInfos(transaction);
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
  const instanceIds = await getSelectedInstanceIds(models, transaction);

  if (!instanceIds.length) {
    return;
  }

  const date = transaction.date || new Date();
  await models.FxaInstanceLogs.deleteByTransaction(transaction._id);

  const instances = await models.FxaInstances.findByIds(instanceIds);

  for (const instance of instances) {
    await models.FxaInstances.applyDisposal({
      instanceId: instance._id,
      status,
      transactionId: transaction._id,
      date,
      userId,
    });

    await models.FxaInstanceLogs.createLog({
      fxaInstanceId: instance._id,
      fixedAssetId: instance.fixedAssetId,
      eventType,
      eventDate: date,
      transactionId: transaction._id,
      fromBranchId: instance.branchId,
      toBranchId: instance.branchId,
      fromDepartmentId: instance.departmentId,
      toDepartmentId: instance.departmentId,
      fromResponsibleUserId: instance.responsibleUserId,
      toResponsibleUserId: instance.responsibleUserId,
      fromStatus: instance.status,
      toStatus: status,
      createdBy: userId,
      createdAt: new Date(),
    });
  }
};

export const syncFxaMoveInstances = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
) => {
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

  await models.FxaInstanceLogs.deleteByTransaction(transaction._id);

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

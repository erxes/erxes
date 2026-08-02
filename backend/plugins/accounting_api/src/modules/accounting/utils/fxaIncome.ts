import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { ADJ_FXA_STATUSES, IAdjustFxaDetail } from '../@types/adjustFixedAsset';
import {
  FXA_INSTANCE_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';
import { ITransactionDocument } from '../@types/transaction';
import {
  getDetailId,
  getFxaInstanceInputs,
  TFxaIncomeInstanceRemoveOptions,
  TFxaInstanceInput,
  TFixedAssetSnapshot,
} from './fixedAssets';

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
) => {
  const { maxSequences, usedSequences } =
    await models.FxaInstances.getSequenceState(
      Array.from(fixedAssetsById.values()),
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

    if (input._id && sequence) {
      used.delete(sequence);
    }

    if (!sequence || (!input._id && used.has(sequence))) {
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
    originalCost:
      detail?.unitPrice || input.originalCost || detail?.amount || 0,
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
    transactionDetailId,
  };
};

const findAcquisitionInstances = async (
  models: IModels,
  transaction: ITransactionDocument,
  detailIds?: string[],
) => {
  const logs = await models.FxaInstanceLogs.findByTransaction(
    transaction._id,
    FXA_LOG_EVENT_TYPES.ACQUISITION,
  );
  const filteredDetailIds = new Set((detailIds || []).filter(Boolean));
  const instanceIds = logs
    .filter(
      (log) =>
        !filteredDetailIds.size ||
        (log.transactionDetailId &&
          filteredDetailIds.has(log.transactionDetailId)),
    )
    .map((log) => log.fxaInstanceId);

  return models.FxaInstances.findIncomeInstances(
    Array.from(new Set(instanceIds)),
  );
};

const buildMigrationAdjustmentId = (transactionId: string) =>
  `erkhet-fxa-opening-${transactionId}`;

const syncMigrationOpeningDepreciation = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
  details: IAdjustFxaDetail[],
) => {
  const adjustId = buildMigrationAdjustmentId(transaction._id);

  if (!details.length) {
    await models.AdjustFxaDetails.deleteMany({ adjustId });
    await models.AdjustFixedAssets.deleteOne({ _id: adjustId });
    return;
  }

  await models.AdjustFixedAssets.updateOne(
    { _id: adjustId },
    {
      $set: {
        date: transaction.date || new Date(),
        beginDate: transaction.date || new Date(),
        description: `Erkhet opening depreciation ${
          transaction.number || transaction._id
        }`,
        status: ADJ_FXA_STATUSES.COMPLETE,
        modifiedBy: userId,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        _id: adjustId,
        createdBy: userId,
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  await models.AdjustFxaDetails.replaceAdjustFxaDetails({
    adjustId,
    details,
  });
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
  const instances = await findAcquisitionInstances(
    models,
    transaction,
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

const matchFxaIncomeInputsToExisting = async (
  models: IModels,
  transaction: ITransactionDocument,
  inputs: TFxaInstanceInput[],
) => {
  const existingInstances = await findAcquisitionInstances(models, transaction);
  const existingById = new Map(
    existingInstances.map((instance) => [instance._id, instance]),
  );
  const existingByKey = new Map<string, (typeof existingInstances)[number][]>();
  const usedExistingIds = new Set<string>();

  for (const instance of existingInstances) {
    const key = getIncomeInstanceMatchKey(
      instance.fixedAssetId,
      instance.transactionDetailId,
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
  const migrationAdjustmentDetails: IAdjustFxaDetail[] = [];
  await assignMissingInstanceSequences(models, inputs, fixedAssetsById);

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

    const openingAccumulatedDepreciation =
      input.openingAccumulatedDepreciation || 0;

    if (openingAccumulatedDepreciation > 0) {
      const originalCost = instance.originalCost || 0;
      const bookValue = Math.max(
        originalCost - openingAccumulatedDepreciation,
        0,
      );

      migrationAdjustmentDetails.push({
        adjustId: buildMigrationAdjustmentId(transaction._id),
        fxaInstanceId: instance._id,
        fixedAssetId,
        categoryId: instance.categoryId,
        branchId: instance.branchId,
        departmentId: instance.departmentId,
        originalCost,
        salvageValue: instance.salvageValue,
        openingBookValue: bookValue,
        openingAccumulatedDepreciation,
        depreciationAmount: 0,
        bookDepreciationAmount: 0,
        closingAccumulatedDepreciation: openingAccumulatedDepreciation,
        closingBookValue: bookValue,
        transactionId: transaction._id,
        transactionDetailId: instance.transactionDetailId,
      });
    }
  }

  await syncMigrationOpeningDepreciation(
    models,
    userId,
    transaction,
    migrationAdjustmentDetails,
  );

  transaction.extraData = {
    ...transaction.extraData,
    fxaInstances: inputs,
  };

  await models.Transactions.updateOne(
    { _id: transaction._id },
    { $set: { 'extraData.fxaInstances': inputs } },
  );
};

import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  FXA_INSTANCE_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '@/fixedAssets/@types/constants';
import { ITransactionDocument } from '../@types/transaction';

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

export type TFxaIncomeInstanceRemoveOptions = {
  detailIds?: string[];
  validateOnly?: boolean;
};

const getFxaInstanceInputs = (transaction: ITransactionDocument) =>
  ((transaction.extraData as any)?.fxaInstances || []) as TFxaInstanceInput[];

const getDetailId = (detail: { _id?: string }) => detail._id?.toString() || '';

const assignMissingInstanceSequences = async (
  models: IModels,
  inputs: TFxaInstanceInput[],
  transactionId?: string,
) => {
  const fixedAssetIds = Array.from(
    new Set(inputs.map((input) => input.fixedAssetId).filter(Boolean)),
  ) as string[];
  const fixedAssets = await models.FixedAssets.find({
    _id: { $in: fixedAssetIds },
  }).lean();
  const fixedAssetsById = new Map(
    fixedAssets.map((fixedAsset) => [fixedAsset._id, fixedAsset]),
  );
  const { maxSequences, usedSequences } =
    await models.FxaInstances.getSequenceState(fixedAssets, transactionId);

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
  const logs = await models.FxaInstanceLogs.findByTransaction(
    transaction._id,
    [FXA_LOG_EVENT_TYPES.DISPOSAL, FXA_LOG_EVENT_TYPES.SALE],
  );

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
      existingByInputId ||
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
  await assignMissingInstanceSequences(models, inputs, transaction._id);
  const date = transaction.date || new Date();

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

    const fixedAsset = await models.FixedAssets.findOne({
      _id: fixedAssetId,
    }).lean();

    const instanceDoc = {
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
        input.originalCost ?? detail?.unitPrice ?? detail?.amount ?? 0,
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
      transactionDetailId:
        input.transactionDetailId || getDetailId(detail || {}),
      acquisitionTransactionId: transaction._id,
      acquisitionTrDetailId:
        input.transactionDetailId || getDetailId(detail || {}),
    };
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
    ...(transaction.extraData || {}),
    fxaInstances: inputs,
  };

  await models.Transactions.updateOne(
    { _id: transaction._id },
    { $set: { 'extraData.fxaInstances': inputs } },
  );
};

const getSelectedInstanceIds = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  const selectedIds = ((transaction.extraData as any)?.fxaInstanceIds ||
    []) as string[];

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
    transaction._id,
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
  const destinationBranchId = (transaction.followInfos as any)?.moveInBranchId;
  const destinationDepartmentId = (transaction.followInfos as any)
    ?.moveInDepartmentId;

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

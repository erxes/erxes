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

const getCodeSequence = (code: string, fixedAssetCode: string) => {
  const escapedCode = fixedAssetCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^${escapedCode}_(\\d+)$`).exec(code);
  return match ? Number(match[1]) : 0;
};

const assignMissingInstanceSequences = async (
  models: IModels,
  inputs: TFxaInstanceInput[],
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
  const sequences = new Map<string, number>();

  for (const fixedAssetId of fixedAssetIds) {
    const fixedAssetCode = fixedAssetsById.get(fixedAssetId)?.code;

    const instances = await models.FxaInstances.find({ fixedAssetId })
      .select({ code: 1, sequence: 1 })
      .lean();
    sequences.set(
      fixedAssetId,
      instances.reduce(
        (max, instance) =>
          Math.max(
            max,
            instance.sequence || 0,
            fixedAssetCode
              ? getCodeSequence(instance.code || '', fixedAssetCode)
              : 0,
            getCodeSequence(instance.code || '', fixedAssetId),
          ),
        0,
      ),
    );
  }

  for (const input of inputs) {
    if (input.sequence || !input.fixedAssetId) {
      continue;
    }

    const nextSequence = (sequences.get(input.fixedAssetId) || 0) + 1;

    input.sequence = nextSequence;
    sequences.set(input.fixedAssetId, nextSequence);
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

const buildFxaIncomeInstanceSelector = (
  transaction: ITransactionDocument,
  detailIds?: string[],
) => {
  const selector: Record<string, unknown> = {
    acquisitionTransactionId: transaction._id,
  };
  const filteredDetailIds = (detailIds || []).filter(Boolean);

  if (filteredDetailIds.length) {
    selector.$or = [
      { acquisitionTrDetailId: { $in: filteredDetailIds } },
      { transactionDetailId: { $in: filteredDetailIds } },
    ];
  }

  return selector;
};

export const removeFxaIncomeInstances = async (
  models: IModels,
  transaction: ITransactionDocument,
  options: TFxaIncomeInstanceRemoveOptions = {},
) => {
  const instances = await models.FxaInstances.find(
    buildFxaIncomeInstanceSelector(transaction, options.detailIds),
  )
    .select({ _id: 1 })
    .lean();

  if (!instances.length) {
    return;
  }

  const instanceIds = instances.map((instance) => instance._id);
  const blockingLog = await models.FxaInstanceLogs.findOne({
    fxaInstanceId: { $in: instanceIds },
    eventType: { $ne: FXA_LOG_EVENT_TYPES.ACQUISITION },
  }).lean();

  if (blockingLog) {
    throw new Error(
      'Cannot remove transaction detail because fixed asset instances are already used in other transactions',
    );
  }

  if (options.validateOnly) {
    return;
  }

  await models.FxaInstanceLogs.deleteMany({
    fxaInstanceId: { $in: instanceIds },
  });
  await models.FxaInstances.deleteMany({ _id: { $in: instanceIds } });
};

export const syncFxaIncomeInstances = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
) => {
  const inputs = await buildDefaultIncomeInputs(models, transaction);
  await assignMissingInstanceSequences(models, inputs);
  const date = transaction.date || new Date();

  await removeFxaIncomeInstances(models, transaction);
  await models.FxaInstanceLogs.deleteMany({
    transactionId: transaction._id,
    eventType: FXA_LOG_EVENT_TYPES.ACQUISITION,
  });

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

    const instance = await models.FxaInstances.create({
      _id: input._id || nanoid(),
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
      createdBy: userId,
      createdAt: new Date(),
    });

    await models.FxaInstanceLogs.create({
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

  const instances = await models.FxaInstances.find({
    _id: { $in: uniqueIds },
    status: FXA_INSTANCE_STATUSES.ACTIVE,
  }).lean();

  if (instances.length !== uniqueIds.length) {
    throw new Error('Selected fixed asset instances are not active');
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
  await models.FxaInstanceLogs.deleteMany({ transactionId: transaction._id });

  const instances = await models.FxaInstances.find({
    _id: { $in: instanceIds },
  }).lean();

  for (const instance of instances) {
    await models.FxaInstances.updateOne(
      { _id: instance._id },
      {
        $set: {
          status,
          transactionId: transaction._id,
          disposalDate: date,
          disposalTransactionId: transaction._id,
          modifiedBy: userId,
          updatedAt: new Date(),
        },
      },
    );

    await models.FxaInstanceLogs.create({
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

  await models.FxaInstanceLogs.deleteMany({ transactionId: transaction._id });

  const instances = await models.FxaInstances.find({
    _id: { $in: instanceIds },
  }).lean();

  for (const instance of instances) {
    await models.FxaInstances.updateOne(
      { _id: instance._id },
      {
        $set: {
          branchId: destinationBranchId,
          departmentId: destinationDepartmentId,
          transactionId: transaction._id,
          modifiedBy: userId,
          updatedAt: new Date(),
        },
      },
    );

    await models.FxaInstanceLogs.create({
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

import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { FXA_INSTANCE_STATUSES, FXA_LOG_EVENT_TYPES } from '@/fixedAssets/@types/constants';
import { ITransactionDocument } from '../@types/transaction';

type TFxaInstanceInput = {
  _id?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId?: string;
  code?: string;
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
  locationId?: string;
  originalCost?: number;
  depreciationStartDate?: Date;
};

const getFxaInstanceInputs = (transaction: ITransactionDocument) =>
  ((transaction.extraData as any)?.fxaInstances || []) as TFxaInstanceInput[];

const getDetailId = (detail: { _id?: string }) => detail._id?.toString() || '';

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

    const fixedAsset = await models.FixedAssets.findOne({
      _id: fixedAssetId,
    }).lean();

    for (let index = 0; index < count; index++) {
      result.push({
        tempId: nanoid(),
        transactionDetailId: getDetailId(detail),
        fixedAssetId,
        code: `${fixedAsset?.code || fixedAssetId}-${index + 1}`,
        branchId: detail.branchId || transaction.branchId,
        departmentId: detail.departmentId || transaction.departmentId,
        originalCost: detail.unitPrice || detail.amount || 0,
      });
    }
  }

  return result;
};

export const syncFxaIncomeInstances = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
) => {
  const inputs = await buildDefaultIncomeInputs(models, transaction);
  const date = transaction.date || new Date();

  await models.FxaInstanceLogs.deleteMany({ transactionId: transaction._id });
  await models.FxaInstances.deleteMany({
    acquisitionTransactionId: transaction._id,
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
      code: input.code || `${fixedAsset?.code || fixedAssetId}-${nanoid(6)}`,
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
      transactionDetailId: input.transactionDetailId || getDetailId(detail || {}),
      acquisitionTransactionId: transaction._id,
      acquisitionTrDetailId: input.transactionDetailId || getDetailId(detail || {}),
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

  if (selectedIds.length) {
    return selectedIds;
  }

  const result: string[] = [];

  for (const detail of transaction.details || []) {
    const fixedAssetId = detail.fixedAssetId;
    const count = Math.max(0, Math.trunc(detail.count || 0));

    if (!fixedAssetId || !count) {
      continue;
    }

    const instances = await models.FxaInstances.find({
      fixedAssetId,
      status: FXA_INSTANCE_STATUSES.ACTIVE,
      branchId: detail.branchId || transaction.branchId,
      departmentId: detail.departmentId || transaction.departmentId,
    })
      .sort({ acquisitionDate: 1, createdAt: 1 })
      .limit(count)
      .lean();

    result.push(...instances.map((instance) => instance._id));
  }

  return result;
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
  const destinationDepartmentId = (transaction.followInfos as any)?.moveInDepartmentId;

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

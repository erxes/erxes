import { IModels } from '~/connectionResolvers';
import {
  ADJ_FXA_STATUSES,
  IAdjustFixedAssetDocument,
  IAdjustFxaDetail,
} from '../@types/adjustFixedAsset';
import { JOURNALS, TR_SIDES, TR_STATUSES } from '../@types/constants';
import { ITransaction } from '../@types/transaction';
import { FXA_INSTANCE_STATUSES } from '~/modules/fixedAssets/@types/constants';

const FIXED_ASSET_ACCOUNTS_CODE = 'FIXEDASSET_ACCOUNTS';
const DAY_MS = 24 * 60 * 60 * 1000;

type TFixedAssetAccountConfig = {
  accountId?: string;
  depreciationAccountId?: string;
};

type TDepreciationInput = {
  originalCost: number;
  salvageValue?: number;
  usefulLife?: number;
  startDate: Date;
  endDate: Date;
  openingAccumulatedDepreciation?: number;
};

const getPureDate = (value: Date) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const calculateStraightLineDepreciation = ({
  originalCost,
  salvageValue = 0,
  usefulLife,
  startDate,
  endDate,
  openingAccumulatedDepreciation = 0,
}: TDepreciationInput) => {
  if (!usefulLife || usefulLife <= 0) {
    return {
      amount: 0,
      closingAccumulatedDepreciation: openingAccumulatedDepreciation,
      closingBookValue: originalCost - openingAccumulatedDepreciation,
      error: 'Useful life is required to calculate depreciation',
    };
  }

  const depreciableAmount = Math.max(originalCost - salvageValue, 0);
  const lifetimeDays = Math.max(Math.round(usefulLife * 30), 1);
  const dailyAmount = depreciableAmount / lifetimeDays;
  let currentDate = getPureDate(startDate);
  const lastDate = getPureDate(endDate);
  let amount = 0;
  let accumulated = openingAccumulatedDepreciation;
  let error = '';
  let warning = '';

  while (currentDate <= lastDate) {
    const closingBookValue = originalCost - accumulated - dailyAmount;

    if (closingBookValue < 0) {
      error = `Depreciation makes book value negative on ${currentDate.toISOString().slice(0, 10)}`;
      break;
    }

    if (closingBookValue < salvageValue) {
      const remainingAmount = Math.max(
        originalCost - accumulated - salvageValue,
        0,
      );
      amount += remainingAmount;
      accumulated += remainingAmount;
      warning = `Depreciation reached salvage value on ${currentDate.toISOString().slice(0, 10)}`;
      break;
    }

    amount += dailyAmount;
    accumulated += dailyAmount;
    currentDate = addDays(currentDate, 1);
  }

  return {
    amount,
    closingAccumulatedDepreciation: accumulated,
    closingBookValue: originalCost - accumulated,
    error,
    warning,
  };
};

const getPreviousAdjustment = async (
  models: IModels,
  adjust: IAdjustFixedAssetDocument,
) => {
  return models.AdjustFixedAssets.findOne({
    _id: { $ne: adjust._id },
    date: { $lt: getPureDate(adjust.date) },
    status: { $in: [ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH] },
  })
    .sort({ date: -1 })
    .lean();
};

const getPreviousDetailMap = async (models: IModels, adjustId?: string) => {
  const map = new Map<string, IAdjustFxaDetail>();

  if (!adjustId) {
    return map;
  }

  const details = await models.AdjustFxaDetails.find({ adjustId }).lean();

  for (const detail of details) {
    map.set(detail.fxaInstanceId, detail);
  }

  return map;
};

const getInstanceAccountMap = async (
  models: IModels,
  instances: { _id: string; transactionDetailId?: string }[],
) => {
  const detailIds = instances
    .map((instance) => instance.transactionDetailId)
    .filter((detailId): detailId is string => Boolean(detailId));
  const map = new Map<string, string>();

  if (!detailIds.length) {
    return map;
  }

  const transactions = await models.Transactions.find({
    'details._id': { $in: detailIds },
  }).lean();

  for (const transaction of transactions) {
    for (const detail of transaction.details || []) {
      if (detail._id && detail.accountId) {
        map.set(detail._id, detail.accountId);
      }
    }
  }

  return new Map(
    instances.map((instance) => [
      instance._id,
      instance.transactionDetailId
        ? map.get(instance.transactionDetailId)
        : undefined,
    ]),
  );
};

export const checkValidFixedAssetDate = async (
  models: IModels,
  adjust: Pick<IAdjustFixedAssetDocument, '_id' | 'date'>,
) => {
  const date = getPureDate(adjust.date);
  const afterAdjust = await models.AdjustFixedAssets.findOne({
    _id: { $ne: adjust._id },
    status: { $in: [ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH] },
    date: { $gte: date },
  }).lean();

  if (afterAdjust) {
    throw new Error('A later fixed asset adjustment already exists.');
  }

  const beforeAdjust = await getPreviousAdjustment(
    models,
    adjust as IAdjustFixedAssetDocument,
  );

  return {
    beginDate: beforeAdjust?.date
      ? addDays(getPureDate(beforeAdjust.date), 1)
      : date,
    beforeAdjust,
  };
};

export const runAdjustFixedAsset = async (
  models: IModels,
  userId: string,
  adjust: IAdjustFixedAssetDocument,
) => {
  const { beginDate, beforeAdjust } = await checkValidFixedAssetDate(
    models,
    adjust,
  );
  const endDate = getPureDate(adjust.date);
  const previousDetails = await getPreviousDetailMap(models, beforeAdjust?._id);
  const instances = await models.FxaInstances.findAdjustable({
    status: FXA_INSTANCE_STATUSES.ACTIVE,
    endDate,
  });
  const fixedAssets = await models.FixedAssets.find({
    _id: { $in: instances.map((instance) => instance.fixedAssetId) },
  }).lean();
  const fixedAssetById = new Map(
    fixedAssets.map((fixedAsset) => [fixedAsset._id, fixedAsset]),
  );
  const accountByInstanceId = await getInstanceAccountMap(models, instances);
  const details: IAdjustFxaDetail[] = [];

  for (const instance of instances) {
    const fixedAsset = fixedAssetById.get(instance.fixedAssetId);
    const previousDetail = previousDetails.get(instance._id);
    const startDate = previousDetail?.closingBookValue
      ? beginDate
      : getPureDate(
          instance.depreciationStartDate ||
            instance.acquisitionDate ||
            beginDate,
        );

    if (startDate > endDate) {
      continue;
    }

    const originalCost = instance.originalCost || 0;
    const salvageValue = instance.salvageValue ?? fixedAsset?.salvageValue ?? 0;
    const openingAccumulatedDepreciation =
      previousDetail?.closingAccumulatedDepreciation || 0;
    const openingBookValue = originalCost - openingAccumulatedDepreciation;
    const depreciationMethod =
      instance.depreciationMethod ||
      fixedAsset?.depreciationMethod ||
      'straightLine';
    const accountId = accountByInstanceId.get(instance._id);
    const result = calculateStraightLineDepreciation({
      originalCost,
      salvageValue,
      usefulLife: instance.usefulLife || fixedAsset?.usefulLife,
      startDate,
      endDate,
      openingAccumulatedDepreciation,
    });

    details.push({
      adjustId: adjust._id,
      fxaInstanceId: instance._id,
      fixedAssetId: instance.fixedAssetId,
      categoryId: instance.categoryId || fixedAsset?.categoryId,
      accountId,
      branchId: instance.branchId,
      departmentId: instance.departmentId,
      originalCost,
      salvageValue,
      openingBookValue,
      openingAccumulatedDepreciation,
      depreciationAmount: result.amount,
      bookDepreciationAmount: result.amount,
      closingAccumulatedDepreciation: result.closingAccumulatedDepreciation,
      closingBookValue: result.closingBookValue,
      error:
        result.error ||
        (!accountId ? 'Fixed asset account is missing.' : '') ||
        (depreciationMethod !== 'straightLine'
          ? 'Only straight-line depreciation is supported for adjustment.'
          : ''),
      warning: result.warning,
    });
  }

  await models.AdjustFxaDetails.replaceAdjustFxaDetails({
    adjustId: adjust._id,
    details,
  });

  const hasError = details.some((detail) => detail.error);

  return models.AdjustFixedAssets.updateAdjustFixedAsset(adjust._id, {
    beginDate,
    successDate: hasError ? undefined : endDate,
    checkedAt: new Date(),
    status: ADJ_FXA_STATUSES.PROCESS,
    error: hasError ? 'Some fixed asset depreciation rows have errors.' : '',
    warning: details.some((detail) => detail.warning)
      ? 'Some fixed asset depreciation rows have warnings.'
      : '',
    modifiedBy: userId,
  });
};

const getAccountConfigs = async (models: IModels) => {
  const configs = await models.Configs.getConfigs(FIXED_ASSET_ACCOUNTS_CODE);
  const map = new Map<string, TFixedAssetAccountConfig>();

  for (const config of configs) {
    if (config.subId) {
      map.set(config.subId, config.value as TFixedAssetAccountConfig);
    }
  }

  return map;
};

export const createAdjustFixedAssetTransaction = async ({
  models,
  userId,
  adjust,
  expenseAccountId,
}: {
  models: IModels;
  userId: string;
  adjust: IAdjustFixedAssetDocument;
  expenseAccountId: string;
}) => {
  const details = await models.AdjustFxaDetails.find({
    adjustId: adjust._id,
    error: { $in: [null, ''] },
    bookDepreciationAmount: { $gt: 0 },
  }).lean();

  if (!details.length) {
    throw new Error('No depreciation details to create transaction.');
  }

  const accountConfigs = await getAccountConfigs(models);
  const creditDetails: ITransaction['details'] = [];
  const debitDetails: ITransaction['details'] = [];

  for (const detail of details) {
    if (!detail.accountId) {
      throw new Error('Fixed asset account is missing on depreciation detail.');
    }

    const accountConfig = accountConfigs.get(detail.accountId);
    const depreciationAccountId = accountConfig?.depreciationAccountId;

    if (!depreciationAccountId) {
      throw new Error('Accumulated depreciation account config is missing.');
    }

    const amount = detail.bookDepreciationAmount || 0;

    debitDetails.push({
      accountId: expenseAccountId,
      amount,
      branchId: detail.branchId,
      departmentId: detail.departmentId,
      fixedAssetId: detail.fixedAssetId,
    });
    creditDetails.push({
      accountId: depreciationAccountId,
      amount,
      branchId: detail.branchId,
      departmentId: detail.departmentId,
      fixedAssetId: detail.fixedAssetId,
    });
  }

  const trDocs: ITransaction[] = [
    {
      _id: details[0].transactionId,
      date: adjust.date,
      description: adjust.description,
      journal: JOURNALS.MAIN,
      status: TR_STATUSES.COMPLETE,
      side: TR_SIDES.DEBIT,
      contentType: 'accounting:adjustFixedAsset',
      contentId: adjust._id,
      details: debitDetails,
    },
    {
      date: adjust.date,
      description: adjust.description,
      journal: JOURNALS.MAIN,
      status: TR_STATUSES.COMPLETE,
      side: TR_SIDES.CREDIT,
      contentType: 'accounting:adjustFixedAsset',
      contentId: adjust._id,
      details: creditDetails,
    },
  ];

  const existingTransactionId = details.find(
    (detail) => detail.transactionId,
  )?.transactionId;
  const transactions = existingTransactionId
    ? await models.Transactions.updatePTransaction(
        existingTransactionId,
        trDocs,
        userId,
      )
    : await models.Transactions.createPTransaction(trDocs, userId);
  const parentId = transactions[0]?.parentId;

  await models.AdjustFxaDetails.updateMany(
    { adjustId: adjust._id },
    {
      $set: {
        transactionId: parentId,
        updatedAt: new Date(),
      },
    },
  );

  return models.AdjustFixedAssets.updateAdjustFixedAsset(adjust._id, {
    status: ADJ_FXA_STATUSES.COMPLETE,
    modifiedBy: userId,
  });
};

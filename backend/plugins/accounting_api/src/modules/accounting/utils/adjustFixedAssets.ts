import { IModels } from '~/connectionResolvers';
import {
  ADJ_FXA_STATUSES,
  IAdjustFixedAssetDocument,
  IAdjustFxaDetail,
} from '../@types/adjustFixedAsset';
import {
  JOURNALS,
  TR_INVENTORY_STATUS_TYPES,
  TR_SIDES,
  TR_STATUSES,
} from '../@types/constants';
import { ITransaction } from '../@types/transaction';
import { FIXED_ASSET_DEPRECIATION_METHODS } from '~/modules/fixedAssets/@types/constants';
import { IFixedAssetDocument } from '~/modules/fixedAssets/@types/fixedAsset';

const FIXED_ASSET_ACCOUNTS_CODE = 'FIXEDASSET_ACCOUNTS';
const DAY_MS = 24 * 60 * 60 * 1000;

type TFixedAssetAccountConfig = {
  accountId?: string;
  depreciationAccountId?: string;
};

type TDepreciationInput = {
  originalCost: number;
  salvageValue?: number;
  annualDepreciationRate?: number;
  startDate: Date;
  endDate: Date;
  scheduleStartDate?: Date;
  openingAccumulatedDepreciation?: number;
};

type TDailyValidationResult = {
  successDate?: Date;
  error?: string;
};

type TPreviousFixedAssetDetail = {
  closingAccumulatedDepreciation: number;
  closingBookValue: number;
};

type TFixedAssetLocationDepreciationRow = {
  depreciationAmount: number;
  originalCost: number;
  salvageValue: number;
  openingBookValue: number;
  openingAccumulatedDepreciation: number;
  closingAccumulatedDepreciation: number;
  closingBookValue: number;
  error: string;
  warning: string;
};

type TFixedAssetMovement = {
  fixedAssetId: string;
  date: Date;
  countDelta: number;
  branchId?: string;
  departmentId?: string;
  accountId?: string;
  transactionId?: string;
  transactionDetailId?: string;
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

const isSamePureDate = (left: Date, right: Date) =>
  getPureDate(left).getTime() === getPureDate(right).getTime();

const getDaysBetween = (startDate: Date, endDate: Date) =>
  Math.max(
    0,
    Math.round(
      (getPureDate(endDate).getTime() - getPureDate(startDate).getTime()) /
        DAY_MS,
    ),
  );

const getDaysInMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getUsefulLifeFromAnnualRate = (annualDepreciationRate?: number) =>
  annualDepreciationRate && annualDepreciationRate > 0
    ? (100 / annualDepreciationRate) * 12
    : undefined;

const getDepreciationBaseError = (
  annualDepreciationRate?: number,
  originalCost?: number,
) => {
  if (!annualDepreciationRate || annualDepreciationRate <= 0) {
    return 'Annual depreciation rate is required to calculate depreciation';
  }

  if (!originalCost || originalCost <= 0) {
    return 'Original cost is required to calculate depreciation';
  }

  return '';
};

const calculateDailyDepreciation = ({
  calculateDailyAmount,
  input,
}: {
  calculateDailyAmount: (args: {
    accumulated: number;
    currentDate: Date;
    lifetimeDays: number;
    scheduleStartDate: Date;
  }) => number;
  input: TDepreciationInput;
}) => {
  const {
    originalCost,
    salvageValue = 0,
    annualDepreciationRate,
    startDate,
    endDate,
    scheduleStartDate = startDate,
    openingAccumulatedDepreciation = 0,
  } = input;
  const usefulLife = getUsefulLifeFromAnnualRate(annualDepreciationRate);
  const baseError = getDepreciationBaseError(
    annualDepreciationRate,
    originalCost,
  );

  if (baseError) {
    return {
      amount: 0,
      closingAccumulatedDepreciation: openingAccumulatedDepreciation,
      closingBookValue: originalCost - openingAccumulatedDepreciation,
      error: baseError,
      warning: '',
    };
  }

  const lifetimeDays = Math.max(Math.round((usefulLife || 0) * 30), 1);
  let currentDate = getPureDate(startDate);
  const lastDate = getPureDate(endDate);
  let amount = 0;
  let accumulated = openingAccumulatedDepreciation;
  let warning = '';

  while (currentDate <= lastDate) {
    const remainingAmount = Math.max(
      originalCost - accumulated - salvageValue,
      0,
    );

    if (remainingAmount <= 0) {
      warning = warning || 'Depreciation already reached salvage value.';
      break;
    }

    const dailyAmount = Math.max(
      calculateDailyAmount({
        accumulated,
        currentDate,
        lifetimeDays,
        scheduleStartDate,
      }),
      0,
    );
    const appliedAmount = Math.min(dailyAmount, remainingAmount);

    amount += appliedAmount;
    accumulated += appliedAmount;

    if (
      appliedAmount < dailyAmount ||
      originalCost - accumulated <= salvageValue
    ) {
      warning = `Depreciation reached salvage value on ${currentDate
        .toISOString()
        .slice(0, 10)}`;
      break;
    }

    currentDate = addDays(currentDate, 1);
  }

  return {
    amount,
    closingAccumulatedDepreciation: accumulated,
    closingBookValue: originalCost - accumulated,
    error: '',
    warning,
  };
};

const calculateStraightLineDepreciation = (input: TDepreciationInput) => {
  return calculateDailyDepreciation({
    input,
    calculateDailyAmount: ({ currentDate, lifetimeDays }) => {
      const depreciableAmount = Math.max(
        input.originalCost - (input.salvageValue || 0),
        0,
      );

      if (input.annualDepreciationRate && input.annualDepreciationRate > 0) {
        const monthlyAmount =
          (depreciableAmount * input.annualDepreciationRate) / 100 / 12;

        return monthlyAmount / getDaysInMonth(currentDate);
      }

      return depreciableAmount / lifetimeDays;
    },
  });
};

const calculateSumOfYearsDigitsDepreciation = (input: TDepreciationInput) => {
  const depreciableAmount = Math.max(
    input.originalCost - (input.salvageValue || 0),
    0,
  );

  return calculateDailyDepreciation({
    input,
    calculateDailyAmount: ({
      currentDate,
      lifetimeDays,
      scheduleStartDate,
    }) => {
      const ageDay = getDaysBetween(scheduleStartDate, currentDate) + 1;
      const remainingWeight = Math.max(lifetimeDays - ageDay + 1, 0);
      const sumOfDigits = (lifetimeDays * (lifetimeDays + 1)) / 2;

      return sumOfDigits
        ? (depreciableAmount * remainingWeight) / sumOfDigits
        : 0;
    },
  });
};

const calculateDecliningBalanceDepreciation = (
  input: TDepreciationInput,
  multiplier: number,
) => {
  const usefulLifeMonths = getUsefulLifeFromAnnualRate(
    input.annualDepreciationRate,
  );
  const usefulLifeYears = Math.max((usefulLifeMonths || 0) / 12, 1 / 365);
  const dailyRate = multiplier / usefulLifeYears / 365;

  return calculateDailyDepreciation({
    input,
    calculateDailyAmount: ({ accumulated }) =>
      (input.originalCost - accumulated) * dailyRate,
  });
};

const calculateDepreciationByMethod = (
  method: string,
  input: TDepreciationInput,
) => {
  switch (method) {
    case FIXED_ASSET_DEPRECIATION_METHODS.STRAIGHT_LINE:
      return calculateStraightLineDepreciation(input);
    case FIXED_ASSET_DEPRECIATION_METHODS.SUM_OF_YEARS_DIGITS:
      return calculateSumOfYearsDigitsDepreciation(input);
    case FIXED_ASSET_DEPRECIATION_METHODS.DOUBLE_DECLINING_BALANCE:
      return calculateDecliningBalanceDepreciation(input, 2);
    case FIXED_ASSET_DEPRECIATION_METHODS.DECLINING_BALANCE:
      return calculateDecliningBalanceDepreciation(input, 1);
    default:
      return {
        amount: 0,
        closingAccumulatedDepreciation:
          input.openingAccumulatedDepreciation || 0,
        closingBookValue:
          input.originalCost - (input.openingAccumulatedDepreciation || 0),
        error: `Unsupported fixed asset depreciation method: ${method}`,
        warning: '',
      };
  }
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

const getIncompleteBeforeAdjustment = async (
  models: IModels,
  adjust: Pick<IAdjustFixedAssetDocument, '_id' | 'date'>,
) => {
  return models.AdjustFixedAssets.findOne({
    _id: { $ne: adjust._id },
    date: { $lt: getPureDate(adjust.date) },
    status: {
      $nin: [ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH],
    },
  })
    .sort({ date: 1 })
    .lean();
};

const FXA_MOVEMENT_JOURNALS = [
  JOURNALS.FXA_INCOME,
  JOURNALS.FXA_OUT,
  JOURNALS.FXA_SALE,
  JOURNALS.FXA_MOVE,
  JOURNALS.FXA_MOVE_IN,
];

const getFxaMovementSign = (journal?: string) => {
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

const getFirstAcquisitionDate = async (models: IModels, endDate: Date) => {
  const firstTransaction = await models.Transactions.findOne({
    journal: JOURNALS.FXA_INCOME,
    date: { $lte: endDate },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    'details.fixedAssetId': { $exists: true, $ne: '' },
  })
    .sort({ date: 1 })
    .lean();

  if (firstTransaction?.date) {
    return getPureDate(firstTransaction.date);
  }

  const firstFixedAsset = await models.FixedAssets.findOne({
    acquisitionDate: { $lte: endDate },
  })
    .sort({ acquisitionDate: 1 })
    .lean();

  return firstFixedAsset?.acquisitionDate
    ? getPureDate(firstFixedAsset.acquisitionDate)
    : undefined;
};

const getPreviousFixedAssetDetailMap = async (
  models: IModels,
  adjustId?: string,
) => {
  const map = new Map<string, TPreviousFixedAssetDetail>();

  if (!adjustId) {
    return map;
  }

  const details = await models.AdjustFxaDetails.find({ adjustId }).lean();

  for (const detail of details) {
    if (!detail.fixedAssetId) {
      continue;
    }

    const current = map.get(detail.fixedAssetId) || {
      closingAccumulatedDepreciation: 0,
      closingBookValue: 0,
    };

    map.set(detail.fixedAssetId, {
      closingAccumulatedDepreciation:
        current.closingAccumulatedDepreciation +
        (detail.closingAccumulatedDepreciation || 0),
      closingBookValue:
        current.closingBookValue + (detail.closingBookValue || 0),
    });
  }

  return map;
};

const getUncompletedFixedAssetTransaction = async (
  models: IModels,
  beginDate: Date,
  endDate: Date,
) => {
  return models.Transactions.findOne({
    date: { $gte: beginDate, $lt: endDate },
    journal: { $in: FXA_MOVEMENT_JOURNALS },
    'details.fixedAssetId': { $exists: true, $ne: '' },
    status: { $nin: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
  })
    .sort({ date: 1 })
    .lean();
};

const getFxaMovements = async (models: IModels, endDate: Date) => {
  const transactions = await models.Transactions.find({
    journal: { $in: FXA_MOVEMENT_JOURNALS },
    date: { $lte: endDate },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    'details.fixedAssetId': { $exists: true, $ne: '' },
  })
    .sort({ date: 1, createdAt: 1 })
    .lean();
  const movements: TFixedAssetMovement[] = [];

  for (const transaction of transactions) {
    const sign = getFxaMovementSign(transaction.journal);

    if (!sign) {
      continue;
    }

    for (const detail of transaction.details || []) {
      if (!detail.fixedAssetId) {
        continue;
      }

      movements.push({
        fixedAssetId: detail.fixedAssetId,
        date: getPureDate(transaction.date),
        countDelta: sign * Math.max(0, Math.trunc(detail.count || 0)),
        branchId: detail.branchId || transaction.branchId,
        departmentId: detail.departmentId || transaction.departmentId,
        accountId: detail.accountId,
        transactionId: transaction._id,
        transactionDetailId: detail._id,
      });
    }
  }

  return movements;
};

const getLocationKey = (branchId?: string, departmentId?: string) =>
  `${branchId || ''}:${departmentId || ''}`;

const splitLocationKey = (key: string) => {
  const [branchId, departmentId] = key.split(':');

  return {
    branchId: branchId || undefined,
    departmentId: departmentId || undefined,
  };
};

const getAssetLocationCountsAtDate = (
  fixedAssetId: string,
  movements: TFixedAssetMovement[],
  date: Date,
) => {
  const counts = new Map<string, number>();

  for (const movement of movements) {
    if (
      movement.fixedAssetId !== fixedAssetId ||
      getPureDate(movement.date).getTime() > date.getTime()
    ) {
      continue;
    }

    const key = getLocationKey(movement.branchId, movement.departmentId);
    counts.set(key, (counts.get(key) || 0) + movement.countDelta);
  }

  return counts;
};

const getTotalCount = (counts: Map<string, number>) =>
  Array.from(counts.values()).reduce((sum, count) => sum + count, 0);

const validateInstanceForDepreciation = ({
  accountId,
  fixedAsset,
}: {
  accountId?: string;
  fixedAsset?: {
    _id?: string;
    originalCost?: number;
    depreciationMethod?: string;
    annualDepreciationRate?: number;
  };
}) => {
  const originalCost = fixedAsset?.originalCost || 0;
  const annualDepreciationRate = fixedAsset?.annualDepreciationRate;
  const depreciationMethod = fixedAsset?.depreciationMethod || 'straightLine';

  if (originalCost <= 0) {
    return `Fixed asset original cost is missing. Fixed asset: ${fixedAsset?._id}`;
  }

  if (!annualDepreciationRate || annualDepreciationRate <= 0) {
    return `Fixed asset annual depreciation rate is missing. Fixed asset: ${fixedAsset?._id}`;
  }

  if (!accountId) {
    return `Fixed asset account is missing. Fixed asset: ${fixedAsset?._id}`;
  }

  if (depreciationMethod === FIXED_ASSET_DEPRECIATION_METHODS.MANUAL) {
    return `Manual fixed asset depreciation requires entered depreciation detail. Fixed asset: ${fixedAsset?._id}`;
  }

  if (!FIXED_ASSET_DEPRECIATION_METHODS.ALL.includes(depreciationMethod)) {
    return `Unsupported fixed asset depreciation method. Fixed asset: ${fixedAsset?._id}`;
  }

  return '';
};

const calculateFixedAssetDepreciationByDay = ({
  beginDate,
  depreciationMethod,
  endDate,
  fixedAsset,
  movements,
  openingAccumulatedDepreciation,
  scheduleStartDate,
}: {
  beginDate: Date;
  depreciationMethod: string;
  endDate: Date;
  fixedAsset: IFixedAssetDocument;
  movements: TFixedAssetMovement[];
  openingAccumulatedDepreciation: number;
  scheduleStartDate: Date;
}) => {
  const originalCost = fixedAsset.originalCost || 0;
  const salvageValue = fixedAsset.salvageValue || 0;
  const openingCounts = getAssetLocationCountsAtDate(
    fixedAsset._id,
    movements,
    addDays(beginDate, -1),
  );
  const openingCount = getTotalCount(openingCounts);
  const activeCount = getTotalCount(
    getAssetLocationCountsAtDate(fixedAsset._id, movements, beginDate),
  );
  const depreciationByLocationKey = new Map<string, number>();
  let currentDate = beginDate;
  let warning = '';
  let error = '';
  let perUnitAccumulated =
    openingCount > 0
      ? openingAccumulatedDepreciation / openingCount
      : openingAccumulatedDepreciation / Math.max(activeCount, 1);

  while (currentDate <= endDate) {
    const counts = getAssetLocationCountsAtDate(
      fixedAsset._id,
      movements,
      currentDate,
    );
    const totalCount = getTotalCount(counts);

    if (totalCount <= 0) {
      currentDate = addDays(currentDate, 1);
      continue;
    }

    const dailyResult = calculateDepreciationByMethod(depreciationMethod, {
      originalCost,
      salvageValue,
      annualDepreciationRate: fixedAsset.annualDepreciationRate,
      startDate: currentDate,
      endDate: currentDate,
      scheduleStartDate,
      openingAccumulatedDepreciation: perUnitAccumulated,
    });
    const perUnitDepreciation = dailyResult.amount;

    for (const [locationKey, count] of counts) {
      if (count <= 0) {
        continue;
      }

      depreciationByLocationKey.set(
        locationKey,
        (depreciationByLocationKey.get(locationKey) || 0) +
          perUnitDepreciation * count,
      );
    }

    perUnitAccumulated = dailyResult.closingAccumulatedDepreciation;
    warning = warning || dailyResult.warning;
    error = error || dailyResult.error;
    currentDate = addDays(currentDate, 1);
  }

  const locationKeys = Array.from(
    new Set([
      ...Array.from(openingCounts.keys()),
      ...Array.from(
        getAssetLocationCountsAtDate(fixedAsset._id, movements, endDate).keys(),
      ),
      ...Array.from(depreciationByLocationKey.keys()),
    ]),
  );

  return locationKeys.reduce<Map<string, TFixedAssetLocationDepreciationRow>>(
    (map, locationKey) => {
      const openingLocationCount = openingCounts.get(locationKey) || 0;
      const closingCount =
        getAssetLocationCountsAtDate(fixedAsset._id, movements, endDate).get(
          locationKey,
        ) || 0;
      let periodDate = beginDate;
      let maxPeriodCount = 0;

      while (periodDate <= endDate) {
        maxPeriodCount = Math.max(
          maxPeriodCount,
          getAssetLocationCountsAtDate(
            fixedAsset._id,
            movements,
            periodDate,
          ).get(locationKey) || 0,
        );
        periodDate = addDays(periodDate, 1);
      }

      const depreciationAmount =
        depreciationByLocationKey.get(locationKey) || 0;
      const resultCount =
        closingCount > 0 || depreciationAmount <= 0
          ? closingCount
          : maxPeriodCount;
      const openingAccumulated =
        openingCount > 0
          ? openingAccumulatedDepreciation *
            (openingLocationCount / openingCount)
          : 0;
      const closingAccumulated = perUnitAccumulated * resultCount;
      const closingOriginalCost = originalCost * resultCount;
      const closingSalvageValue = salvageValue * resultCount;

      map.set(locationKey, {
        depreciationAmount,
        originalCost: closingOriginalCost,
        salvageValue: closingSalvageValue,
        openingBookValue:
          originalCost * openingLocationCount - openingAccumulated,
        openingAccumulatedDepreciation: openingAccumulated,
        closingAccumulatedDepreciation: closingAccumulated,
        closingBookValue: closingOriginalCost - closingAccumulated,
        error,
        warning,
      });

      return map;
    },
    new Map(),
  );
};

const validateFxaAdjustmentByDay = async ({
  adjustId,
  beginDate,
  endDate,
  fixedAssets,
  movements,
  models,
  userId,
}: {
  adjustId: string;
  beginDate: Date;
  endDate: Date;
  fixedAssets: IFixedAssetDocument[];
  movements: TFixedAssetMovement[];
  models: IModels;
  userId: string;
}): Promise<TDailyValidationResult> => {
  let currentDate = beginDate;

  while (currentDate <= endDate) {
    const nextDate = addDays(currentDate, 1);
    const uncompletedTr = await getUncompletedFixedAssetTransaction(
      models,
      currentDate,
      nextDate,
    );

    if (uncompletedTr) {
      return {
        successDate: addDays(currentDate, -1),
        error: `Fixed asset transaction must be in an active accounting status before adjusting. Transaction: ${
          uncompletedTr.number || uncompletedTr._id
        } (${uncompletedTr.status || 'unknown'})`,
      };
    }

    for (const fixedAsset of fixedAssets) {
      const count = getTotalCount(
        getAssetLocationCountsAtDate(fixedAsset._id, movements, currentDate),
      );

      if (count < 0) {
        return {
          successDate: addDays(currentDate, -1),
          error: `Fixed asset quantity became negative. Fixed asset: ${fixedAsset._id}`,
        };
      }

      if (count <= 0) {
        continue;
      }

      const error = validateInstanceForDepreciation({
        accountId: fixedAsset.accountId,
        fixedAsset,
      });

      if (error) {
        return { successDate: addDays(currentDate, -1), error };
      }
    }

    await models.AdjustFixedAssets.updateAdjustFixedAsset(adjustId, {
      checkedAt: new Date(),
      successDate: currentDate,
      status: ADJ_FXA_STATUSES.RUNNING,
      error: '',
      warning: '',
      modifiedBy: userId,
    });

    currentDate = nextDate;
  }

  return {};
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

  const incompleteBeforeAdjust = await getIncompleteBeforeAdjustment(
    models,
    adjust,
  );

  if (incompleteBeforeAdjust) {
    throw new Error('An earlier fixed asset adjustment is not completed yet.');
  }

  const beforeAdjust = await getPreviousAdjustment(
    models,
    adjust as IAdjustFixedAssetDocument,
  );
  const beginDate = beforeAdjust?.date
    ? addDays(getPureDate(beforeAdjust.date), 1)
    : await getFirstAcquisitionDate(models, date);

  if (!beginDate) {
    throw new Error(
      'No fixed asset acquisition found before this adjustment date.',
    );
  }

  return {
    beginDate,
    beforeAdjust,
  };
};

export const clearAdjustFixedAsset = async (
  models: IModels,
  userId: string,
  adjust: IAdjustFixedAssetDocument,
) => {
  if (
    ![
      ADJ_FXA_STATUSES.DRAFT,
      ADJ_FXA_STATUSES.PROCESS,
      ADJ_FXA_STATUSES.COMPLETE,
    ].includes(adjust.status)
  ) {
    throw new Error('This fixed asset adjustment cannot be cleared.');
  }

  const { beginDate } = await checkValidFixedAssetDate(models, adjust);

  await models.AdjustFxaDetails.deleteMany({ adjustId: adjust._id });

  return models.AdjustFixedAssets.updateAdjustFixedAsset(adjust._id, {
    beginDate,
    successDate: undefined,
    checkedAt: undefined,
    status: ADJ_FXA_STATUSES.DRAFT,
    error: '',
    warning: '',
    modifiedBy: userId,
  });
};

const getModifiedFixedAssetTransaction = async (
  models: IModels,
  adjust: IAdjustFixedAssetDocument,
) => {
  if (!adjust.beginDate || !adjust.successDate || !adjust.checkedAt) {
    return null;
  }

  return models.Transactions.findOne({
    date: { $gte: adjust.beginDate, $lte: adjust.successDate },
    'details.fixedAssetId': { $exists: true, $ne: '' },
    $or: [
      {
        updatedAt: { $exists: false },
        createdAt: { $gte: adjust.checkedAt },
      },
      { updatedAt: { $gte: adjust.checkedAt } },
    ],
  }).lean();
};

export const publishAdjustFixedAsset = async (
  models: IModels,
  userId: string,
  adjust: IAdjustFixedAssetDocument,
) => {
  if (adjust.status === ADJ_FXA_STATUSES.PUBLISH) {
    throw new Error('This fixed asset adjustment is already published.');
  }

  if (adjust.status !== ADJ_FXA_STATUSES.COMPLETE) {
    throw new Error('This fixed asset adjustment cannot be published yet.');
  }

  const modifiedTransaction = await getModifiedFixedAssetTransaction(
    models,
    adjust,
  );

  if (modifiedTransaction) {
    await models.AdjustFixedAssets.updateAdjustFixedAsset(adjust._id, {
      status: ADJ_FXA_STATUSES.PROCESS,
      modifiedBy: '',
    });

    throw new Error(
      'This fixed asset adjustment cannot be published yet. Cause: modified some transactions',
    );
  }

  return models.AdjustFixedAssets.updateAdjustFixedAsset(adjust._id, {
    status: ADJ_FXA_STATUSES.PUBLISH,
    modifiedBy: userId,
  });
};

export const cancelAdjustFixedAsset = async (
  models: IModels,
  userId: string,
  adjust: IAdjustFixedAssetDocument,
) => {
  if (adjust.status !== ADJ_FXA_STATUSES.PUBLISH) {
    throw new Error(
      'This fixed asset adjustment cannot be cancelled before publishing.',
    );
  }

  return models.AdjustFixedAssets.updateAdjustFixedAsset(adjust._id, {
    status: ADJ_FXA_STATUSES.DRAFT,
    modifiedBy: userId,
  });
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
  const fixedAssets = await models.FixedAssets.find({
    acquisitionDate: { $lte: endDate },
  }).lean();
  const previousFixedAssetDetails = await getPreviousFixedAssetDetailMap(
    models,
    beforeAdjust?._id,
  );
  const movements = await getFxaMovements(models, endDate);
  const validationResult = await validateFxaAdjustmentByDay({
    adjustId: adjust._id,
    beginDate,
    endDate,
    fixedAssets,
    movements,
    models,
    userId,
  });
  const details: IAdjustFxaDetail[] = [];

  if (validationResult.error) {
    await models.AdjustFxaDetails.replaceAdjustFxaDetails({
      adjustId: adjust._id,
      details,
    });

    return models.AdjustFixedAssets.updateAdjustFixedAsset(adjust._id, {
      beginDate,
      successDate: validationResult.successDate,
      checkedAt: new Date(),
      status: ADJ_FXA_STATUSES.PROCESS,
      error: validationResult.error,
      warning: '',
      modifiedBy: userId,
    });
  }

  for (const fixedAsset of fixedAssets) {
    const previousFixedAssetDetail = previousFixedAssetDetails.get(
      fixedAsset._id,
    );
    const depreciationEndDate = endDate;
    const scheduleStartDate = getPureDate(
      fixedAsset.depreciationStartDate ||
        fixedAsset.acquisitionDate ||
        beginDate,
    );
    const startDate = previousFixedAssetDetail?.closingBookValue
      ? beginDate
      : scheduleStartDate;

    if (startDate > depreciationEndDate) {
      continue;
    }

    let periodDate = startDate;
    let periodActiveCount = 0;

    while (periodDate <= depreciationEndDate) {
      periodActiveCount += getTotalCount(
        getAssetLocationCountsAtDate(fixedAsset._id, movements, periodDate),
      );
      periodDate = addDays(periodDate, 1);
    }

    if (periodActiveCount <= 0) {
      continue;
    }

    const openingAccumulatedDepreciation =
      previousFixedAssetDetail?.closingAccumulatedDepreciation || 0;
    const depreciationMethod = fixedAsset.depreciationMethod || 'straightLine';
    const resultByLocationKey = calculateFixedAssetDepreciationByDay({
      beginDate: startDate,
      depreciationMethod,
      endDate: depreciationEndDate,
      fixedAsset,
      movements,
      scheduleStartDate,
      openingAccumulatedDepreciation,
    });

    for (const [locationKey, result] of resultByLocationKey) {
      const accountId = fixedAsset.accountId;
      const snapshot = splitLocationKey(locationKey);

      if (!result || result.originalCost <= 0) {
        continue;
      }

      details.push({
        adjustId: adjust._id,
        fixedAssetId: fixedAsset._id,
        categoryId: fixedAsset.categoryId,
        accountId,
        branchId: snapshot.branchId,
        departmentId: snapshot.departmentId,
        originalCost: result.originalCost,
        salvageValue: result.salvageValue,
        openingBookValue: result.openingBookValue,
        openingAccumulatedDepreciation: result.openingAccumulatedDepreciation,
        depreciationAmount: result.depreciationAmount,
        bookDepreciationAmount: result.depreciationAmount,
        closingAccumulatedDepreciation: result.closingAccumulatedDepreciation,
        closingBookValue: result.closingBookValue,
        error:
          result.error || (!accountId ? 'Fixed asset account is missing.' : ''),
        warning: result.warning,
      });
    }
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

import { FIXED_ASSET_DEPRECIATION_METHODS } from '~/modules/fixedAssets/@types/constants';
import type { IFxaLedgerAsset } from './fxaLedger';
import { getFxaRulesAtDate, type TFxaCorrection } from './fxaRules';

const DAY_MS = 24 * 60 * 60 * 1000;

type TDepreciationInput = {
  originalCost: number;
  depreciationBase?: number;
  salvageValue?: number;
  annualDepreciationRate?: number;
  startDate: Date;
  endDate: Date;
  scheduleStartDate?: Date;
  /** Per-unit calculator input; callers normalize posted totals by active quantity. */
  preDeprecation?: number;
};

export type TFixedAssetMovement = {
  fixedAssetId: string;
  date: Date;
  countDelta: number;
  branchId?: string;
  departmentId?: string;
  accountId?: string;
  transactionId?: string;
  transactionDetailId?: string;
};

export const getPureDate = (value: Date) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const isSamePureDate = (left: Date, right: Date) =>
  getPureDate(left).getTime() === getPureDate(right).getTime();

export const getDateLabel = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

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

  if (
    originalCost === undefined ||
    !Number.isFinite(originalCost) ||
    originalCost < 0
  ) {
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
    preDeprecation = 0,
  } = input;
  const usefulLife = getUsefulLifeFromAnnualRate(annualDepreciationRate);
  const baseError = getDepreciationBaseError(
    annualDepreciationRate,
    originalCost,
  );

  if (baseError) {
    return {
      amount: 0,
      closingAccumulatedDepreciation: preDeprecation,
      closingBookValue: originalCost - preDeprecation,
      error: baseError,
      warning: '',
    };
  }

  const lifetimeDays = Math.max(Math.round((usefulLife || 0) * 30), 1);
  let currentDate = getPureDate(startDate);
  const lastDate = getPureDate(endDate);
  let amount = 0;
  let accumulated = preDeprecation;
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
      const depreciableAmount =
        input.depreciationBase ??
        Math.max(input.originalCost - (input.salvageValue || 0), 0);

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
  const depreciableAmount =
    input.depreciationBase ??
    Math.max(input.originalCost - (input.salvageValue || 0), 0);

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

export const calculateDepreciationByMethod = (
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
        closingAccumulatedDepreciation: input.preDeprecation || 0,
        closingBookValue: input.originalCost - (input.preDeprecation || 0),
        error: `Unsupported fixed asset depreciation method: ${method}`,
        warning: '',
      };
  }
};

export const getLocationKey = (branchId?: string, departmentId?: string) =>
  `${branchId || ''}:${departmentId || ''}`;

export const splitLocationKey = (key: string) => {
  const [branchId, departmentId] = key.split(':');

  return {
    branchId: branchId || undefined,
    departmentId: departmentId || undefined,
  };
};

export const getAssetLocationCountsAtDate = (
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

export const getTotalCount = (counts: Map<string, number>) =>
  Array.from(counts.values()).reduce((sum, count) => sum + count, 0);

export const calculateFxaTaxDepreciation = ({
  fixedAsset,
  beginDate,
  endDate,
  corrections,
  movements,
}: {
  fixedAsset: IFxaLedgerAsset;
  beginDate: Date;
  endDate: Date;
  corrections: TFxaCorrection[];
  movements: TFixedAssetMovement[];
}): Map<string, { amount: number; accumulated: number; error: string }> => {
  const amounts = new Map<string, number>();
  let accumulatedPerUnit = fixedAsset.taxOpeningDepreciation || 0;
  let depreciationBase: number | undefined;
  let taxScheduleStartDate = getPureDate(fixedAsset.depreciationStartDate);
  let date = getPureDate(fixedAsset.acquisitionDate);
  let error = '';
  // Shared dated cost, independent tax method/rate/accumulation.
  // Book depreciation postings never become tax depreciation expense.
  while (date <= endDate) {
    const rules = getFxaRulesAtDate(fixedAsset, corrections, date);
    const originalCost = rules.originalCost ?? fixedAsset.originalCost;
    const method =
      rules.taxDepreciationMethod || fixedAsset.taxDepreciationMethod;
    const rate =
      rules.taxAnnualDepreciationRate ?? fixedAsset.taxAnnualDepreciationRate;
    const salvage = rules.taxSalvageValue ?? fixedAsset.taxSalvageValue;
    if (
      !Number.isFinite(rate) ||
      rate <= 0 ||
      rate > 100 ||
      !Number.isFinite(salvage) ||
      salvage < 0 ||
      salvage > originalCost ||
      !FIXED_ASSET_DEPRECIATION_METHODS.ALL.includes(method) ||
      method === 'manual'
    ) {
      error = 'Valid automatic tax depreciation rules are required.';
      break;
    }
    const counts = getAssetLocationCountsAtDate(
      fixedAsset._id,
      movements,
      date,
    );
    const totalCount = getTotalCount(counts);
    const reset = corrections
      .filter(
        (correction) =>
          correction.fixedAssetId === fixedAsset._id &&
          isSamePureDate(correction.date, date) &&
          (correction.rules.taxPreDeprecation !== undefined ||
            correction.rules.originalCost !== undefined),
      )
      .at(-1);
    if (reset && totalCount > 0) {
      if (reset.rules.taxPreDeprecation !== undefined)
        accumulatedPerUnit = reset.rules.taxPreDeprecation / totalCount;
      depreciationBase = Math.max(
        originalCost - accumulatedPerUnit - salvage,
        0,
      );
      taxScheduleStartDate = getPureDate(rules.depreciationStartDate || date);
    }
    if (
      !Number.isFinite(accumulatedPerUnit) ||
      accumulatedPerUnit < 0 ||
      accumulatedPerUnit > originalCost
    ) {
      error =
        'Tax accumulated depreciation must be between zero and shared asset cost.';
      break;
    }
    if (getTotalCount(counts) > 0 && date >= taxScheduleStartDate) {
      const result = calculateDepreciationByMethod(method, {
        originalCost,
        annualDepreciationRate: rate,
        salvageValue: salvage,
        startDate: date,
        endDate: date,
        scheduleStartDate: taxScheduleStartDate,
        depreciationBase,
        preDeprecation: accumulatedPerUnit,
      });
      error = result.error;
      accumulatedPerUnit = result.closingAccumulatedDepreciation;
      if (date >= beginDate) {
        for (const [key, count] of counts) {
          if (count > 0)
            amounts.set(key, (amounts.get(key) || 0) + result.amount * count);
        }
      }
    }
    date = addDays(date, 1);
  }
  const closing = getAssetLocationCountsAtDate(
    fixedAsset._id,
    movements,
    endDate,
  );
  return new Map(
    [...new Set([...closing.keys(), ...amounts.keys()])].map((key) => [
      key,
      {
        amount: amounts.get(key) || 0,
        accumulated: accumulatedPerUnit * Math.max(closing.get(key) || 0, 0),
        error,
      },
    ]),
  );
};

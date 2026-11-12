import { nanoid } from 'nanoid';
import {
  type TFixedAssetMovement,
  getPureDate,
  addDays,
  isSamePureDate,
  getDateLabel,
  calculateDepreciationByMethod,
  calculateFxaTaxDepreciation,
  splitLocationKey,
  getAssetLocationCountsAtDate,
  getTotalCount,
} from './fxaDepreciation';
import { getFxaDepreciationAccounts } from './fxaAccountConfigs';
import { getFxaDeferredTaxTransactions } from './fxaDeferredTax';
import { getFxaIncomeTaxRates } from './fxaIncomeTaxRates';
import { assertCanWriteTransactionAccounts } from './trPermissions';
import { getPreviousFxaAdjustment } from './fxaAdjustmentState';
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
import {
  getFxaLedgerAssets,
  IFxaLedgerAsset,
  fxaMovementSign,
} from './fxaLedger';
import {
  getFxaCorrections,
  getFxaRulesAtDate,
  TFxaCorrection,
} from './fxaRules';
import { getFxaRevaluationStates } from './fxaRevaluationState';

type TDailyValidationResult = {
  successDate?: Date;
  error?: string;
};

type TFixedAssetLocationDepreciationRow = {
  depreciationAmount: number;
  originalCost: number;
  salvageValue: number;
  accumulatedDepreciation: number;
  error: string;
  warning: string;
};

type TDepreciationMovement = {
  fixedAssetId: string;
  date: Date;
  amount: number;
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

const getFirstAcquisitionDate = async (models: IModels, endDate: Date) => {
  const firstTransaction = await models.Transactions.findOne({
    journal: JOURNALS.FXA_INCOME,
    date: { $lt: addDays(endDate, 1) },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    'details.fixedAssetId': { $exists: true, $ne: '' },
  })
    .sort({ date: 1 })
    .lean();

  if (firstTransaction?.date) {
    return getPureDate(firstTransaction.date);
  }

  return undefined;
};

const getUncompletedFixedAssetTransaction = async (
  models: IModels,
  beginDate: Date,
  endDate: Date,
) => {
  return models.Transactions.findOne({
    date: { $gte: beginDate, $lt: endDate },
    journal: {
      $in: [
        ...FXA_MOVEMENT_JOURNALS,
        JOURNALS.FXA_REVALUATION,
        JOURNALS.FXA_CAPITAL,
      ],
    },
    'details.fixedAssetId': { $exists: true, $ne: '' },
    status: { $nin: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
  })
    .sort({ date: 1 })
    .lean();
};

const getFxaMovements = async (models: IModels, endDate: Date) => {
  const transactions = await models.Transactions.find({
    journal: { $in: FXA_MOVEMENT_JOURNALS },
    date: { $lt: addDays(endDate, 1) },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    'details.fixedAssetId': { $exists: true, $ne: '' },
  })
    .sort({ date: 1, createdAt: 1 })
    .lean();
  const movements: TFixedAssetMovement[] = [];

  for (const transaction of transactions) {
    const sign = fxaMovementSign(transaction.journal);

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

const getDepreciationMovements = async (
  models: IModels,
  adjustId: string,
  endDate: Date,
) => {
  const accountConfigs = await getFxaDepreciationAccounts(models);
  const depreciationAccounts = new Set(
    Array.from(accountConfigs.values()).filter(Boolean),
  );
  const transactions = await models.Transactions.find({
    journal: {
      $in: [JOURNALS.FXA_DEP, JOURNALS.FXA_DEP_IN, JOURNALS.FXA_DEP_OUT],
    },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    date: {
      $lt: addDays(endDate, 1),
    },
    contentId: { $ne: adjustId },
    'details.fixedAssetId': { $exists: true, $ne: '' },
  })
    .sort({ date: 1, createdAt: 1 })
    .lean();
  const movements: TDepreciationMovement[] = [];

  for (const transaction of transactions) {
    if (
      ![JOURNALS.FXA_DEP, JOURNALS.FXA_DEP_IN, JOURNALS.FXA_DEP_OUT].includes(
        transaction.journal,
      )
    ) {
      continue;
    }
    let sign = 0;
    if (transaction.side === TR_SIDES.CREDIT) {
      sign = 1;
    } else if (transaction.side === TR_SIDES.DEBIT) {
      sign = -1;
    }
    for (const detail of transaction.details || []) {
      if (
        !detail.fixedAssetId ||
        !sign ||
        (transaction.journal === JOURNALS.FXA_DEP &&
          !depreciationAccounts.has(detail.accountId))
      ) {
        continue;
      }
      movements.push({
        fixedAssetId: detail.fixedAssetId,
        date: getPureDate(transaction.date),
        amount: sign * detail.amount,
      });
    }
  }
  return movements;
};

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
  depreciationMovements,
  scheduleStartDate,
  corrections,
}: {
  beginDate: Date;
  depreciationMethod: string;
  endDate: Date;
  fixedAsset: IFxaLedgerAsset;
  movements: TFixedAssetMovement[];
  depreciationMovements: TDepreciationMovement[];
  scheduleStartDate: Date;
  corrections: TFxaCorrection[];
}) => {
  const closingRules = getFxaRulesAtDate(fixedAsset, corrections, endDate);
  const originalCost =
    closingRules.originalCost ?? fixedAsset.originalCost ?? 0;
  const salvageValue = closingRules.salvageValue || 0;
  const openingCounts = getAssetLocationCountsAtDate(
    fixedAsset._id,
    movements,
    addDays(beginDate, -1),
  );
  const depreciationByLocationKey = new Map<string, number>();
  const assetDepreciationMovements = depreciationMovements.filter(
    (movement) => movement.fixedAssetId === fixedAsset._id,
  );
  const openingAccumulated = assetDepreciationMovements
    .filter((movement) => movement.date < beginDate)
    .reduce((sum, movement) => sum + movement.amount, 0);
  let postedAccumulated = openingAccumulated;
  let unpostedAccumulated = 0;
  let currentDate = beginDate;
  let warning = '';
  let error = '';
  let perUnitAccumulated = 0;

  while (currentDate <= endDate) {
    const counts = getAssetLocationCountsAtDate(
      fixedAsset._id,
      movements,
      currentDate,
    );
    const totalCount = getTotalCount(counts);

    // Keep posted balances separate from this calculation's unposted expense.
    // Disposal/movement debit entries, not quantity scaling, remove depreciation.
    postedAccumulated += assetDepreciationMovements
      .filter((movement) => isSamePureDate(movement.date, currentDate))
      .reduce((sum, movement) => sum + movement.amount, 0);
    const rules = getFxaRulesAtDate(fixedAsset, corrections, currentDate);
    const dailyOriginalCost =
      rules.originalCost ?? fixedAsset.originalCost ?? 0;
    const accumulated = postedAccumulated + unpostedAccumulated;
    if (
      !Number.isFinite(accumulated) ||
      accumulated < -0.005 ||
      accumulated > dailyOriginalCost * Math.max(totalCount, 0) + 0.005
    ) {
      error = `Fixed asset accumulated depreciation is inconsistent with quantity on ${getDateLabel(
        currentDate,
      )}. Fixed asset: ${fixedAsset._id}`;
      break;
    }

    if (totalCount <= 0) {
      perUnitAccumulated = 0;
      currentDate = addDays(currentDate, 1);
      continue;
    }

    perUnitAccumulated = Math.max(accumulated, 0) / totalCount;

    const effectiveScheduleStart = getPureDate(
      rules.depreciationStartDate || scheduleStartDate,
    );
    const dailyResult =
      currentDate < effectiveScheduleStart
        ? {
            amount: 0,
            closingAccumulatedDepreciation: perUnitAccumulated,
            warning: '',
            error: '',
          }
        : calculateDepreciationByMethod(
            rules.depreciationMethod || depreciationMethod,
            {
              originalCost: dailyOriginalCost,
              depreciationBase: rules.depreciationBase,
              salvageValue: rules.salvageValue || 0,
              annualDepreciationRate: rules.annualDepreciationRate,
              startDate: currentDate,
              endDate: currentDate,
              scheduleStartDate: effectiveScheduleStart,
              preDeprecation: perUnitAccumulated,
            },
          );
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

    unpostedAccumulated += dailyResult.amount * totalCount;
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
      const closingCount =
        getAssetLocationCountsAtDate(fixedAsset._id, movements, endDate).get(
          locationKey,
        ) || 0;
      const depreciationAmount =
        depreciationByLocationKey.get(locationKey) || 0;
      const closingAccumulated = perUnitAccumulated * closingCount;
      const closingOriginalCost = originalCost * closingCount;
      const closingSalvageValue = salvageValue * closingCount;

      map.set(locationKey, {
        depreciationAmount,
        originalCost: closingOriginalCost,
        salvageValue: closingSalvageValue,
        accumulatedDepreciation: closingAccumulated,
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
  corrections,
}: {
  adjustId: string;
  beginDate: Date;
  endDate: Date;
  fixedAssets: IFxaLedgerAsset[];
  movements: TFixedAssetMovement[];
  models: IModels;
  userId: string;
  corrections: TFxaCorrection[];
}): Promise<TDailyValidationResult> => {
  // Validate and publish progress one day at a time, stopping at the first error.
  const validateDay = async (
    currentDate: Date,
  ): Promise<TDailyValidationResult> => {
    if (currentDate > endDate) return {};
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
        fixedAsset: {
          ...fixedAsset,
          ...getFxaRulesAtDate(fixedAsset, corrections, currentDate),
        },
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

    return validateDay(nextDate);
  };

  return validateDay(beginDate);
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

  const beforeAdjust = await getPreviousFxaAdjustment(models, date, adjust._id);
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

const removeAdjustFixedAssetParent = async (
  models: IModels,
  adjustId: string,
  parentId: string,
) => {
  const remaining = await models.Transactions.find({
    contentType: 'accounting:adjustFixedAsset',
    contentId: adjustId,
    parentId,
  }).lean();
  if (remaining.some((row) => (row.parentId || row._id) === parentId)) {
    await models.Transactions.removePTransaction({ parentId });
  }
};

export const clearAdjustFixedAsset = async (
  models: IModels,
  userId: string,
  adjust: Pick<
    IAdjustFixedAssetDocument,
    '_id' | 'date' | 'status' | 'expenseAccountId' | 'taxExpenseAccountId'
  >,
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

  const transactions = await models.Transactions.find({
    contentType: 'accounting:adjustFixedAsset',
    contentId: adjust._id,
  }).lean();
  if (transactions.length) {
    await assertCanWriteTransactionAccounts({
      models,
      userId,
      docs: [],
      oldTrs: transactions,
    });
    const parentIds = [
      ...new Set(transactions.map((tr) => tr.parentId || tr._id)),
    ];
    await parentIds.reduce(async (previous, parentId) => {
      await previous;
      await removeAdjustFixedAssetParent(models, adjust._id, parentId);
    }, Promise.resolve());
  }

  const expenseAccountId =
    adjust.expenseAccountId ||
    transactions.find(
      (transaction) =>
        transaction.journal === JOURNALS.FXA_DEP &&
        transaction.side === TR_SIDES.DEBIT,
    )?.details[0]?.accountId;

  await models.AdjustFxaDetails.deleteMany({ adjustId: adjust._id });

  return models.AdjustFixedAssets.updateAdjustFixedAsset(adjust._id, {
    ...(expenseAccountId ? { expenseAccountId } : {}),
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
    $nor: [
      { contentType: 'accounting:adjustFixedAsset', contentId: adjust._id },
    ],
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
  if (
    ![ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH].includes(
      adjust.status,
    )
  ) {
    throw new Error(
      'Only completed or published fixed asset adjustments can be cancelled.',
    );
  }
  return clearAdjustFixedAsset(models, userId, {
    ...adjust,
    status: ADJ_FXA_STATUSES.COMPLETE,
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
  const fixedAssets = await getFxaLedgerAssets(models, endDate);
  const movements = await getFxaMovements(models, endDate);
  const depreciationMovements = await getDepreciationMovements(
    models,
    adjust._id,
    endDate,
  );
  const corrections = await getFxaCorrections(models, addDays(endDate, 1));
  const validationResult = await validateFxaAdjustmentByDay({
    corrections,
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

  const revaluationStates = await getFxaRevaluationStates(
    models,
    fixedAssets.map((asset) => asset._id),
    endDate,
  );
  const calculatedDetails = fixedAssets.map((fixedAsset) => {
    const assetDetails: IAdjustFxaDetail[] = [];
    const depreciationEndDate = endDate;
    const scheduleStartDate = getPureDate(
      fixedAsset.depreciationStartDate ||
        fixedAsset.acquisitionDate ||
        beginDate,
    );
    const acquisitionDate = getPureDate(
      fixedAsset.acquisitionDate || beginDate,
    );
    const startDate =
      beforeAdjust && beginDate > acquisitionDate ? beginDate : acquisitionDate;

    if (startDate > depreciationEndDate) return assetDetails;

    let periodDate = beginDate;
    let periodActiveCount = 0;

    while (periodDate <= depreciationEndDate) {
      periodActiveCount += getTotalCount(
        getAssetLocationCountsAtDate(fixedAsset._id, movements, periodDate),
      );
      periodDate = addDays(periodDate, 1);
    }

    if (periodActiveCount <= 0 && !fixedAsset.hasTaxDepreciation)
      return assetDetails;

    const depreciationMethod = fixedAsset.depreciationMethod || 'straightLine';
    const resultByLocationKey = calculateFixedAssetDepreciationByDay({
      beginDate: startDate,
      depreciationMethod,
      endDate: depreciationEndDate,
      fixedAsset,
      movements,
      depreciationMovements,
      scheduleStartDate,
      corrections,
    });

    let taxResults: ReturnType<typeof calculateFxaTaxDepreciation>;
    if (!fixedAsset.hasTaxDepreciation) {
      taxResults = new Map(
        Array.from(resultByLocationKey, ([key, result]) => [
          key,
          {
            amount: result.depreciationAmount,
            accumulated: result.accumulatedDepreciation,
            error: '',
          },
        ]),
      );
    } else if (periodActiveCount <= 0) {
      taxResults = new Map(
        Array.from(resultByLocationKey.keys(), (key) => [
          key,
          {
            amount: 0,
            accumulated: 0,
            error: '',
          },
        ]),
      );
    } else {
      taxResults = calculateFxaTaxDepreciation({
        fixedAsset,
        beginDate: startDate,
        endDate,
        corrections,
        movements,
      });
    }
    const revaluation = revaluationStates.get(fixedAsset._id) || {
      count: 0,
      loss: 0,
      reserve: 0,
    };
    const closingCounts = getAssetLocationCountsAtDate(
      fixedAsset._id,
      movements,
      endDate,
    );
    const totalClosingCount = getTotalCount(closingCounts);
    for (const [locationKey, result] of resultByLocationKey) {
      const accountId = fixedAsset.accountId;
      const snapshot = splitLocationKey(locationKey);

      if (
        !result ||
        (result.originalCost <= 0 &&
          result.depreciationAmount <= 0 &&
          !result.error &&
          !taxResults)
      ) {
        continue;
      }

      const tax = taxResults?.get(locationKey);
      assetDetails.push({
        ...(taxResults
          ? {
              taxDepreciationAmount: tax?.amount || 0,
              taxAccumulatedDepreciation: tax?.accumulated || 0,
            }
          : {}),
        adjustId: adjust._id,
        fixedAssetId: fixedAsset._id,
        categoryId: fixedAsset.categoryId,
        accountId,
        branchId: snapshot.branchId,
        departmentId: snapshot.departmentId,
        count: closingCounts.get(locationKey) || 0,
        revaluationLoss: totalClosingCount
          ? (revaluation.loss * (closingCounts.get(locationKey) || 0)) /
            totalClosingCount
          : 0,
        revaluationReserve: totalClosingCount
          ? (revaluation.reserve * (closingCounts.get(locationKey) || 0)) /
            totalClosingCount
          : 0,
        originalCost: result.originalCost,
        salvageValue: result.salvageValue,
        depreciationAmount: result.depreciationAmount,
        accumulatedDepreciation: result.accumulatedDepreciation,
        error:
          result.error ||
          tax?.error ||
          (fixedAsset.hasTaxDepreciation &&
          Math.abs((tax?.accumulated ?? 0) - result.accumulatedDepreciation) >
            0.005 &&
          getFxaRulesAtDate(fixedAsset, corrections, endDate).incomeTaxRate ===
            undefined
            ? 'Set the income tax rate on the acquisition or capitalization depreciation rules.'
            : '') ||
          (!accountId ? 'Fixed asset account is missing.' : ''),
        warning: result.warning,
      });
    }
    return assetDetails;
  });
  details.push(...calculatedDetails.flat());

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

export const createAdjustFixedAssetTransaction = async ({
  models,
  userId,
  adjust,
  expenseAccountId,
  taxExpenseAccountId,
}: {
  models: IModels;
  userId: string;
  adjust: IAdjustFixedAssetDocument;
  expenseAccountId: string;
  taxExpenseAccountId?: string;
}) => {
  const details = await models.AdjustFxaDetails.find({
    adjustId: adjust._id,
    error: { $in: [null, ''] },
  }).lean();
  if (
    !details.length &&
    (adjust.status !== ADJ_FXA_STATUSES.PROCESS || adjust.error)
  )
    throw new Error(
      'Calculate depreciation and resolve errors before closing.',
    );

  const content = {
    contentType: 'accounting:adjustFixedAsset',
    contentId: adjust._id,
  };
  const existing = await models.Transactions.find(content).lean();
  const parentIds = [
    ...new Set(existing.map((row) => row.parentId || row._id)),
  ];
  const firstParentId = parentIds[0];
  const retainedRows = existing.filter(
    (row) => (row.parentId || row._id) === firstParentId,
  );
  const discardedPointers = new Set(
    existing
      .filter((row) => (row.parentId || row._id) !== firstParentId)
      .map((row) => row.ptrId),
  );
  const previousBookPtrId = retainedRows.find(
    (row) => row.journal === JOURNALS.FXA_DEP,
  )?.ptrId;
  const depreciationPtrId =
    previousBookPtrId && !discardedPointers.has(previousBookPtrId)
      ? previousBookPtrId
      : nanoid();
  const previousTaxPtrId = retainedRows.find(
    (row) => row.journal === JOURNALS.FXA_DEFERRED_TAX,
  )?.ptrId;
  const taxPtrId =
    previousTaxPtrId &&
    previousTaxPtrId !== depreciationPtrId &&
    !discardedPointers.has(previousTaxPtrId)
      ? previousTaxPtrId
      : nanoid();
  const base = {
    ...content,
    date: adjust.date,
    description: adjust.description,
    status: TR_STATUSES.COMPLETE,
  };
  const expenseBalances = new Map<
    string,
    {
      ptrId: string;
      accountId: string;
      branchId?: string;
      departmentId?: string;
      amount: number;
    }
  >();
  const addExpense = (
    ptrId: string,
    accountId: string,
    detail: Pick<ITransaction['details'][number], 'branchId' | 'departmentId'>,
    amount: number,
  ) => {
    const branchId = detail.branchId || '';
    const departmentId = detail.departmentId || '';
    const key = JSON.stringify([ptrId, accountId, branchId, departmentId]);
    const previous = expenseBalances.get(key);
    expenseBalances.set(key, {
      ptrId,
      accountId,
      branchId,
      departmentId,
      amount: (previous?.amount || 0) + amount,
    });
  };
  const trDocs: ITransaction[] = [];
  if (details.length) {
    const accounts = await getFxaDepreciationAccounts(models);
    const depreciationDetails: ITransaction['details'] = [];
    for (const detail of details) {
      if (!detail.accountId)
        throw new Error(
          'Fixed asset account is missing on depreciation detail.',
        );
      const amount =
        Math.round((detail.depreciationAmount || 0) * 10000) / 10000;
      if (amount <= 0) continue;
      const accountId = accounts.get(detail.accountId);
      if (!accountId)
        throw new Error('Accumulated depreciation account config is missing.');
      depreciationDetails.push({
        accountId,
        amount,
        count: 0,
        unitPrice: 0,
        fixedAssetId: detail.fixedAssetId,
        branchId: detail.branchId,
        departmentId: detail.departmentId,
      });
      addExpense(depreciationPtrId, expenseAccountId, detail, amount);
    }
    if (depreciationDetails.length)
      trDocs.push({
        ...base,
        ptrId: depreciationPtrId,
        journal: JOURNALS.FXA_DEP,
        side: TR_SIDES.CREDIT,
        details: depreciationDetails,
      });
    const taxRates = await getFxaIncomeTaxRates(models, adjust.date, details);
    const taxDocs = await getFxaDeferredTaxTransactions(
      models,
      adjust,
      details.map((detail) => ({
        ...detail,
        incomeTaxRate: taxRates.get(detail.fixedAssetId || ''),
      })),
    );
    for (const transaction of taxDocs) {
      for (const detail of transaction.details) {
        addExpense(
          taxPtrId,
          taxExpenseAccountId || '',
          detail,
          (transaction.side === TR_SIDES.DEBIT ? -1 : 1) * detail.amount,
        );
      }
    }
    trDocs.push(
      ...taxDocs.map((transaction) => ({ ...transaction, ptrId: taxPtrId })),
    );
  }
  for (const ptrId of [depreciationPtrId, taxPtrId]) {
    const debit: ITransaction['details'] = [];
    const credit: ITransaction['details'] = [];
    for (const detail of expenseBalances.values()) {
      if (detail.ptrId !== ptrId) continue;
      const amount = Math.round(detail.amount * 10000) / 10000;
      if (!amount) continue;
      if (!detail.accountId)
        throw new Error(
          'Select an income tax expense account before posting deferred tax.',
        );
      (amount > 0 ? debit : credit).push({
        accountId: detail.accountId,
        branchId: detail.branchId,
        departmentId: detail.departmentId,
        amount: Math.abs(amount),
        count: 0,
        unitPrice: 0,
      });
    }
    for (const [side, rows] of [
      [TR_SIDES.DEBIT, debit],
      [TR_SIDES.CREDIT, credit],
    ] as const) {
      if (rows.length)
        trDocs.push({
          ...base,
          ptrId,
          journal: JOURNALS.MAIN,
          side,
          details: rows,
        });
    }
  }

  await assertCanWriteTransactionAccounts({
    models,
    userId,
    docs: trDocs,
    oldTrs: existing,
  });
  const retainedParentId = trDocs.length ? parentIds[0] : undefined;
  let transactions: ITransaction[] = [];
  if (trDocs.length) {
    if (retainedParentId) {
      transactions = await models.Transactions.updatePTransaction(
        retainedParentId,
        trDocs,
        userId,
        { preservePtrIds: true },
      );
    } else {
      transactions = await models.Transactions.createPTransaction(
        trDocs,
        userId,
        {
          preservePtrIds: true,
        },
      );
    }
  }
  await parentIds
    .filter((parentId) => parentId !== retainedParentId)
    .reduce(async (previous, parentId) => {
      await previous;
      await removeAdjustFixedAssetParent(models, adjust._id, parentId);
    }, Promise.resolve());
  const parentId = transactions[0]?.parentId;
  if (details.length)
    await models.AdjustFxaDetails.updateMany(
      { adjustId: adjust._id },
      parentId
        ? { $set: { transactionId: parentId, updatedAt: new Date() } }
        : {
            $unset: { transactionId: '', transactionDetailId: '' },
            $set: { updatedAt: new Date() },
          },
    );
  return models.AdjustFixedAssets.updateAdjustFixedAsset(adjust._id, {
    status: ADJ_FXA_STATUSES.COMPLETE,
    expenseAccountId,
    taxExpenseAccountId,
    modifiedBy: userId,
  });
};

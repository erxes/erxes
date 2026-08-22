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
import {
  FIXED_ASSET_DEPRECIATION_METHODS,
  FXA_INSTANCE_STATUSES,
  FXA_LOG_EVENT_TYPES,
} from '~/modules/fixedAssets/@types/constants';
import { IFxaInstanceDocument } from '~/modules/fixedAssets/@types/fxaInstance';
import { IFxaInstanceLogDocument } from '~/modules/fixedAssets/@types/fxaInstanceLog';

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
  scheduleStartDate?: Date;
  openingAccumulatedDepreciation?: number;
};

type TDailyValidationResult = {
  successDate?: Date;
  error?: string;
};

type TFxaSnapshot = {
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
  status?: string;
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

const getDepreciationBaseError = (
  usefulLife?: number,
  originalCost?: number,
) => {
  if (!usefulLife || usefulLife <= 0) {
    return 'Useful life is required to calculate depreciation';
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
    usefulLife,
    startDate,
    endDate,
    scheduleStartDate = startDate,
    openingAccumulatedDepreciation = 0,
  } = input;
  const baseError = getDepreciationBaseError(usefulLife, originalCost);

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
    calculateDailyAmount: ({ lifetimeDays }) => {
      const depreciableAmount = Math.max(
        input.originalCost - (input.salvageValue || 0),
        0,
      );

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
  const usefulLifeYears = Math.max((input.usefulLife || 0) / 12, 1 / 365);
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

const getFirstAcquisitionDate = async (models: IModels, endDate: Date) => {
  const firstInstance = await models.FxaInstances.findOne({
    acquisitionDate: { $lte: endDate },
  })
    .sort({ acquisitionDate: 1 })
    .lean();

  return firstInstance?.acquisitionDate
    ? getPureDate(firstInstance.acquisitionDate)
    : undefined;
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

const getUncompletedFixedAssetTransaction = async (
  models: IModels,
  beginDate: Date,
  endDate: Date,
) => {
  return models.Transactions.findOne({
    date: { $gte: beginDate, $lt: endDate },
    'details.fixedAssetId': { $exists: true, $ne: '' },
    status: { $nin: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
  })
    .sort({ date: 1 })
    .lean();
};

const getFxaPeriodLogs = async (
  models: IModels,
  beginDate: Date,
  endDate: Date,
) => {
  return models.FxaInstanceLogs.find({
    eventDate: { $gte: beginDate, $lte: endDate },
  })
    .sort({ eventDate: 1, createdAt: 1 })
    .lean();
};

const getFirstTerminalLogDate = (
  logs: IFxaInstanceLogDocument[],
  instanceId: string,
) => {
  const terminalLog = logs.find(
    (log) =>
      log.fxaInstanceId === instanceId &&
      [FXA_LOG_EVENT_TYPES.DISPOSAL, FXA_LOG_EVENT_TYPES.SALE].includes(
        log.eventType,
      ),
  );

  return terminalLog?.eventDate
    ? getPureDate(terminalLog.eventDate)
    : undefined;
};

const getInstanceSnapshotAtDate = (
  instance: IFxaInstanceDocument,
  logs: IFxaInstanceLogDocument[],
  date: Date,
): TFxaSnapshot => {
  const snapshot: TFxaSnapshot = {
    branchId: instance.branchId,
    departmentId: instance.departmentId,
    responsibleUserId: instance.responsibleUserId,
    status: FXA_INSTANCE_STATUSES.ACTIVE,
  };

  for (const log of logs) {
    if (
      log.fxaInstanceId !== instance._id ||
      getPureDate(log.eventDate).getTime() > date.getTime()
    ) {
      continue;
    }

    snapshot.branchId = log.toBranchId || snapshot.branchId;
    snapshot.departmentId = log.toDepartmentId || snapshot.departmentId;
    snapshot.responsibleUserId =
      log.toResponsibleUserId || snapshot.responsibleUserId;
    snapshot.status = log.toStatus || snapshot.status;
  }

  return snapshot;
};

const isInstanceActiveOnDate = (
  instance: IFxaInstanceDocument,
  logs: IFxaInstanceLogDocument[],
  date: Date,
) => {
  const acquisitionDate = instance.acquisitionDate
    ? getPureDate(instance.acquisitionDate)
    : undefined;

  if (!acquisitionDate || acquisitionDate > date) {
    return false;
  }

  const terminalDate = getFirstTerminalLogDate(logs, instance._id);

  return !terminalDate || terminalDate >= date;
};

const validateFxaLog = (log: IFxaInstanceLogDocument) => {
  if (!log.fxaInstanceId) {
    return 'Fixed asset instance log is missing instance id.';
  }

  if (!log.eventType || !FXA_LOG_EVENT_TYPES.ALL.includes(log.eventType)) {
    return `Fixed asset instance log has invalid event type. Instance: ${log.fxaInstanceId}`;
  }

  if (!log.eventDate) {
    return `Fixed asset instance log is missing event date. Instance: ${log.fxaInstanceId}`;
  }

  if (
    log.eventType === FXA_LOG_EVENT_TYPES.ACQUISITION &&
    !log.transactionDetailId
  ) {
    return `Fixed asset acquisition log is missing transaction detail. Instance: ${log.fxaInstanceId}`;
  }

  if (log.eventType === FXA_LOG_EVENT_TYPES.MOVE && !log.toBranchId) {
    return `Fixed asset move log is missing destination branch. Instance: ${log.fxaInstanceId}`;
  }

  if (
    [FXA_LOG_EVENT_TYPES.DISPOSAL, FXA_LOG_EVENT_TYPES.SALE].includes(
      log.eventType,
    ) &&
    !log.toStatus
  ) {
    return `Fixed asset disposal/sale log is missing target status. Instance: ${log.fxaInstanceId}`;
  }

  return '';
};

const validateInstanceForDepreciation = ({
  accountId,
  fixedAsset,
  instance,
}: {
  accountId?: string;
  fixedAsset?: {
    depreciationMethod?: string;
    usefulLife?: number;
  };
  instance: IFxaInstanceDocument;
}) => {
  const originalCost = instance.originalCost || 0;
  const usefulLife = instance.usefulLife || fixedAsset?.usefulLife;
  const depreciationMethod =
    instance.depreciationMethod ||
    fixedAsset?.depreciationMethod ||
    'straightLine';

  if (originalCost <= 0) {
    return `Fixed asset original cost is missing. Instance: ${instance._id}`;
  }

  if (!usefulLife || usefulLife <= 0) {
    return `Fixed asset useful life is missing. Instance: ${instance._id}`;
  }

  if (!accountId) {
    return `Fixed asset account is missing. Instance: ${instance._id}`;
  }

  if (depreciationMethod === FIXED_ASSET_DEPRECIATION_METHODS.MANUAL) {
    return `Manual fixed asset depreciation requires entered depreciation detail. Instance: ${instance._id}`;
  }

  if (!FIXED_ASSET_DEPRECIATION_METHODS.ALL.includes(depreciationMethod)) {
    return `Unsupported fixed asset depreciation method. Instance: ${instance._id}`;
  }

  return '';
};

const validateFxaAdjustmentByDay = async ({
  adjustId,
  accountByInstanceId,
  beginDate,
  endDate,
  fixedAssetById,
  instances,
  logs,
  models,
  userId,
}: {
  adjustId: string;
  accountByInstanceId: Map<string, string | undefined>;
  beginDate: Date;
  endDate: Date;
  fixedAssetById: Map<
    string,
    { depreciationMethod?: string; usefulLife?: number }
  >;
  instances: IFxaInstanceDocument[];
  logs: IFxaInstanceLogDocument[];
  models: IModels;
  userId: string;
}): Promise<TDailyValidationResult> => {
  const undatedLog = logs.find((log) => !log.eventDate);

  if (undatedLog) {
    return {
      successDate: addDays(beginDate, -1),
      error: validateFxaLog(undatedLog),
    };
  }

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

    for (const log of logs.filter((item) =>
      isSamePureDate(item.eventDate, currentDate),
    )) {
      const error = validateFxaLog(log);

      if (error) {
        return { successDate: addDays(currentDate, -1), error };
      }
    }

    for (const instance of instances) {
      if (!isInstanceActiveOnDate(instance, logs, currentDate)) {
        continue;
      }

      const error = validateInstanceForDepreciation({
        accountId: accountByInstanceId.get(instance._id),
        fixedAsset: fixedAssetById.get(instance.fixedAssetId),
        instance,
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
  const previousDetails = await getPreviousDetailMap(models, beforeAdjust?._id);
  const instances = await models.FxaInstances.find({
    acquisitionDate: { $lte: endDate },
  }).lean();
  const fixedAssets = await models.FixedAssets.find({
    _id: { $in: instances.map((instance) => instance.fixedAssetId) },
  }).lean();
  const fixedAssetById = new Map(
    fixedAssets.map((fixedAsset) => [fixedAsset._id, fixedAsset]),
  );
  const accountByInstanceId = await getInstanceAccountMap(models, instances);
  const logs = await getFxaPeriodLogs(models, beginDate, endDate);
  const validationResult = await validateFxaAdjustmentByDay({
    adjustId: adjust._id,
    accountByInstanceId,
    beginDate,
    endDate,
    fixedAssetById,
    instances,
    logs,
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

  for (const instance of instances) {
    const fixedAsset = fixedAssetById.get(instance.fixedAssetId);
    const previousDetail = previousDetails.get(instance._id);
    const terminalDate = getFirstTerminalLogDate(logs, instance._id);
    const depreciationEndDate =
      terminalDate && terminalDate < endDate ? terminalDate : endDate;
    const scheduleStartDate = getPureDate(
      instance.depreciationStartDate || instance.acquisitionDate || beginDate,
    );
    const startDate = previousDetail?.closingBookValue
      ? beginDate
      : scheduleStartDate;

    if (startDate > depreciationEndDate) {
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
    const result = calculateDepreciationByMethod(depreciationMethod, {
      originalCost,
      salvageValue,
      usefulLife: instance.usefulLife || fixedAsset?.usefulLife,
      startDate,
      endDate: depreciationEndDate,
      scheduleStartDate,
      openingAccumulatedDepreciation,
    });
    const snapshot = getInstanceSnapshotAtDate(
      instance,
      logs,
      depreciationEndDate,
    );

    details.push({
      adjustId: adjust._id,
      fxaInstanceId: instance._id,
      fixedAssetId: instance.fixedAssetId,
      categoryId: instance.categoryId || fixedAsset?.categoryId,
      accountId,
      branchId: snapshot.branchId,
      departmentId: snapshot.departmentId,
      originalCost,
      salvageValue,
      openingBookValue,
      openingAccumulatedDepreciation,
      depreciationAmount: result.amount,
      bookDepreciationAmount: result.amount,
      closingAccumulatedDepreciation: result.closingAccumulatedDepreciation,
      closingBookValue: result.closingBookValue,
      error:
        result.error || (!accountId ? 'Fixed asset account is missing.' : ''),
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

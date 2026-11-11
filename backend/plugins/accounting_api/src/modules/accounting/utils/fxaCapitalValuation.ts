import { getFxaTaxAccounts } from './fxaDeferredTax';
import {
  calculateFxaTaxDepreciation,
  getAssetLocationCountsAtDate,
  getTotalCount,
} from './fxaDepreciation';
import { getFxaDepreciationAccounts } from './fxaAccountConfigs';
import {
  getFxaLedgerAssets,
  fxaMovementSign,
  getFxaTransactionExclusionFilter,
} from './fxaLedger';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { getPreviousFxaAdjustment } from './fxaAdjustmentState';
import {
  JOURNALS,
  TR_INVENTORY_STATUS_TYPES,
  TR_SIDES,
} from '../@types/constants';
import { getFxaCorrections, getFxaRulesAtDate } from './fxaRules';
import { getFxaRevaluationState } from './fxaRevaluationState';
import { checkPermissionTrs } from './trPermissions';

export const fxaCapitalDate = (value: Date): Date => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()))
    throw new Error('Invalid capitalization date.');
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getFxaCapitalValuation = async (
  models: IModels,
  fixedAssetId: string,
  date: Date,
  excludeTransactionId?: string,
  user?: IUserDocument,
) => {
  const atDate = fxaCapitalDate(date);
  const endDate = new Date(atDate);
  endDate.setDate(endDate.getDate() + 1);
  const asset = (
    await getFxaLedgerAssets(models, date, [fixedAssetId], excludeTransactionId)
  )[0];
  if (
    !asset?.acquisitionDate ||
    fxaCapitalDate(asset.acquisitionDate) > atDate ||
    !asset.accountId
  ) {
    throw new Error('Select an acquired fixed asset with an asset account.');
  }
  const excluded = excludeTransactionId
    ? await models.Transactions.findOne({ _id: excludeTransactionId }).lean()
    : undefined;
  const exclusion = getFxaTransactionExclusionFilter(
    excluded,
    excludeTransactionId,
  );
  const transactions = await models.Transactions.find({
    'details.fixedAssetId': fixedAssetId,
    date: { $lt: endDate },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    ...exclusion,
  }).lean();
  if (
    user &&
    (await checkPermissionTrs(models, transactions, user)).some(
      (tr) => tr.permission === 'hidden',
    )
  ) {
    throw new Error('Permission denied for fixed asset valuation accounts.');
  }
  const depreciationAccounts = await getFxaDepreciationAccounts(models);
  const depreciationAccountId =
    depreciationAccounts.get(asset.accountId || '') || '';
  if (!depreciationAccountId)
    throw new Error(
      'Configure the accumulated depreciation account for this asset.',
    );
  const taxAccounts = (await getFxaTaxAccounts(models)).get(asset.accountId);
  const locations = new Map<
    string,
    {
      branchId: string;
      departmentId: string;
      count: number;
      deferredTaxAsset: number;
      deferredTaxLiability: number;
    }
  >();
  let accumulated = 0;
  for (const transaction of transactions) {
    for (const detail of transaction.details) {
      if (detail.fixedAssetId !== fixedAssetId) continue;
      const branchId = detail.branchId || transaction.branchId || '';
      const departmentId =
        detail.departmentId || transaction.departmentId || '';
      const key = JSON.stringify([branchId, departmentId]);
      const location = locations.get(key) || {
        branchId,
        departmentId,
        count: 0,
        deferredTaxAsset: 0,
        deferredTaxLiability: 0,
      };
      location.count +=
        fxaMovementSign(transaction.journal) * (detail.count || 0);
      const debit = transaction.side === TR_SIDES.CREDIT ? -1 : 1;
      if (taxAccounts?.asset && detail.accountId === taxAccounts.asset)
        location.deferredTaxAsset += detail.amount * debit;
      if (taxAccounts?.liability && detail.accountId === taxAccounts.liability)
        location.deferredTaxLiability -= detail.amount * debit;
      locations.set(key, location);
      if (
        detail.accountId === depreciationAccountId &&
        [JOURNALS.FXA_DEP, JOURNALS.FXA_DEP_IN, JOURNALS.FXA_DEP_OUT].includes(
          transaction.journal,
        )
      ) {
        accumulated +=
          detail.amount * (transaction.side === TR_SIDES.CREDIT ? 1 : -1);
      }
    }
  }
  if (Array.from(locations.values()).some((location) => location.count < 0)) {
    throw new Error('Fixed asset has negative location quantities.');
  }
  const activeLocations = Array.from(locations.values()).filter(
    (location) => location.count > 0,
  );
  const count = activeLocations.reduce(
    (sum, location) => sum + location.count,
    0,
  );
  const corrections = await getFxaCorrections(
    models,
    endDate,
    excludeTransactionId,
    [fixedAssetId],
  );
  const rules = getFxaRulesAtDate(asset, corrections, atDate);
  const previous = await getPreviousFxaAdjustment(models, atDate);
  const previousDay = new Date(atDate);
  previousDay.setDate(previousDay.getDate() - 1);
  const ready =
    fxaCapitalDate(asset.acquisitionDate).getTime() === atDate.getTime() ||
    Boolean(
      previous &&
        fxaCapitalDate(previous.date).getTime() === previousDay.getTime(),
    );
  let taxPreDeprecation = accumulated;
  if (asset.hasTaxDepreciation) {
    taxPreDeprecation = (asset.taxOpeningDepreciation || 0) * count;
    if (fxaCapitalDate(asset.acquisitionDate) < atDate) {
      const movements = transactions.flatMap((transaction) =>
        transaction.details
          .filter((detail) => detail.fixedAssetId === fixedAssetId)
          .map((detail) => ({
            fixedAssetId,
            date: fxaCapitalDate(transaction.date),
            countDelta:
              fxaMovementSign(transaction.journal) * (detail.count || 0),
            branchId: detail.branchId || transaction.branchId,
            departmentId: detail.departmentId || transaction.departmentId,
          })),
      );
      const tax = calculateFxaTaxDepreciation({
        fixedAsset: asset,
        beginDate: previousDay,
        endDate: previousDay,
        corrections,
        movements,
      });
      const taxError = [...tax.values()].find((row) => row.error)?.error;
      if (taxError) throw new Error(taxError);
      const priorCount = getTotalCount(
        getAssetLocationCountsAtDate(fixedAssetId, movements, previousDay),
      );
      taxPreDeprecation =
        priorCount > 0
          ? ([...tax.values()].reduce((sum, row) => sum + row.accumulated, 0) /
              priorCount) *
            count
          : 0;
    }
  }
  const revaluation = await getFxaRevaluationState(
    models,
    fixedAssetId,
    atDate,
    excludeTransactionId,
  );
  return {
    revaluationLoss: revaluation.loss,
    revaluationReserve: revaluation.reserve,
    fixedAssetId,
    accountId: asset.accountId,
    depreciationAccountId,
    count,
    originalCost: rules.originalCost ?? asset.originalCost ?? 0,
    preDeprecation: accumulated,
    hasTaxDepreciation: asset.hasTaxDepreciation === true,
    taxPreDeprecation,
    incomeTaxRate: rules.incomeTaxRate,
    taxDepreciationMethod:
      rules.taxDepreciationMethod || asset.taxDepreciationMethod,
    taxAnnualDepreciationRate:
      rules.taxAnnualDepreciationRate ?? asset.taxAnnualDepreciationRate,
    taxSalvageValue: rules.taxSalvageValue ?? asset.taxSalvageValue,
    annualDepreciationRate: rules.annualDepreciationRate || 0,
    depreciationMethod: rules.depreciationMethod || 'straightLine',
    salvageValue: rules.salvageValue || 0,
    depreciationStartDate: rules.depreciationStartDate || asset.acquisitionDate,
    depreciationThrough: previous?.date,
    ready,
    locations: activeLocations,
  };
};

export type TFxaCapitalValuation = Awaited<
  ReturnType<typeof getFxaCapitalValuation>
>;

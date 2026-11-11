import { IModels } from '~/connectionResolvers';
import { IFxaLedgerAsset } from './fxaLedger';
import { FIXED_ASSET_DEPRECIATION_METHODS } from '@/fixedAssets/@types/constants';
import { ADJ_FXA_STATUSES } from '../@types/adjustFixedAsset';
import { JOURNALS, TR_INVENTORY_STATUS_TYPES } from '../@types/constants';

export interface IFxaDepreciationRules extends Record<string, unknown> {
  originalCost?: number;
  depreciationBase?: number;
  depreciationMethod?: string;
  annualDepreciationRate?: number;
  salvageValue?: number;
  depreciationStartDate?: Date;
  taxDepreciationMethod?: string;
  taxAnnualDepreciationRate?: number;
  taxSalvageValue?: number;
  taxPreDeprecation?: number;
  incomeTaxRate?: number;
}

export type TFxaCorrection = {
  fixedAssetId: string;
  date: Date;
  rules: IFxaDepreciationRules;
};

export const readFxaCapitalRules = (
  info: Record<string, unknown> = {},
): IFxaDepreciationRules => {
  const rules: IFxaDepreciationRules = {};
  if (info.depreciationMethod !== undefined) {
    if (
      typeof info.depreciationMethod !== 'string' ||
      !FIXED_ASSET_DEPRECIATION_METHODS.ALL.includes(info.depreciationMethod) ||
      info.depreciationMethod === FIXED_ASSET_DEPRECIATION_METHODS.MANUAL
    ) {
      throw new TypeError('Choose a supported automatic depreciation method.');
    }
    rules.depreciationMethod = info.depreciationMethod;
  }
  for (const field of [
    'annualDepreciationRate',
    'salvageValue',
    'taxAnnualDepreciationRate',
    'taxSalvageValue',
    'incomeTaxRate',
  ] as const) {
    const value = info[field];
    if (value === undefined) continue;
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      (field === 'annualDepreciationRate' && value === 0) ||
      ((field === 'annualDepreciationRate' ||
        field === 'taxAnnualDepreciationRate' ||
        field === 'incomeTaxRate') &&
        value > 100)
    ) {
      throw new TypeError(`Invalid fixed asset correction ${field}.`);
    }
    rules[field] = value;
  }
  if (info.taxDepreciationMethod !== undefined) {
    if (
      typeof info.taxDepreciationMethod !== 'string' ||
      !FIXED_ASSET_DEPRECIATION_METHODS.ALL.includes(info.taxDepreciationMethod)
    )
      throw new TypeError('Choose a supported tax depreciation method.');
    rules.taxDepreciationMethod = info.taxDepreciationMethod;
  }
  if (info.depreciationStartDate !== undefined) {
    const value = info.depreciationStartDate;
    if (!(value instanceof Date) && typeof value !== 'string') {
      throw new TypeError('Invalid depreciation start date.');
    }
    const date = new Date(value);
    if (!Number.isFinite(date.getTime()))
      throw new TypeError('Invalid depreciation start date.');
    rules.depreciationStartDate = date;
  }
  for (const field of [
    'originalCost',
    'depreciationBase',
    'taxPreDeprecation',
  ] as const) {
    const value = info[field];
    if (value === undefined) continue;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
      throw new TypeError(`Invalid capitalization ${field}.`);
    rules[field] = value;
  }
  return rules;
};

export const getFxaCorrections = async (
  models: IModels,
  endDate: Date,
  excludeId?: string,
): Promise<TFxaCorrection[]> => {
  const transactions = await models.Transactions.find({
    journal: { $in: [JOURNALS.FXA_REVALUATION, JOURNALS.FXA_CAPITAL] },
    date: { $lt: endDate },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })
    .sort({ date: 1, createdAt: 1, _id: 1 })
    .lean();
  return transactions.flatMap((transaction) => {
    const byAsset = new Map<string, IFxaDepreciationRules>();
    for (const detail of transaction.details) {
      if (!detail.fixedAssetId) continue;
      const rules = readFxaCapitalRules(detail.followInfos);
      if (transaction.journal !== JOURNALS.FXA_CAPITAL) {
        delete rules.incomeTaxRate;
      }
      const previous = byAsset.get(detail.fixedAssetId) || {};
      byAsset.set(detail.fixedAssetId, {
        ...previous,
        ...rules,
        ...(rules.taxPreDeprecation !== undefined
          ? {
              taxPreDeprecation:
                (previous.taxPreDeprecation || 0) + rules.taxPreDeprecation,
            }
          : {}),
      });
    }
    return Array.from(byAsset, ([fixedAssetId, rules]) => ({
      fixedAssetId,
      date: pureDate(transaction.date),
      rules,
    }));
  });
};

export const getFxaRulesAtDate = (
  asset: Pick<
    IFxaLedgerAsset,
    | '_id'
    | 'originalCost'
    | 'depreciationMethod'
    | 'annualDepreciationRate'
    | 'salvageValue'
    | 'depreciationStartDate'
    | 'incomeTaxRate'
  >,
  corrections: TFxaCorrection[],
  date: Date,
): IFxaDepreciationRules =>
  corrections.reduce<IFxaDepreciationRules>(
    (rules, correction) =>
      correction.fixedAssetId === asset._id && correction.date <= date
        ? { ...rules, ...correction.rules }
        : rules,
    {
      incomeTaxRate: asset.incomeTaxRate,
      originalCost: asset.originalCost,
      depreciationMethod: asset.depreciationMethod,
      annualDepreciationRate: asset.annualDepreciationRate,
      salvageValue: asset.salvageValue,
      depreciationStartDate: asset.depreciationStartDate,
    },
  );

const pureDate = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const assertCorrectionDateOpen = async (
  models: IModels,
  date: Date,
): Promise<void> => {
  if (!Number.isFinite(new Date(date).getTime()))
    throw new Error('Invalid correction date.');
  const adjustment = await models.AdjustFixedAssets.findOne({
    date: { $gte: pureDate(date) },
    status: { $ne: ADJ_FXA_STATUSES.DRAFT },
  }).lean();
  if (adjustment) {
    throw new Error(
      'Clear later depreciation calculations before changing this correction.',
    );
  }
  const posted = await models.Transactions.findOne({
    journal: JOURNALS.FXA_DEP,
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    contentType: 'accounting:adjustFixedAsset',
    date: { $gte: pureDate(date) },
  }).lean();
  if (posted?.journal === JOURNALS.FXA_DEP) {
    throw new Error(
      'Remove later posted depreciation transactions before changing fixed asset rules.',
    );
  }
};

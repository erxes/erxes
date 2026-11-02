import { IModels } from '~/connectionResolvers';
import { IFixedAssetDocument } from '@/fixedAssets/@types/fixedAsset';
import { FIXED_ASSET_DEPRECIATION_METHODS } from '@/fixedAssets/@types/constants';
import { ADJ_FXA_STATUSES } from '../@types/adjustFixedAsset';
import {
  JOURNALS,
  TR_INVENTORY_STATUS_TYPES,
  TR_SIDES,
} from '../@types/constants';
import { ITransaction, ITransactionDocument } from '../@types/transaction';
import { createOrUpdateTr } from './utils';

export interface IFxaDepreciationRules extends Record<string, unknown> {
  originalCost?: number;
  depreciationBase?: number;
  depreciationMethod?: string;
  annualDepreciationRate?: number;
  salvageValue?: number;
  depreciationStartDate?: Date;
}

export type TFxaCorrection = {
  fixedAssetId: string;
  date: Date;
  rules: IFxaDepreciationRules;
};

export const readFxaCorrectionRules = (
  info: Record<string, unknown> = {},
): IFxaDepreciationRules => {
  const rules: IFxaDepreciationRules = {};
  if (info.depreciationMethod !== undefined) {
    if (
      typeof info.depreciationMethod !== 'string' ||
      !FIXED_ASSET_DEPRECIATION_METHODS.ALL.includes(info.depreciationMethod) ||
      info.depreciationMethod === FIXED_ASSET_DEPRECIATION_METHODS.MANUAL
    ) {
      throw new Error('Choose a supported automatic depreciation method.');
    }
    rules.depreciationMethod = info.depreciationMethod;
  }
  for (const field of ['annualDepreciationRate', 'salvageValue'] as const) {
    const value = info[field];
    if (value === undefined) continue;
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      (field === 'annualDepreciationRate' && (value === 0 || value > 100))
    ) {
      throw new Error(`Invalid fixed asset correction ${field}.`);
    }
    rules[field] = value;
  }
  if (info.depreciationStartDate !== undefined) {
    const value = info.depreciationStartDate;
    if (!(value instanceof Date) && typeof value !== 'string') {
      throw new Error('Invalid depreciation start date.');
    }
    const date = new Date(value);
    if (!Number.isFinite(date.getTime()))
      throw new Error('Invalid depreciation start date.');
    rules.depreciationStartDate = date;
  }
  return rules;
};

export const readFxaCapitalRules = (
  info: Record<string, unknown> = {},
): IFxaDepreciationRules => {
  const rules = readFxaCorrectionRules(info);
  for (const field of ['originalCost', 'depreciationBase'] as const) {
    const value = info[field];
    if (value === undefined) continue;
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      (field === 'originalCost' && value === 0)
    )
      throw new Error(`Invalid capitalization ${field}.`);
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
    journal: { $in: [JOURNALS.FXA_JUSTIFY, JOURNALS.FXA_CAPITAL] },
    date: { $lt: endDate },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })
    .sort({ date: 1, createdAt: 1, _id: 1 })
    .lean();
  return transactions.flatMap((transaction) =>
    transaction.details.flatMap((detail) =>
      detail.fixedAssetId
        ? [
            {
              fixedAssetId: detail.fixedAssetId,
              date: pureDate(transaction.date),
              rules:
                transaction.journal === JOURNALS.FXA_CAPITAL
                  ? readFxaCapitalRules(detail.followInfos)
                  : readFxaCorrectionRules(detail.followInfos),
            },
          ]
        : [],
    ),
  );
};

export const getFxaRulesAtDate = (
  asset: Pick<
    IFixedAssetDocument,
    | '_id'
    | 'originalCost'
    | 'depreciationMethod'
    | 'annualDepreciationRate'
    | 'salvageValue'
    | 'depreciationStartDate'
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

const assertNoLaterCapitalization = async (
  models: IModels,
  doc: ITransaction,
  excludeId?: string,
): Promise<void> => {
  const later = await models.Transactions.findOne({
    _id: { $ne: excludeId || doc._id },
    journal: JOURNALS.FXA_CAPITAL,
    'details.fixedAssetId': {
      $in: doc.details.map((detail) => detail.fixedAssetId).filter(Boolean),
    },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    date: { $gte: pureDate(doc.date) },
  }).lean();
  if (later?.journal === JOURNALS.FXA_CAPITAL)
    throw new Error(
      'Remove later capitalization before changing this historical correction.',
    );
};

export const validateFxaJustifyRemove = async (
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
): Promise<void> => {
  await assertCorrectionDateOpen(models, transaction.date);
  await assertNoLaterCapitalization(models, transaction);
};

export const validateFxaJustifySave = async (
  _subdomain: string,
  models: IModels,
  _userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
): Promise<void> => {
  await assertCorrectionDateOpen(models, doc.date);
  if (oldTr) {
    await assertCorrectionDateOpen(models, oldTr.date);
    await assertNoLaterCapitalization(models, oldTr, oldTr._id);
  }
  await assertNoLaterCapitalization(models, doc, oldTr?._id);
  if (
    !doc.details.length ||
    ![TR_SIDES.DEBIT, TR_SIDES.CREDIT].includes(doc.side || '')
  ) {
    throw new Error('A correction requires details and a debit/credit side.');
  }
  const ids = doc.details.map((detail) => detail.fixedAssetId);
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    throw new Error('Select each fixed asset once per correction.');
  }
  for (const detail of doc.details) {
    const asset = await models.FixedAssets.findOne({
      _id: detail.fixedAssetId,
    }).lean();
    if (
      !asset ||
      !asset.acquisitionDate ||
      pureDate(asset.acquisitionDate) > pureDate(doc.date)
    ) {
      throw new Error(
        'Correction requires an acquired fixed asset on this date.',
      );
    }
    const rules = readFxaCorrectionRules(detail.followInfos);
    if (
      !Number.isFinite(detail.amount) ||
      detail.amount < 0 ||
      (!Object.keys(rules).length && detail.amount === 0)
    ) {
      throw new Error(
        'Enter a depreciation rule change or accumulated depreciation correction.',
      );
    }
    const afterDate = pureDate(doc.date);
    afterDate.setDate(afterDate.getDate() + 1);
    const effectiveRules = getFxaRulesAtDate(
      asset,
      await getFxaCorrections(models, afterDate, oldTr?._id),
      pureDate(doc.date),
    );
    if (
      rules.salvageValue !== undefined &&
      rules.salvageValue >
        (effectiveRules.originalCost ?? asset.originalCost ?? 0)
    ) {
      throw new Error('Residual value cannot exceed the original unit cost.');
    }
    const configs = await models.Configs.getConfigs('FIXEDASSET_ACCOUNTS');
    const config = configs.find((row) => row.subId === asset.accountId);
    const value: unknown = config?.value;
    if (
      !value ||
      typeof value !== 'object' ||
      !('depreciationAccountId' in value) ||
      value.depreciationAccountId !== detail.accountId
    ) {
      throw new Error(
        'Select the configured accumulated depreciation account for this asset.',
      );
    }
    const nextDate = pureDate(doc.date);
    nextDate.setDate(nextDate.getDate() + 1);
    const duplicate = await models.Transactions.findOne({
      _id: { $ne: oldTr?._id || doc._id },
      journal: JOURNALS.FXA_JUSTIFY,
      date: { $gte: pureDate(doc.date), $lt: nextDate },
      status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
      'details.fixedAssetId': detail.fixedAssetId,
    }).lean();
    if (duplicate)
      throw new Error(
        'A correction already exists for this asset on this date.',
      );
    const ledger = await models.Transactions.find({
      _id: { $ne: oldTr?._id || doc._id },
      journal: {
        $in: [
          JOURNALS.FXA_DEP,
          JOURNALS.FXA_DEP_IN,
          JOURNALS.FXA_DEP_OUT,
          JOURNALS.FXA_JUSTIFY,
        ],
      },
      date: { $lt: nextDate },
      status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
      details: {
        $elemMatch: {
          fixedAssetId: detail.fixedAssetId,
          accountId: detail.accountId,
        },
      },
    }).lean();
    const accumulated = ledger.reduce(
      (total, transaction) =>
        total +
        transaction.details
          .filter(
            (row) =>
              row.fixedAssetId === detail.fixedAssetId &&
              row.accountId === detail.accountId,
          )
          .reduce(
            (sum, row) =>
              sum +
              row.amount * (transaction.side === TR_SIDES.CREDIT ? 1 : -1),
            0,
          ),
      0,
    );
    if (doc.side === TR_SIDES.DEBIT && detail.amount > accumulated + 0.005) {
      throw new Error('The decrease exceeds posted accumulated depreciation.');
    }
  }
};

export const saveFxaJustify = async (
  subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
): Promise<{
  mainTr: ITransactionDocument;
  otherTrs: ITransactionDocument[];
}> => {
  await validateFxaJustifySave(subdomain, models, userId, doc, oldTr);
  const endDate = pureDate(doc.date);
  endDate.setDate(endDate.getDate() + 1);
  const corrections = await getFxaCorrections(models, endDate, oldTr?._id);
  const details: ITransaction['details'] = [];
  for (const detail of doc.details) {
    const asset = await models.FixedAssets.findOne({
      _id: detail.fixedAssetId,
    }).lean();
    if (!asset) throw new Error('Fixed asset not found.');
    details.push({
      ...detail,
      count: 0,
      unitPrice: 0,
      followInfos: {
        ...readFxaCorrectionRules(detail.followInfos),
        previousDepreciationRules: getFxaRulesAtDate(
          asset,
          corrections,
          pureDate(doc.date),
        ),
      },
    });
  }
  const mainTr = await createOrUpdateTr(
    models,
    userId,
    {
      ...doc,
      date: pureDate(doc.date),
      details,
    },
    oldTr,
  );
  return { mainTr, otherTrs: [] };
};

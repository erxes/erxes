import { IModels } from '~/connectionResolvers';
import { IFixedAsset } from '@/fixedAssets/@types/fixedAsset';
import { ITransaction, ITrDetail } from '@/accounting/@types/transaction';
import {
  JOURNALS,
  TR_SIDES,
  TR_INVENTORY_STATUS_TYPES,
} from '@/accounting/@types/constants';

export interface IFxaLedgerAsset extends IFixedAsset {
  _id: string;
  accountId: string;
  count: number;
  currentCount: number;
  originalCost: number;
  accumulatedDepreciation: number;
  bookValue: number;
  acquisitionDate: Date;
  depreciationStartDate: Date;
  depreciationMethod: string;
  annualDepreciationRate: number;
  salvageValue: number;
  taxDepreciationMethod: string;
  taxAnnualDepreciationRate: number;
  taxSalvageValue: number;
}

export const assertFxaAcquisitionConsistency = (
  rows: { key: string; date: Date; detail: ITrDetail }[],
): void => {
  const signatures = new Map<string, string>();
  for (const { key, date, detail } of rows) {
    if (!detail.count || detail.count <= 0) continue;
    const info = detail.followInfos || {};
    const acquisitionDay = new Date(date);
    acquisitionDay.setHours(0, 0, 0, 0);
    const signature = JSON.stringify([
      acquisitionDay.getTime(),
      detail.accountId,
      Math.round((detail.amount / detail.count) * 1e8) / 1e8,
      new Date(info.depreciationStartDate || date).setHours(0, 0, 0, 0),
      info.depreciationMethod,
      info.annualDepreciationRate,
      info.salvageValue,
      info.taxDepreciationMethod,
      info.taxAnnualDepreciationRate,
      info.taxSalvageValue,
    ]);
    const previous = signatures.get(key);
    if (previous && previous !== signature) {
      throw new Error(
        `Fixed asset ${key} has different acquisition dates, costs or depreciation rules. Use a separate asset code for a separate acquisition.`,
      );
    }
    signatures.set(key, signature);
  }
};

export const fxaMovementSign = (journal: string): number => {
  if (journal === JOURNALS.FXA_INCOME || journal === JOURNALS.FXA_MOVE_IN)
    return 1;
  if (
    [JOURNALS.FXA_OUT, JOURNALS.FXA_MOVE, JOURNALS.FXA_SALE].includes(journal)
  )
    return -1;
  return 0;
};

export const buildFxaLedgerAssets = (
  assets: (IFixedAsset & { _id: string })[],
  transactions: Pick<ITransaction, 'journal' | 'date' | 'details' | 'side'>[],
  depreciationAccounts = new Map<string, string>(),
): IFxaLedgerAsset[] =>
  assets.flatMap((asset) => {
    const incomes = transactions
      .filter((transaction) => transaction.journal === JOURNALS.FXA_INCOME)
      .flatMap((transaction) =>
        transaction.details
          .filter(
            (detail) =>
              detail.fixedAssetId === asset._id && (detail.count || 0) > 0,
          )
          .map((detail) => ({ transaction, detail })),
      )
      .sort(
        (left, right) =>
          left.transaction.date.getTime() - right.transaction.date.getTime(),
      );
    const first = incomes[0];
    if (!first) return [];
    const count = incomes.reduce(
      (sum, value) => sum + (value.detail.count || 0),
      0,
    );
    const cost = incomes.reduce((sum, value) => sum + value.detail.amount, 0);
    const info = first.detail.followInfos || {};
    const date = first.transaction.date;
    const currentCount = transactions.reduce(
      (sum, transaction) =>
        sum +
        fxaMovementSign(transaction.journal) *
          transaction.details
            .filter((detail) => detail.fixedAssetId === asset._id)
            .reduce((total, detail) => total + (detail.count || 0), 0),
      0,
    );
    const depreciationAccountId = depreciationAccounts.get(
      first.detail.accountId,
    );
    let accumulatedDepreciation = 0;
    let costBalance = 0;
    for (const transaction of transactions) {
      for (const detail of transaction.details) {
        if (detail.fixedAssetId !== asset._id) continue;
        if (detail.accountId === first.detail.accountId) {
          costBalance +=
            detail.amount * (transaction.side === TR_SIDES.CREDIT ? -1 : 1);
        }
        if (
          depreciationAccountId &&
          detail.accountId === depreciationAccountId
        ) {
          accumulatedDepreciation +=
            detail.amount * (transaction.side === TR_SIDES.CREDIT ? 1 : -1);
        }
      }
    }
    return [
      {
        ...asset,
        accumulatedDepreciation,
        bookValue: costBalance - accumulatedDepreciation,
        accountId: first.detail.accountId,
        count,
        currentCount,
        originalCost: count ? cost / count : 0,
        acquisitionDate: date,
        depreciationStartDate: info.depreciationStartDate
          ? new Date(info.depreciationStartDate)
          : date,
        depreciationMethod:
          typeof info.depreciationMethod === 'string' && info.depreciationMethod
            ? info.depreciationMethod
            : 'straightLine',
        annualDepreciationRate: Number(info.annualDepreciationRate || 0),
        salvageValue: Number(info.salvageValue || 0),
        taxDepreciationMethod:
          typeof info.taxDepreciationMethod === 'string' &&
          info.taxDepreciationMethod
            ? info.taxDepreciationMethod
            : 'straightLine',
        taxAnnualDepreciationRate: Number(info.taxAnnualDepreciationRate || 0),
        taxSalvageValue: Number(info.taxSalvageValue || 0),
      },
    ];
  });

export const getFxaLedgerAssets = async (
  models: IModels,
  date: Date,
  ids?: string[],
  excludeTransactionId?: string,
) => {
  const assets = await models.FixedAssets.find(
    ids ? { _id: { $in: ids } } : {},
  ).lean();
  if (!assets.length) return [];
  const excluded = excludeTransactionId
    ? await models.Transactions.findOne(
        { _id: excludeTransactionId },
        { _id: 1, parentId: 1 },
      ).lean()
    : undefined;
  const endDate = new Date(date);
  endDate.setHours(0, 0, 0, 0);
  endDate.setDate(endDate.getDate() + 1);
  let exclusion: Record<string, unknown> = {};
  if (excluded?.parentId) exclusion = { parentId: { $ne: excluded.parentId } };
  else if (excludeTransactionId)
    exclusion = { _id: { $ne: excludeTransactionId } };
  const transactions = await models.Transactions.find({
    'details.fixedAssetId': { $in: assets.map((asset) => asset._id) },
    journal: {
      $in: [
        JOURNALS.FXA_INCOME,
        JOURNALS.FXA_OUT,
        JOURNALS.FXA_MOVE,
        JOURNALS.FXA_MOVE_IN,
        JOURNALS.FXA_SALE,
        JOURNALS.FXA_SALE_OUT,
        JOURNALS.FXA_CAPITAL,
        JOURNALS.FXA_REVALUATION,
        JOURNALS.FXA_DEP,
        JOURNALS.FXA_DEP_IN,
        JOURNALS.FXA_DEP_OUT,
      ],
    },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    date: { $lt: endDate },
    ...exclusion,
  }).lean();
  const configs = await models.Configs.getConfigs('FIXEDASSET_ACCOUNTS');
  const depreciationAccounts = new Map<string, string>();
  for (const config of configs) {
    const value: unknown = config.value;
    if (
      config.subId &&
      value &&
      typeof value === 'object' &&
      'depreciationAccountId' in value &&
      typeof value.depreciationAccountId === 'string'
    ) {
      depreciationAccounts.set(config.subId, value.depreciationAccountId);
    }
  }
  return buildFxaLedgerAssets(assets, transactions, depreciationAccounts);
};

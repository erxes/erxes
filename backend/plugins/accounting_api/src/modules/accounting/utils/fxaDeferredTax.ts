import type { IModels } from '~/connectionResolvers';
import { getFxaTaxValues, type TFxaTaxDetail } from './fxaTaxValues';
import type { ITransaction, ITrDetail } from '../@types/transaction';
import {
  JOURNALS,
  TR_SIDES,
  TR_STATUSES,
  TR_INVENTORY_STATUS_TYPES,
  TR_FOLLOW_TYPES,
  TR_DETAIL_FOLLOW_TYPES,
} from '../@types/constants';

const roundAmount = (amount: number): number =>
  Math.round(amount * 10000) / 10000;

const taxBalanceKey = (
  accountId: string,
  detail: Pick<TFxaTaxDetail, 'fixedAssetId' | 'branchId' | 'departmentId'>,
): string =>
  JSON.stringify([
    accountId,
    detail.fixedAssetId,
    detail.branchId || '',
    detail.departmentId || '',
  ]);

const indexTaxBalances = (
  transactions: ITransaction[],
): Map<string, number> => {
  const balances = new Map<string, number>();
  for (const transaction of transactions) {
    const sign = transaction.side === TR_SIDES.DEBIT ? 1 : -1;
    for (const detail of transaction.details) {
      if (!detail.accountId) continue;
      const key = taxBalanceKey(detail.accountId, {
        fixedAssetId: detail.fixedAssetId,
        branchId: detail.branchId ?? transaction.branchId,
        departmentId: detail.departmentId ?? transaction.departmentId,
      });
      balances.set(key, (balances.get(key) ?? 0) + detail.amount * sign);
    }
  }
  return balances;
};

export type TFxaTaxAccounts = {
  asset?: string;
  liability?: string;
  expense?: string;
  reserve?: string;
  loss?: string;
};

export const getFxaTaxAccounts = async (
  models: IModels,
): Promise<Map<string, TFxaTaxAccounts>> => {
  const configs = await models.Configs.getConfigs('FIXEDASSET_ACCOUNTS');
  const mappings = new Map<string, TFxaTaxAccounts>();
  for (const config of configs) {
    const value: unknown = config.value;
    if (!config.subId || !value || typeof value !== 'object') continue;
    mappings.set(config.subId, {
      asset:
        'taxAssetAccountId' in value &&
        typeof value.taxAssetAccountId === 'string'
          ? value.taxAssetAccountId
          : undefined,
      liability:
        'taxLiabilityAccountId' in value &&
        typeof value.taxLiabilityAccountId === 'string'
          ? value.taxLiabilityAccountId
          : undefined,
      reserve:
        'revaluationReserveAccountId' in value &&
        typeof value.revaluationReserveAccountId === 'string'
          ? value.revaluationReserveAccountId
          : undefined,
      loss:
        'revaluationLossAccountId' in value &&
        typeof value.revaluationLossAccountId === 'string'
          ? value.revaluationLossAccountId
          : undefined,
      expense:
        'TaxExpenseAccountId' in value &&
        typeof value.TaxExpenseAccountId === 'string'
          ? value.TaxExpenseAccountId
          : undefined,
    });
  }
  return mappings;
};

export const getFxaDeferredTaxTransactions = async (
  models: IModels,
  adjust: Pick<
    ITransaction,
    | 'date'
    | 'description'
    | 'status'
    | 'parentId'
    | 'ptrId'
    | 'number'
    | 'contentType'
    | 'contentId'
  > & { _id: string },
  details: TFxaTaxDetail[],
  options: {
    openingIncome?: boolean;
    sourceTransaction?: boolean;
    manualCounterpart?: boolean;
  } = {},
): Promise<ITransaction[]> => {
  const { openingIncome = false } = options;
  const sourceTransaction = options.sourceTransaction || openingIncome;
  const manualCounterpart =
    options.manualCounterpart ?? Boolean(sourceTransaction);
  const mappings = await getFxaTaxAccounts(models);
  const accountIds = [
    ...new Set(
      [...mappings.values()]
        .flatMap((value) => [value.asset, value.liability])
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const endDate = new Date(adjust.date);
  endDate.setHours(23, 59, 59, 999);
  const posted =
    !openingIncome && accountIds.length
      ? await models.Transactions.find({
          status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
          date: { $lte: endDate },
          'details.accountId': { $in: accountIds },
          $nor: sourceTransaction
            ? [
                {
                  originId: adjust._id,
                  originType: TR_FOLLOW_TYPES.FXA_DEFERRED_TAX,
                },
              ]
            : [
                {
                  contentType: 'accounting:adjustFixedAsset',
                  contentId: adjust._id,
                },
              ],
        }).lean()
      : [];
  const balances = indexTaxBalances(posted);
  const debit: ITrDetail[] = [];
  const credit: ITrDetail[] = [];
  for (const detail of details) {
    const target = getFxaTaxValues(detail, detail.incomeTaxRate);
    if (target.temporaryDifference === undefined) continue;
    if (
      Math.abs(target.temporaryDifference ?? 0) > 0.005 &&
      (detail.incomeTaxRate === undefined ||
        !Number.isFinite(detail.incomeTaxRate) ||
        detail.incomeTaxRate < 0 ||
        detail.incomeTaxRate > 100)
    )
      throw new Error(
        'Set a valid income tax rate on the acquisition or capitalization depreciation rules.',
      );
    const mapping = mappings.get(detail.accountId || '');
    const balance = (accountId?: string): number =>
      accountId ? balances.get(taxBalanceKey(accountId, detail)) ?? 0 : 0;
    const assetDelta = roundAmount(
      (target.deferredTaxAsset || 0) - balance(mapping?.asset),
    );
    const liabilityDelta = roundAmount(
      (target.deferredTaxLiability || 0) + balance(mapping?.liability),
    );
    const reserveChange = manualCounterpart
      ? 0
      : roundAmount((liabilityDelta - assetDelta) * (detail.reserveShare ?? 0));
    const expenseChange = manualCounterpart
      ? 0
      : roundAmount(liabilityDelta - assetDelta - reserveChange);
    if (
      Math.abs(assetDelta) < 0.0001 &&
      Math.abs(liabilityDelta) < 0.0001 &&
      Math.abs(reserveChange) < 0.0001
    )
      continue;
    if (
      (expenseChange && !mapping?.expense) ||
      (reserveChange && !mapping?.reserve) ||
      (assetDelta && !mapping?.asset) ||
      (liabilityDelta && !mapping?.liability)
    ) {
      throw new Error(
        manualCounterpart
          ? 'Configure deferred tax asset/liability accounts for the fixed asset account.'
          : 'Configure deferred tax asset/liability and income tax expense accounts for the fixed asset account.',
      );
    }
    for (const [accountId, signedDebit] of [
      [mapping?.asset, assetDelta],
      [mapping?.liability, -liabilityDelta],
      [mapping?.reserve, reserveChange],
      [mapping?.expense, expenseChange],
    ] as const) {
      if (!signedDebit || !accountId) continue;
      (signedDebit > 0 ? debit : credit).push({
        accountId,
        amount: Math.abs(signedDebit),
        count: 0,
        unitPrice: 0,
        ...(sourceTransaction
          ? {
              originId: detail.transactionDetailId,
              originType: TR_DETAIL_FOLLOW_TYPES.FXA_DEFERRED_TAX,
            }
          : {}),
        fixedAssetId: detail.fixedAssetId,
        branchId: detail.branchId,
        departmentId: detail.departmentId,
      });
    }
  }
  if (!debit.length && !credit.length) return [];
  return [
    { side: TR_SIDES.DEBIT, details: debit },
    { side: TR_SIDES.CREDIT, details: credit },
  ]
    .filter((row) => row.details.length)
    .map((row) => ({
      ...row,
      date: adjust.date,
      description: adjust.description,
      journal: JOURNALS.FXA_DEFERRED_TAX,
      status: sourceTransaction ? adjust.status : TR_STATUSES.COMPLETE,
      ...(sourceTransaction
        ? {
            originId: adjust._id,
            originType: TR_FOLLOW_TYPES.FXA_DEFERRED_TAX,
            parentId: adjust.parentId,
            ptrId: adjust.ptrId,
            number: adjust.number,
            contentType: adjust.contentType,
            contentId: adjust.contentId,
          }
        : {
            contentType: 'accounting:adjustFixedAsset',
            contentId: adjust._id,
          }),
    }));
};

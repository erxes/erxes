import type { IModels } from '~/connectionResolvers';
import { getFxaTaxValues } from './fxaTaxValues';
import type { IAdjustFxaDetail } from '../@types/adjustFixedAsset';
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

export type TFxaTaxAccounts = {
  asset?: string;
  liability?: string;
  expense?: string;
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
  details: (IAdjustFxaDetail & { incomeTaxRate?: number })[],
  options: { openingIncome?: boolean; sourceTransaction?: boolean } = {},
): Promise<ITransaction[]> => {
  const { openingIncome = false } = options;
  const sourceTransaction = options.sourceTransaction || openingIncome;
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
  const debit: ITrDetail[] = [];
  const credit: ITrDetail[] = [];
  for (const detail of details) {
    const target = getFxaTaxValues(detail, detail.incomeTaxRate);
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
      !accountId
        ? 0
        : posted.reduce(
            (total, tr) =>
              total +
              tr.details.reduce(
                (sum, row) =>
                  row.accountId === accountId &&
                  row.fixedAssetId === detail.fixedAssetId &&
                  (row.branchId ?? tr.branchId ?? '') ===
                    (detail.branchId || '') &&
                  (row.departmentId ?? tr.departmentId ?? '') ===
                    (detail.departmentId || '')
                    ? sum + row.amount * (tr.side === TR_SIDES.DEBIT ? 1 : -1)
                    : sum,
                0,
              ),
            0,
          );
    const assetDelta = roundAmount(
      (target.deferredTaxAsset || 0) - balance(mapping?.asset),
    );
    const liabilityDelta = roundAmount(
      (target.deferredTaxLiability || 0) + balance(mapping?.liability),
    );
    if (Math.abs(assetDelta) < 0.0001 && Math.abs(liabilityDelta) < 0.0001)
      continue;
    if (
      !mapping?.expense ||
      (assetDelta && !mapping.asset) ||
      (liabilityDelta && !mapping.liability)
    ) {
      throw new Error(
        'Configure deferred tax asset/liability and income tax expense accounts for the fixed asset account.',
      );
    }
    for (const [accountId, signedDebit] of [
      [mapping.asset, assetDelta],
      [mapping.liability, -liabilityDelta],
      [mapping.expense, liabilityDelta - assetDelta],
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
      journal: JOURNALS.MAIN,
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

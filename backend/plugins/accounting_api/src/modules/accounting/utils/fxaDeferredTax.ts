import type { IModels } from '~/connectionResolvers';
import type {
  IAdjustFixedAssetDocument,
  IAdjustFxaDetail,
} from '../@types/adjustFixedAsset';
import type { ITransaction, ITrDetail } from '../@types/transaction';
import {
  JOURNALS,
  TR_SIDES,
  TR_STATUSES,
  TR_INVENTORY_STATUS_TYPES,
} from '../@types/constants';

const roundAmount = (amount: number): number =>
  Math.round(amount * 10000) / 10000;

export const getFxaDeferredTaxTransactions = async (
  models: IModels,
  adjust: IAdjustFixedAssetDocument,
  details: IAdjustFxaDetail[],
): Promise<ITransaction[]> => {
  const configs = await models.Configs.getConfigs('FIXEDASSET_ACCOUNTS');
  const mappings = new Map<
    string,
    { asset?: string; liability?: string; expense?: string }
  >();
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
  const accountIds = [
    ...new Set(
      [...mappings.values()]
        .flatMap((value) => [value.asset, value.liability])
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const endDate = new Date(adjust.date);
  endDate.setHours(23, 59, 59, 999);
  const posted = accountIds.length
    ? await models.Transactions.find({
        status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
        date: { $lte: endDate },
        'details.accountId': { $in: accountIds },
        $nor: [
          { contentType: 'accounting:adjustFixedAsset', contentId: adjust._id },
        ],
      }).lean()
    : [];
  const debit: ITrDetail[] = [];
  const credit: ITrDetail[] = [];
  for (const detail of details) {
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
      (detail.deferredTaxAsset || 0) - balance(mapping?.asset),
    );
    const liabilityDelta = roundAmount(
      (detail.deferredTaxLiability || 0) + balance(mapping?.liability),
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
      status: TR_STATUSES.COMPLETE,
      contentType: 'accounting:adjustFixedAsset',
      contentId: adjust._id,
    }));
};

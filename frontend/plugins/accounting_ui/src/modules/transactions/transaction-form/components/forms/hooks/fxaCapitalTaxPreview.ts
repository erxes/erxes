import type { IFixedAssetAccountConfig } from '@/settings/fixed-assets/account-config/types/FixedAssetAccountConfig';
import type { ResultOf } from '@graphql-typed-document-node/core';
import type { FXA_CAPITAL_VALUATION } from '@/transactions/transaction-form/graphql/queries/fxaCapitalValuation';
import type { TTrDoc } from '@/transactions/transaction-form/types/JournalForms';
import type { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';

export type TFxaCapitalValuation = ResultOf<
  typeof FXA_CAPITAL_VALUATION
>['fixedAssetCapitalValuation'];

export type TFxaCapitalTaxAccounts = Record<
  string,
  IFixedAssetAccountConfig['value']
>;

export const buildFxaCapitalTaxPreview = (
  trDoc: TTrDoc,
  valuation: TFxaCapitalValuation,
  details: ITrDetail[],
  taxAccounts?: TFxaCapitalTaxAccounts,
): { follows: ITransaction[]; error?: string } => {
  if (
    trDoc.journal !== TrJournalEnum.FXA_CAPITAL ||
    !valuation.hasTaxDepreciation ||
    !taxAccounts
  )
    return { follows: [] };
  const config = taxAccounts[valuation.accountId];
  const debit: ITrDetail[] = [];
  const credit: ITrDetail[] = [];
  const rate =
    trDoc.details[0]?.followInfos?.incomeTaxRate ?? valuation.incomeTaxRate;
  const money = (amount: number) => Math.round(amount * 10000) / 10000;
  for (const [index, location] of valuation.locations.entries()) {
    const info = details[index].followInfos;
    const difference =
      (info?.taxPreDeprecation ?? 0) - (info?.preDeprecation ?? 0);
    if (
      (rate != null && (!Number.isFinite(rate) || rate < 0 || rate > 100)) ||
      (Math.abs(difference) > 0.005 && rate == null)
    )
      return { follows: [], error: 'fxa-capital-income-tax-rate-required' };
    const target = (difference * (rate ?? 0)) / 100;
    const assetDelta = money(
      Math.max(-target, 0) - (location.deferredTaxAsset ?? 0),
    );
    const liabilityDelta = money(
      Math.max(target, 0) - (location.deferredTaxLiability ?? 0),
    );
    if (!assetDelta && !liabilityDelta) continue;
    if (
      (assetDelta && !config?.taxAssetAccountId) ||
      (liabilityDelta && !config?.taxLiabilityAccountId)
    ) {
      return { follows: [], error: 'fxa-capital-tax-accounts-required' };
    }
    for (const [accountId, amount] of [
      [config?.taxAssetAccountId, assetDelta],
      [config?.taxLiabilityAccountId, -liabilityDelta],
    ] as const) {
      if (!accountId || !amount) continue;
      (amount > 0 ? debit : credit).push({
        _id: `${trDoc._id}-${TrJournalEnum.FXA_DEFERRED_TAX}-${
          valuation.fixedAssetId
        }-${index}-${accountId}-${amount > 0 ? 'dt' : 'ct'}`,
        originId: details[index]._id,
        originType: TrJournalEnum.FXA_DEFERRED_TAX,
        fixedAssetId: valuation.fixedAssetId,
        accountId,
        branchId: location.branchId,
        departmentId: location.departmentId,
        branch: details[index].branch,
        department: details[index].department,
        amount: Math.abs(amount),
        count: 0,
        unitPrice: 0,
      });
    }
  }
  return {
    follows: [
      { side: TR_SIDES.DEBIT, details: debit },
      { side: TR_SIDES.CREDIT, details: credit },
    ]
      .filter((row) => row.details.length)
      .map((row) => ({
        ...row,
        _id: `${trDoc._id}-${TrJournalEnum.FXA_DEFERRED_TAX}-${row.side}-${valuation.fixedAssetId}`,
        journal: TrJournalEnum.FXA_DEFERRED_TAX,
        originId: trDoc._id,
        originType: TrJournalEnum.FXA_DEFERRED_TAX,
        ptrId: trDoc.ptrId,
        parentId: trDoc.parentId,
        description: trDoc.description,
        sumDt:
          row.side === TR_SIDES.DEBIT
            ? row.details.reduce((sum, row) => sum + (row.amount ?? 0), 0)
            : 0,
        sumCt:
          row.side === TR_SIDES.CREDIT
            ? row.details.reduce((sum, row) => sum + (row.amount ?? 0), 0)
            : 0,
      })),
  };
};

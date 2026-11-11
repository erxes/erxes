import type { IFixedAssetAccountConfig } from '@/settings/fixed-assets/account-config/types/FixedAssetAccountConfig';
import type { TFxaIncomeJournal } from '@/transactions/transaction-form/types/JournalForms';
import type { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';
import { FXA_DEFERRED_TAX_ORIGIN } from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalTaxPreview';

export const buildFxaIncomeTaxPreview = (
  transaction: TFxaIncomeJournal,
  accounts: Record<string, IFixedAssetAccountConfig['value']>,
): { follows: ITransaction[]; error?: string } => {
  const debit: ITrDetail[] = [];
  const credit: ITrDetail[] = [];
  for (const detail of transaction.details) {
    const info = detail.followInfos;
    if (!info?.hasTaxDepreciation || detail.count <= 0) continue;
    const difference =
      (info.taxPreDeprecation ?? 0) - (info.preDeprecation ?? 0);
    if (Math.abs(difference) <= 0.005) continue;
    const rate = info.incomeTaxRate;
    if (rate === undefined || !Number.isFinite(rate) || rate < 0 || rate > 100)
      return { follows: [], error: 'fxa-income-tax-rate-required' };
    const tax = Math.round(((difference * rate) / 100) * 10000) / 10000;
    if (!tax) continue;
    const side = tax > 0 ? TR_SIDES.CREDIT : TR_SIDES.DEBIT;
    const config = accounts[detail.accountId || ''];
    const accountId =
      tax > 0 ? config?.taxLiabilityAccountId : config?.taxAssetAccountId;
    if (!accountId)
      return { follows: [], error: 'fxa-income-tax-accounts-required' };
    (tax > 0 ? credit : debit).push({
      _id: `${transaction._id}-${FXA_DEFERRED_TAX_ORIGIN}-${detail._id}-${side}`,
      originId: detail._id,
      originType: FXA_DEFERRED_TAX_ORIGIN,
      fixedAssetId: detail.fixedAssetId,
      accountId,
      branchId: detail.branchId || transaction.branchId,
      departmentId: detail.departmentId || transaction.departmentId,
      amount: Math.abs(tax),
      count: 0,
      unitPrice: 0,
    });
  }
  return {
    follows: [
      { side: TR_SIDES.DEBIT, details: debit },
      { side: TR_SIDES.CREDIT, details: credit },
    ]
      .filter((row) => row.details.length)
      .map((row) => ({
        ...row,
        _id: `${transaction._id}-${FXA_DEFERRED_TAX_ORIGIN}-${row.side}`,
        originId: transaction._id,
        originType: FXA_DEFERRED_TAX_ORIGIN,
        journal: TrJournalEnum.FXA_DEFERRED_TAX,
        parentId: transaction.parentId,
        ptrId: transaction.ptrId,
        description: transaction.description,
        sumDt:
          row.side === TR_SIDES.DEBIT
            ? row.details.reduce((sum, detail) => sum + (detail.amount ?? 0), 0)
            : 0,
        sumCt:
          row.side === TR_SIDES.CREDIT
            ? row.details.reduce((sum, detail) => sum + (detail.amount ?? 0), 0)
            : 0,
      })),
  };
};

export const mergeFxaIncomeTaxFollows = (
  previous: ITransaction[],
  follows: ITransaction[],
  originId: string,
): ITransaction[] => {
  const owned = previous.filter(
    (row) =>
      row.originId === originId && row.originType === FXA_DEFERRED_TAX_ORIGIN,
  );
  const next = [
    ...previous.filter((row) => !owned.includes(row)),
    ...follows.map((row) => {
      const saved = owned.find((old) => old.side === row.side);
      return {
        ...saved,
        ...row,
        _id: saved?._id || row._id,
        details: row.details.map((detail) => ({
          ...detail,
          _id:
            saved?.details.find(
              (old) =>
                old.originId === detail.originId &&
                old.accountId === detail.accountId,
            )?._id || detail._id,
        })),
      };
    }),
  ];
  return JSON.stringify(next) === JSON.stringify(previous) ? previous : next;
};

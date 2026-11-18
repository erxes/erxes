import type { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';
import type { TTrDoc } from '@/transactions/transaction-form/types/JournalForms';
import type { TFxaCapitalTaxAccounts } from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalTaxPreview';

export const buildFxaRevaluationPreview = (
  transaction: TTrDoc,
  details: ITrDetail[],
  accounts?: TFxaCapitalTaxAccounts,
): { follows: ITransaction[]; error?: string } => {
  if (transaction.journal !== TrJournalEnum.FXA_REVALUATION || !accounts)
    return { follows: [] };
  const debit: ITrDetail[] = [];
  const credit: ITrDetail[] = [];
  for (const detail of details) {
    const config = accounts[detail.accountId || ''];
    const loss = detail.followInfos?.revaluationLoss ?? 0;
    const reserve = detail.followInfos?.revaluationReserve ?? 0;
    if (
      (loss && !config?.revaluationLossAccountId) ||
      (reserve && !config?.revaluationReserveAccountId)
    )
      return { follows: [], error: 'fxa-revaluation-accounts-required' };
    for (const [accountId, signedDebit] of [
      [config?.revaluationLossAccountId, loss],
      [config?.revaluationReserveAccountId, -reserve],
    ] as const) {
      if (!accountId || !signedDebit) continue;
      (signedDebit > 0 ? debit : credit).push({
        _id: `${transaction._id}-${TrJournalEnum.FXA_REVALUATION_RESULT}-${
          detail._id
        }-${accountId}-${signedDebit > 0 ? 'dt' : 'ct'}`,
        originId: detail._id,
        originType: TrJournalEnum.FXA_REVALUATION_RESULT,
        fixedAssetId: detail.fixedAssetId,
        accountId,
        branchId: detail.branchId,
        departmentId: detail.departmentId,
        amount: Math.abs(signedDebit),
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
        _id: `${transaction._id}-${TrJournalEnum.FXA_REVALUATION_RESULT}-${row.side}`,
        originId: transaction._id,
        originType: TrJournalEnum.FXA_REVALUATION_RESULT,
        journal: TrJournalEnum.FXA_REVALUATION_RESULT,
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

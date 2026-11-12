import type { IModels } from '~/connectionResolvers';
import type { ITransaction, ITrDetail } from '../@types/transaction';
import {
  JOURNALS,
  TR_SIDES,
  TR_FOLLOW_TYPES,
  TR_DETAIL_FOLLOW_TYPES,
} from '../@types/constants';
import { getFxaAccounts } from './fxaAccountConfigs';

export const getFxaRevaluationTransactions = async (
  models: IModels,
  transaction: ITransaction,
): Promise<ITransaction[]> => {
  const mappings = await getFxaAccounts(models);
  const debit: ITrDetail[] = [];
  const credit: ITrDetail[] = [];
  for (const detail of transaction.details) {
    const mapping = mappings.get(detail.accountId);
    const loss = detail.followInfos?.revaluationLoss ?? 0;
    const reserve = detail.followInfos?.revaluationReserve ?? 0;
    if ((loss && !mapping?.loss) || (reserve && !mapping?.reserve))
      throw new Error(
        'Configure revaluation reserve/loss accounts for the fixed asset account.',
      );
    for (const [accountId, signedDebit] of [
      [mapping?.loss, loss],
      [mapping?.reserve, -reserve],
    ] as const) {
      if (!accountId || !signedDebit) continue;
      (signedDebit > 0 ? debit : credit).push({
        accountId,
        amount: Math.abs(signedDebit),
        count: 0,
        unitPrice: 0,
        fixedAssetId: detail.fixedAssetId,
        branchId: detail.branchId,
        departmentId: detail.departmentId,
        originId: detail._id,
        originType: TR_DETAIL_FOLLOW_TYPES.FXA_REVALUATION_RESULT,
      });
    }
  }
  return [
    { side: TR_SIDES.DEBIT, details: debit },
    { side: TR_SIDES.CREDIT, details: credit },
  ]
    .filter((row) => row.details.length)
    .map((row) => ({
      ...row,
      journal: JOURNALS.FXA_REVALUATION_RESULT,
      originId: transaction._id,
      originType: TR_FOLLOW_TYPES.FXA_REVALUATION_RESULT,
      date: transaction.date,
      description: transaction.description,
      status: transaction.status,
      parentId: transaction.parentId,
      ptrId: transaction.ptrId,
      number: transaction.number,
    }));
};

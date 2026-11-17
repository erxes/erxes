import { PipelineStage } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IReportFormula } from '../../@types/report';
import { TR_STATUSES } from '../../@types/constants';

export interface ReportAccount {
  _id: string;
  code?: string;
  categoryId?: string;
  kind?: string;
}
export interface ReportCategory {
  _id: string;
  parentId?: string;
}

export const selectReportAccounts = (
  accounts: ReportAccount[],
  categories: ReportCategory[],
  accountId?: string,
  categoryId?: string,
): ReportAccount[] => {
  const ids = new Set(categoryId ? [categoryId] : []);
  let size = -1;
  while (size !== ids.size) {
    size = ids.size;
    for (const category of categories)
      if (category.parentId && ids.has(category.parentId))
        ids.add(category._id);
  }
  return accounts.filter(
    (account) =>
      account._id === accountId ||
      (account.categoryId && ids.has(account.categoryId)),
  );
};

// Ordinary field predicates can run before unwind and use relation-code indexes.
// Older documents without materialized custom codes retain the default-side fallback.
export const relatedAccountMatch = (
  side: 'Dt' | 'Ct',
  codes: string[],
): Record<string, unknown> => ({
  $or: [
    { [`relAccounts.custom${side}`]: { $in: codes } },
    {
      [`relAccounts.custom${side}.0`]: { $exists: false },
      [`relAccounts.${side.toLowerCase()}`]: { $in: codes },
    },
  ],
});

export const calculateLedgerFormula = async (
  models: IModels,
  formula: IReportFormula,
  accounts: ReportAccount[],
  categories: ReportCategory[],
  date: Record<string, Date>,
  valueSide: 'debit' | 'credit',
): Promise<number> => {
  const debit = selectReportAccounts(
    accounts,
    categories,
    formula.debitAccountId,
    formula.debitAccountCategoryId,
  );
  const credit = selectReportAccounts(
    accounts,
    categories,
    formula.creditAccountId,
    formula.creditAccountCategoryId,
  );
  const balance = formula.kind === 'balance';
  const selected = balance
    ? [
        ...new Map(
          [...debit, ...credit].map((account) => [account._id, account]),
        ).values(),
      ]
    : valueSide === 'debit'
    ? debit
    : credit;
  if (!selected.length) return 0;
  const selectedIds = selected.map((account) => account._id);
  const transactionMatch: Record<string, unknown> = {
    status: { $in: TR_STATUSES.ACTIVE },
    date,
    'details.accountId': { $in: selectedIds },
  };
  if (!balance) {
    transactionMatch.side = valueSide === 'debit' ? 'dt' : 'ct';
    const other = valueSide === 'debit' ? credit : debit;
    if (other.length)
      Object.assign(
        transactionMatch,
        relatedAccountMatch(
          valueSide === 'debit' ? 'Ct' : 'Dt',
          other
            .map((account) => account.code)
            .filter((code): code is string => !!code),
        ),
      );
    if (
      !other.length &&
      (valueSide === 'debit'
        ? formula.creditAccountId || formula.creditAccountCategoryId
        : formula.debitAccountId || formula.debitAccountCategoryId)
    )
      return 0;
  }
  const pipeline: PipelineStage[] = [
    { $match: transactionMatch },
    { $unwind: '$details' },
    // Keep the detail match as well: unrelated details of a matching voucher must not sum.
    { $match: { 'details.accountId': { $in: selectedIds } } },
  ];
  pipeline.push({
    $group: {
      _id: '$details.accountId',
      amount: {
        $sum: balance
          ? {
              $cond: [
                { $eq: ['$side', 'dt'] },
                '$details.amount',
                { $multiply: ['$details.amount', -1] },
              ],
            }
          : '$details.amount',
      },
    },
  });
  const rows = await models.Transactions.aggregate<{
    _id: string;
    amount: number;
  }>(pipeline);
  const byId = new Map(selected.map((account) => [account._id, account]));
  return rows.reduce(
    (sum, row) =>
      sum +
      row.amount * (balance && byId.get(row._id)?.kind === 'passive' ? -1 : 1),
    0,
  );
};

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
export interface ReportTurnover {
  accountId: string;
  side: 'dt' | 'ct';
  // Effective opposite-side account codes: custom codes win, defaults fill in.
  related: string[];
  amount: number;
}
export interface ReportLedger {
  balances(date: Record<string, Date>): Promise<Map<string, number>>;
  turnovers(date: Record<string, Date>): Promise<ReportTurnover[]>;
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

// Older documents without materialized custom codes fall back to the defaults.
const effectiveRelated = (side: 'Dt' | 'Ct') => {
  const custom = `$relAccounts.custom${side}`;
  return {
    $cond: [
      { $gt: [{ $size: { $ifNull: [custom, []] } }, 0] },
      custom,
      { $ifNull: [`$relAccounts.${side.toLowerCase()}`, []] },
    ],
  };
};

// One aggregate per date window serves every formula of the run, as Erkhet
// prepares its interval dictionaries once and evaluates formulas in memory.
export const createReportLedger = (
  models: IModels,
  accountIds: string[],
): ReportLedger => {
  const balanceCache = new Map<string, Promise<Map<string, number>>>();
  const turnoverCache = new Map<string, Promise<ReportTurnover[]>>();
  const detailStages = (date: Record<string, Date>): PipelineStage[] => [
    {
      $match: {
        status: { $in: TR_STATUSES.ACTIVE },
        date,
        'details.accountId': { $in: accountIds },
      },
    },
    { $unwind: '$details' },
    // Unrelated details of a matching voucher must not sum.
    { $match: { 'details.accountId': { $in: accountIds } } },
  ];
  return {
    balances: (date) => {
      const key = JSON.stringify(date);
      let result = balanceCache.get(key);
      if (!result) {
        result = models.Transactions.aggregate<{ _id: string; amount: number }>(
          [
            ...detailStages(date),
            {
              $group: {
                _id: '$details.accountId',
                amount: {
                  $sum: {
                    $cond: [
                      { $eq: ['$side', 'dt'] },
                      '$details.amount',
                      { $multiply: ['$details.amount', -1] },
                    ],
                  },
                },
              },
            },
          ],
        ).then((rows) => new Map(rows.map((row) => [row._id, row.amount])));
        balanceCache.set(key, result);
      }
      return result;
    },
    turnovers: (date) => {
      const key = JSON.stringify(date);
      let result = turnoverCache.get(key);
      if (!result) {
        result = models.Transactions.aggregate<{
          _id: Omit<ReportTurnover, 'amount'>;
          amount: number;
        }>([
          ...detailStages(date),
          {
            $group: {
              _id: {
                accountId: '$details.accountId',
                side: '$side',
                related: {
                  $cond: [
                    { $eq: ['$side', 'dt'] },
                    effectiveRelated('Ct'),
                    effectiveRelated('Dt'),
                  ],
                },
              },
              amount: { $sum: '$details.amount' },
            },
          },
        ]).then((rows) =>
          rows.map((row) => ({ ...row._id, amount: row.amount })),
        );
        turnoverCache.set(key, result);
      }
      return result;
    },
  };
};

export const calculateLedgerFormula = async (
  ledger: ReportLedger,
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
  if (formula.kind === 'balance') {
    const selected = new Map(
      [...debit, ...credit].map((account) => [account._id, account]),
    );
    if (!selected.size) return 0;
    const balances = await ledger.balances(date);
    let total = 0;
    for (const account of selected.values())
      total +=
        (balances.get(account._id) ?? 0) *
        (account.kind === 'passive' ? -1 : 1);
    return total;
  }
  const isDebit = valueSide === 'debit';
  const selected = new Set((isDebit ? debit : credit).map(({ _id }) => _id));
  if (!selected.size) return 0;
  const other = isDebit ? credit : debit;
  const otherRequested = isDebit
    ? formula.creditAccountId || formula.creditAccountCategoryId
    : formula.debitAccountId || formula.debitAccountCategoryId;
  if (otherRequested && !other.length) return 0;
  const otherCodes = new Set(
    other
      .map((account) => account.code)
      .filter((code): code is string => !!code),
  );
  const side = isDebit ? 'dt' : 'ct';
  let total = 0;
  for (const turnover of await ledger.turnovers(date))
    if (
      turnover.side === side &&
      selected.has(turnover.accountId) &&
      (!otherRequested || turnover.related.some((code) => otherCodes.has(code)))
    )
      total += turnover.amount;
  return total;
};

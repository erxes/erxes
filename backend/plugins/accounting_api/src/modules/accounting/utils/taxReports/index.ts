import { IUserDocument } from 'erxes-api-shared/core-types';
import { getPureDate } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { TR_FOLLOW_TYPES } from '../../@types/constants';
import { IReportFormula } from '../../@types/report';
import { ITaxRowLedgerFormula } from '../../@types/taxRow';
import { generateFilter } from '../../graphql/resolvers/queries/accounts';
import { IReportFilterParams } from '../../graphql/resolvers/queries/journalReport';
import { getFilter } from '../journalReports/maps';
import {
  calculateLedgerFormula,
  createReportLedger,
  ReportAccount,
  ReportCategory,
} from '../tunableReports/ledger';
import { applyReportPercent } from '../tunableReports/percent';
import {
  calculateTaxReport,
  compareTaxRows,
  ITaxReportFollowTr,
  ITaxReportRowDoc,
  ITaxReportTransaction,
  TAX_REPORT_KINDS,
  TaxReportKind,
} from './calculation';
import { normalizeTaxRowNumber } from './formula';

export interface ITaxReportParams {
  kind: string;
  fromDate?: Date;
  toDate?: Date;
  branchId?: string;
  departmentId?: string;
  createdUserId?: string;
  modifiedUserId?: string;
  assignedUserId?: string;
}

const isTaxReportKind = (kind: string): kind is TaxReportKind =>
  (TAX_REPORT_KINDS as readonly string[]).includes(kind);

export const getLedgerDateMatch = (
  getDate: ITaxRowLedgerFormula['getDate'],
  fromDate: Date,
  toDate: Date,
): Record<string, Date> => {
  if (getDate === 'first') return { $lt: fromDate };
  if (getDate === 'last') return { $lte: toDate };
  return { $gte: fromDate, $lte: toDate };
};

const toReportFormula = (
  rowId: string,
  formula: ITaxRowLedgerFormula,
): IReportFormula => ({
  _id: formula._id,
  rowId,
  kind: formula.kind,
  plusOrMinus: formula.plusOrMinus,
  percent: formula.percent,
  debitAccountId: formula.debitAccountId,
  creditAccountId: formula.creditAccountId,
  debitAccountCategoryId: formula.debitAccountCategoryId,
  creditAccountCategoryId: formula.creditAccountCategoryId,
  getDate: formula.getDate,
  valueSide: formula.valueSide,
  ratioRule: 'divide',
});

/**
 * Account formula totals per row number, read from the ledger like tunable
 * report formulas: balances at the period start or end, or turnovers within
 * the period. They ignore the report's structure and contact filters.
 */
const calculateLedgerValues = async (
  models: IModels,
  rows: ITaxReportRowDoc[],
  user: IUserDocument,
  fromDate: Date,
  toDate: Date,
) => {
  const values = new Map<string, number>();
  const ledgerRows = rows.filter(
    (row) => row.kind !== 'title' && row.ledgerFormulas?.length,
  );

  if (!ledgerRows.length) return values;

  const filter = await generateFilter(models, { permissionMode: 'read' }, user);
  const [accounts, categories] = await Promise.all([
    models.Accounts.find(filter, {
      _id: 1,
      code: 1,
      categoryId: 1,
      kind: 1,
    }).lean<ReportAccount[]>(),
    models.AccountCategories.find({}, { _id: 1, parentId: 1 }).lean<
      ReportCategory[]
    >(),
  ]);
  const ledger = createReportLedger(
    models,
    accounts.map((account) => account._id),
  );

  // The ledger caches each date window, so formulas can run concurrently.
  const totals = await Promise.all(
    ledgerRows.map(async (row) => {
      const amounts = await Promise.all(
        (row.ledgerFormulas || []).map(async (formula) => {
          const amount = await calculateLedgerFormula(
            ledger,
            toReportFormula(row._id, formula),
            accounts,
            categories,
            getLedgerDateMatch(formula.getDate, fromDate, toDate),
            formula.valueSide ??
              (row.valueSide === 'credit' ? 'credit' : 'debit'),
          );

          return (
            applyReportPercent(amount, formula.percent) *
            (formula.plusOrMinus ? 1 : -1)
          );
        }),
      );

      return amounts.reduce((sum, amount) => sum + amount, 0);
    }),
  );

  ledgerRows.forEach((row, index) => {
    values.set(normalizeTaxRowNumber(row.number), totals[index]);
  });

  return values;
};

const findTaxRows = async (models: IModels, kind: TaxReportKind) => {
  const query = { status: 'active' };
  const rows =
    kind === 'vat'
      ? await models.VatRows.find(query).lean<ITaxReportRowDoc[]>()
      : await models.CtaxRows.find(query).lean<ITaxReportRowDoc[]>();

  return rows.sort(compareTaxRows);
};

export const getTaxReportRecords = async (
  subdomain: string,
  models: IModels,
  params: ITaxReportParams,
  user: IUserDocument,
) => {
  const { kind, fromDate, toDate, ...filterParams } = params;

  if (!isTaxReportKind(kind)) {
    throw new Error(`Unsupported tax report: ${kind}`);
  }

  if (!fromDate || !toDate) {
    throw new Error('Select the report period');
  }

  const from = getPureDate(fromDate);
  const to = getPureDate(toDate);
  const rows = await findTaxRows(models, kind);

  if (!rows.length) return [];

  const reportFilters: IReportFilterParams = {
    ...filterParams,
    accountBranchId: '',
    accountDepartmentId: '',
    accountCurrency: '',
    accountJournal: '',
  };
  const { transactionMatch, detailMatch } = await getFilter(
    subdomain,
    models,
    reportFilters,
    user,
  );
  const andFilters = [
    ...((transactionMatch.$and as Record<string, unknown>[]) || []),
    ...((detailMatch.$and as Record<string, unknown>[]) || []),
  ];
  const rowIds = rows.map((row) => row._id);
  const taxMatch =
    kind === 'vat'
      ? { hasVat: true, afterVat: { $ne: true }, vatRowId: { $in: rowIds } }
      : { hasCtax: true, ctaxRowId: { $in: rowIds } };

  const [transactions, ledgerValues] = await Promise.all([
    models.Transactions.find(
      {
        ...transactionMatch,
        ...(andFilters.length ? { $and: andFilters } : {}),
        date: { $gte: from, $lte: to },
        ...taxMatch,
      },
      {
        _id: 1,
        journal: 1,
        side: 1,
        vatRowId: 1,
        ctaxRowId: 1,
        details: 1,
      },
    ).lean<ITaxReportTransaction[]>(),
    calculateLedgerValues(models, rows, user, from, to),
  ]);

  const followTrs = transactions.length
    ? await models.Transactions.find(
        {
          originId: { $in: transactions.map((tr) => tr._id) },
          originType: { $in: [TR_FOLLOW_TYPES.VAT, TR_FOLLOW_TYPES.CTAX] },
        },
        { originId: 1, originType: 1, side: 1, details: 1 },
      ).lean<ITaxReportFollowTr[]>()
    : [];

  return calculateTaxReport(kind, rows, transactions, followTrs, ledgerValues);
};

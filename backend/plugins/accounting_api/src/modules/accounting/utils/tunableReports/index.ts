import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  IReportDefinition,
  IReportDocument,
  IReportGeneratedCell,
  IReportReference,
  IReportSection,
  reportGenerateInputSchema,
} from '../../@types/report';
import { generateFilter } from '../../graphql/resolvers/queries/accounts';
import {
  getReportCellFormulas,
  reportCellKey,
  resolveReportPeriod,
  resolveReportSource,
} from './cells';
import {
  calculateLedgerFormula,
  ReportAccount,
  ReportCategory,
} from './ledger';
import { reportDateMatch } from './period';
import { applyReportPercent } from './percent';

type Column = IReportSection['columns'][number];
type Row = IReportSection['rows'][number];
type Settings = Omit<ReturnType<typeof reportGenerateInputSchema.parse>, '_id'>;

export const generateTunableReport = async (
  models: IModels,
  report: IReportDocument,
  settings: Settings,
  user: IUserDocument,
): Promise<IReportGeneratedCell[]> => {
  const reports = new Map<string, IReportDefinition>([[report._id, report]]);
  const values = new Map<string, number>();
  const visiting = new Set<string>();
  const ledgerValues = new Map<string, Promise<number>>();
  let ledger:
    | Promise<{ accounts: ReportAccount[]; categories: ReportCategory[] }>
    | undefined;
  const getLedger = () =>
    (ledger ??= (async () => {
      const filter = await generateFilter(
        models,
        { permissionMode: 'read' },
        user,
      );
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
      return { accounts, categories };
    })());
  const referenceValue = async (
    owner: IReportDefinition,
    section: IReportSection,
    column: Column,
    reference: IReportReference,
  ): Promise<number> => {
    const reportId = reference.reportId || owner._id;
    let sourceReport = reports.get(reportId);
    if (!sourceReport) {
      sourceReport = await models.Reports.getReport(reportId);
      reports.set(reportId, sourceReport);
    }
    const resolved = resolveReportSource(
      { report: owner, section, column },
      reference,
      sourceReport,
    );
    return evaluate(
      resolved.report,
      resolved.section,
      resolved.row,
      resolved.column,
    );
  };
  const evaluate = async (
    owner: IReportDefinition,
    section: IReportSection,
    row: Row,
    column: Column,
  ): Promise<number> => {
    const key = reportCellKey({ report: owner, section, row, column });
    const cached = values.get(key);
    if (cached !== undefined) return cached;
    if (visiting.has(key)) throw new Error('Circular report formula reference');
    visiting.add(key);
    let total = 0;
    try {
      for (const formula of getReportCellFormulas(
        section,
        row._id,
        column._id,
      )) {
        let amount: number;
        if (formula.kind === 'from_row' || formula.kind === 'ratio') {
          if (!formula.source) throw new Error('A source row is required');
          amount = await referenceValue(owner, section, column, formula.source);
          if (formula.kind === 'ratio') {
            if (!formula.ratioSource)
              throw new Error('A ratio source is required');
            const operand = await referenceValue(
              owner,
              section,
              column,
              formula.ratioSource,
            );
            if (formula.ratioRule === 'divide' && operand === 0)
              throw new Error(
                `Cannot divide by zero in report ${owner.code}, row ${
                  row.number || row.name
                }`,
              );
            amount =
              formula.ratioRule === 'multiply'
                ? amount * operand
                : amount / operand;
          }
        } else {
          const period = resolveReportPeriod(formula, row, column);
          if (formula.kind === 'balance' && period.getDate === 'between')
            throw new Error(
              'Balance formulas require an opening or closing date',
            );
          const date = reportDateMatch(
            settings.fromDate,
            settings.toDate,
            period,
          );
          const side =
            formula.valueSide ??
            (row.valueSide === 'credit' ? 'credit' : 'debit');
          const ledgerKey = JSON.stringify([
            formula.kind,
            formula.debitAccountId,
            formula.creditAccountId,
            formula.debitAccountCategoryId,
            formula.creditAccountCategoryId,
            date,
            side,
          ]);
          let result = ledgerValues.get(ledgerKey);
          if (!result) {
            const { accounts, categories } = await getLedger();
            result = calculateLedgerFormula(
              models,
              formula,
              accounts,
              categories,
              date,
              side,
            );
            ledgerValues.set(ledgerKey, result);
          }
          amount = await result;
        }
        total +=
          applyReportPercent(amount, formula.percent) *
          (formula.plusOrMinus ? 1 : -1);
      }
      if (!Number.isFinite(total))
        throw new Error('Report formula produced a non-finite amount');
      if (row.kind === 'plus_formula') total = Math.max(0, total);
      values.set(key, total);
      return total;
    } finally {
      visiting.delete(key);
    }
  };
  const cells: IReportGeneratedCell[] = [];
  for (const section of report.sections.filter((item) => item.isActive))
    for (const row of section.rows.filter((item) => item.isActive))
      for (const column of section.columns.filter((item) => item.isActive)) {
        const numeric = row.kind !== 'title' && row.kind !== 'date';
        const hasFormula =
          getReportCellFormulas(section, row._id, column._id).length > 0;
        cells.push({
          sectionId: section._id,
          rowId: row._id,
          columnId: column._id,
          value:
            numeric && hasFormula
              ? await evaluate(report, section, row, column)
              : null,
        });
      }
  return cells;
};

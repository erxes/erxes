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
  createReportLedger,
  ReportAccount,
  ReportCategory,
  ReportLedger,
} from './ledger';
import { reportDateMatch, validateReportFormulaPeriod } from './period';
import { applyReportPercent } from './percent';

type Column = IReportSection['columns'][number];
type Row = IReportSection['rows'][number];
type Settings = Omit<ReturnType<typeof reportGenerateInputSchema.parse>, '_id'>;

// Amount cells are rounded to the requested unit and precision, and dependent
// formulas consume the rounded amount so printed totals equal their printed
// parts. Ratio cells keep full precision because they act as coefficients.
export const roundReportAmount = (
  value: number,
  { amountUnit, decimals }: Pick<Settings, 'amountUnit' | 'decimals'>,
): number => {
  const unit = amountUnit === 'thousands' ? 1000 : 1;
  const factor = 10 ** decimals;
  const scaled = Math.abs(value / unit) * factor;
  const rounded = Math.round(Number(scaled.toPrecision(15))) / factor;
  return rounded === 0
    ? 0
    : Number((Math.sign(value) * rounded * unit).toPrecision(15));
};

export const generateTunableReport = async (
  models: IModels,
  report: IReportDocument,
  settings: Settings,
  user: IUserDocument,
): Promise<IReportGeneratedCell[]> => {
  const reports = new Map<string, IReportDefinition>([[report._id, report]]);
  const values = new Map<string, number>();
  const visiting = new Set<string>();
  let ledger:
    | Promise<{
        accounts: ReportAccount[];
        categories: ReportCategory[];
        data: ReportLedger;
      }>
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
      return {
        accounts,
        categories,
        data: createReportLedger(
          models,
          accounts.map((account) => account._id),
        ),
      };
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
      const formulas = getReportCellFormulas(section, row._id, column._id);
      for (const formula of formulas) {
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
          validateReportFormulaPeriod(formula.kind, period.getDate);
          const side =
            formula.valueSide ??
            (row.valueSide === 'credit' ? 'credit' : 'debit');
          const { accounts, categories, data } = await getLedger();
          amount = await calculateLedgerFormula(
            data,
            formula,
            accounts,
            categories,
            reportDateMatch(settings.fromDate, settings.toDate, period),
            side,
          );
        }
        total +=
          applyReportPercent(amount, formula.percent) *
          (formula.plusOrMinus ? 1 : -1);
      }
      if (!Number.isFinite(total))
        throw new Error('Report formula produced a non-finite amount');
      if (row.kind === 'plus_formula') total = Math.max(0, total);
      if (!formulas.some((formula) => formula.kind === 'ratio'))
        total = roundReportAmount(total, settings);
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

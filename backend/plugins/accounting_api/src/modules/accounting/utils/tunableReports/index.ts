import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  IReportDefinition,
  IReportDocument,
  IReportFormula,
  IReportGeneratedCell,
  IReportReference,
  IReportSection,
  reportGenerateInputSchema,
} from '../../@types/report';
import { generateFilter } from '../../graphql/resolvers/queries/accounts';
import {
  getReportCellFormulas,
  reportCellKey,
  reportCellLabel,
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
  // Promise memo lets independent formulas and cells run concurrently while
  // sharing each dependency; cycles are detected on the evaluation path.
  const values = new Map<string, Promise<number>>();
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
          settings,
        ),
      };
    })());
  const referenceValue = async (
    owner: IReportDefinition,
    section: IReportSection,
    column: Column,
    reference: IReportReference,
    path: ReadonlySet<string>,
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
      path,
    );
  };
  const ratioAmount = async (
    owner: IReportDefinition,
    section: IReportSection,
    row: Row,
    column: Column,
    formula: IReportFormula,
    path: ReadonlySet<string>,
  ): Promise<number> => {
    if (!formula.source) throw new Error('A source row is required');
    if (formula.kind === 'from_row')
      return referenceValue(owner, section, column, formula.source, path);
    if (!formula.ratioSource) throw new Error('A ratio source is required');
    const [amount, operand] = await Promise.all([
      referenceValue(owner, section, column, formula.source, path),
      referenceValue(owner, section, column, formula.ratioSource, path),
    ]);
    if (formula.ratioRule === 'multiply') return amount * operand;
    if (operand === 0)
      throw new Error(
        `Cannot divide by zero in report ${owner.code}, row ${
          row.number || row.name
        }`,
      );
    return amount / operand;
  };
  const ledgerAmount = async (
    owner: IReportDefinition,
    section: IReportSection,
    row: Row,
    column: Column,
    formula: IReportFormula,
  ): Promise<number> => {
    const period = resolveReportPeriod(formula, row, column);
    validateReportFormulaPeriod(
      period.getDate,
      reportCellLabel({ report: owner, section, row, column }),
    );
    const side =
      formula.valueSide ?? (row.valueSide === 'credit' ? 'credit' : 'debit');
    const { accounts, categories, data } = await getLedger();
    return calculateLedgerFormula(
      data,
      formula,
      accounts,
      categories,
      reportDateMatch(settings.fromDate, settings.toDate, period),
      side,
    );
  };
  const formulaAmount = async (
    owner: IReportDefinition,
    section: IReportSection,
    row: Row,
    column: Column,
    formula: IReportFormula,
    path: ReadonlySet<string>,
  ): Promise<number> => {
    const amount =
      formula.kind === 'from_row' || formula.kind === 'ratio'
        ? await ratioAmount(owner, section, row, column, formula, path)
        : await ledgerAmount(owner, section, row, column, formula);
    return (
      applyReportPercent(amount, formula.percent) *
      (formula.plusOrMinus ? 1 : -1)
    );
  };
  const calculateCell = async (
    owner: IReportDefinition,
    section: IReportSection,
    row: Row,
    column: Column,
    path: ReadonlySet<string>,
  ): Promise<number> => {
    const formulas = getReportCellFormulas(section, row._id, column._id);
    const amounts = await Promise.all(
      formulas.map((formula) =>
        formulaAmount(owner, section, row, column, formula, path),
      ),
    );
    let total = amounts.reduce((sum, amount) => sum + amount, 0);
    if (!Number.isFinite(total))
      throw new Error('Report formula produced a non-finite amount');
    if (row.kind === 'plus_formula') total = Math.max(0, total);
    return formulas.some((formula) => formula.kind === 'ratio')
      ? total
      : roundReportAmount(total, settings);
  };
  const evaluate = (
    owner: IReportDefinition,
    section: IReportSection,
    row: Row,
    column: Column,
    path: ReadonlySet<string> = new Set(),
  ): Promise<number> => {
    const key = reportCellKey({ report: owner, section, row, column });
    // Check the path before the memo: an in-progress ancestor is a cycle.
    if (path.has(key))
      return Promise.reject(new Error('Circular report formula reference'));
    let value = values.get(key);
    if (!value) {
      value = calculateCell(
        owner,
        section,
        row,
        column,
        new Set(path).add(key),
      );
      values.set(key, value);
    }
    return value;
  };
  const cellValue = async (
    section: IReportSection,
    row: Row,
    column: Column,
  ): Promise<IReportGeneratedCell> => {
    const numeric = row.kind !== 'title' && row.kind !== 'date';
    const hasFormula =
      getReportCellFormulas(section, row._id, column._id).length > 0;
    return {
      sectionId: section._id,
      rowId: row._id,
      columnId: column._id,
      value:
        numeric && hasFormula
          ? await evaluate(report, section, row, column)
          : null,
    };
  };
  const activeCells = report.sections
    .filter((section) => section.isActive)
    .flatMap((section) =>
      section.rows
        .filter((row) => row.isActive)
        .flatMap((row) =>
          section.columns
            .filter((column) => column.isActive)
            .map((column) => ({ section, row, column })),
        ),
    );
  return Promise.all(
    activeCells.map(({ section, row, column }) =>
      cellValue(section, row, column),
    ),
  );
};

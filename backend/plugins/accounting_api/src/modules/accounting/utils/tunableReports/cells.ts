import {
  IReportDefinition,
  IReportFormula,
  IReportReference,
  IReportSection,
} from '../../@types/report';

export interface ReportCellContext {
  report: IReportDefinition;
  section: IReportSection;
  row: IReportSection['rows'][number];
  column: IReportSection['columns'][number];
}

export const reportCellKey = ({
  report,
  section,
  row,
  column,
}: ReportCellContext): string =>
  JSON.stringify([
    report._id,
    section._id,
    row._id,
    column._id,
    column.getDate,
    column.isPre,
  ]);

const labelOf = (item: { code?: string; name?: string; _id: string }) =>
  item.name?.trim() || item.code?.trim() || item._id;

// Identifies a cell for accountants: report, section, row number/name, column.
export const reportCellLabel = ({
  report,
  section,
  row,
  column,
}: ReportCellContext): string =>
  [
    report.code,
    labelOf(section),
    [row.number, row.name].filter((part) => part?.trim()).join('. ') || row._id,
    labelOf(column),
  ].join(' › ');

export const getReportCellFormulas = (
  section: IReportSection,
  rowId: string,
  columnId: string,
): IReportFormula[] =>
  section.formulas.filter(
    (formula) =>
      formula.rowId === rowId &&
      (section.formulaType === 'row' || formula.columnId === columnId),
  );

export const resolveReportPeriod = (
  formula: IReportFormula,
  row: ReportCellContext['row'],
  column: ReportCellContext['column'],
): { getDate: IReportFormula['getDate']; isPre: boolean } => ({
  getDate: formula.getDate ?? column.getDate ?? row.getDate,
  isPre: formula.isPre ?? column.isPre ?? row.isPre ?? false,
});

export const resolveReportSource = (
  current: Pick<ReportCellContext, 'report' | 'section' | 'column'>,
  reference: IReportReference,
  sourceReport?: IReportDefinition,
): ReportCellContext => {
  const section = sourceReport?.sections.find(
    (item) => item._id === (reference.sectionId || current.section._id),
  );
  const row = section?.rows.find((item) => item._id === reference.rowId);
  const sameSection =
    sourceReport?._id === current.report._id &&
    section?._id === current.section._id;
  // Without an explicit column, a reference borrows the current column's
  // period context only within its own section or a row-scoped section.
  const inheritsColumn = sameSection || section?.formulaType === 'row';
  let column: ReportCellContext['column'] | undefined;
  if (reference.columnId)
    column = section?.columns.find((item) => item._id === reference.columnId);
  else if (inheritsColumn) column = current.column;
  if (section && section.formulaType !== current.section.formulaType)
    throw new Error('Referenced sections must use the same formula scope');
  if (!sourceReport || !section || !row || !column)
    throw new Error(
      'Formula references a missing report, section, row or column; select a source column for cell-based sections',
    );
  if (row.kind === 'title' || row.kind === 'date')
    throw new Error('Formula source must be a numeric row');
  return { report: sourceReport, section, row, column };
};

import {
  IReportDefinition,
  IReportFormula,
  IReportSection,
  IReportReference,
} from '../@types/report';

export const resolveReportPeriod = (
  formula: IReportFormula,
  row: IReportSection['rows'][number],
  column: IReportSection['columns'][number],
) => ({
  getDate: formula.getDate ?? row.getDate ?? column.getDate,
  isPre: formula.isPre ?? row.isPre ?? column.isPre ?? false,
});
const requireUniqueIds = (items: { _id: string }[], label: string): void => {
  if (new Set(items.map((item) => item._id)).size !== items.length)
    throw new Error(`${label}: duplicate ids`);
};
type Column = IReportSection['columns'][number];
type Row = IReportSection['rows'][number];

export const validateReportDefinitions = (
  reports: IReportDefinition[],
): void => {
  const reportMap = new Map(reports.map((report) => [report._id, report]));
  const graph = new Map<string, string[]>();
  for (const report of reports) {
    requireUniqueIds(report.sections, 'Sections');
    for (const section of report.sections) {
      if (!section.columns.length && section.formulas.length)
        throw new Error('Add a column before configuring formulas');
      requireUniqueIds(section.columns, 'Columns');
      requireUniqueIds(section.rows, 'Rows');
      requireUniqueIds(section.formulas, 'Formulas');
      for (const formula of section.formulas) {
        if (!section.rows.some((row) => row._id === formula.rowId))
          throw new Error('Formula target row does not exist');
        if (
          section.formulaType === 'cell' &&
          !section.columns.some((column) => column._id === formula.columnId)
        )
          throw new Error('Formula target column does not exist');
        if (section.formulaType === 'row' && formula.columnId)
          throw new Error('Row formulas must not select a target column');
      }
    }
  }
  const findSource = (
    report: IReportDefinition,
    section: IReportSection,
    column: Column,
    source: IReportReference,
  ) => {
    const sourceReport = reportMap.get(source.reportId || report._id);
    const sourceSection = sourceReport?.sections.find(
      (item) => item._id === (source.sectionId || section._id),
    );
    const sourceRow = sourceSection?.rows.find(
      (item) => item._id === source.rowId,
    );
    const sameSection =
      sourceReport?._id === report._id && sourceSection?._id === section._id;
    const sourceColumn = source.columnId
      ? sourceSection?.columns.find((item) => item._id === source.columnId)
      : sameSection
      ? column
      : sourceSection?.formulaType === 'row'
      ? column
      : undefined;
    if (!sourceReport || !sourceSection || !sourceRow || !sourceColumn)
      throw new Error(
        'Formula references a missing report, section, row or column; select a source column for cell-based sections',
      );
    if (sourceRow.kind === 'title' || sourceRow.kind === 'date')
      throw new Error('Formula source must be a numeric row');
    return {
      report: sourceReport,
      section: sourceSection,
      row: sourceRow,
      column: sourceColumn,
    };
  };
  const buildNode = (
    report: IReportDefinition,
    section: IReportSection,
    row: Row,
    column: Column,
  ): string => {
    const node = JSON.stringify([
      report._id,
      section._id,
      row._id,
      column._id,
      column.getDate,
      column.isPre,
    ]);
    if (graph.has(node)) return node;
    const edges: string[] = [];
    graph.set(node, edges);
    const formulas = section.formulas.filter(
      (formula) =>
        formula.rowId === row._id &&
        (section.formulaType === 'row' || formula.columnId === column._id),
    );
    for (const formula of formulas) {
      if (row.kind === 'title' || row.kind === 'date')
        throw new Error('Title and date rows cannot have formulas');
      const period = resolveReportPeriod(formula, row, column);
      if (!period.getDate)
        throw new Error(
          'Every formula cell needs a period: set it on the formula, row or column',
        );
      if (formula.kind === 'balance' && period.getDate === 'between')
        throw new Error('Balance formulas need an opening or closing date');
      if (
        (formula.kind === 'from_row' || formula.kind === 'ratio') &&
        !formula.source
      )
        throw new Error('A source row is required');
      if (formula.kind === 'ratio' && !formula.ratioSource)
        throw new Error('A ratio source row is required');
      const references =
        formula.kind === 'ratio'
          ? [formula.source, formula.ratioSource]
          : formula.kind === 'from_row'
          ? [formula.source]
          : [];
      for (const source of references) {
        if (!source) continue;
        const resolved = findSource(report, section, column, source);
        edges.push(
          buildNode(
            resolved.report,
            resolved.section,
            resolved.row,
            resolved.column,
          ),
        );
      }
    }
    return node;
  };
  for (const report of reports)
    for (const section of report.sections)
      for (const row of section.rows)
        for (const column of section.columns)
          buildNode(report, section, row, column);
  const done = new Set<string>();
  const visiting = new Set<string>();
  const visit = (node: string): void => {
    if (visiting.has(node))
      throw new Error('Circular report formula reference');
    if (done.has(node)) return;
    visiting.add(node);
    for (const dependency of graph.get(node) || []) visit(dependency);
    visiting.delete(node);
    done.add(node);
  };
  for (const node of graph.keys()) visit(node);
};

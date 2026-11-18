import { validateReportPercent } from './tunableReports/percent';
import { reportPeriodIssue } from './tunableReports/period';
import {
  IReportDefinition,
  IReportFormula,
  IReportReference,
  IReportSection,
} from '../@types/report';

import {
  getReportCellFormulas,
  reportCellKey,
  reportCellLabel,
  resolveReportPeriod,
  resolveReportSource,
} from './tunableReports/cells';
export { resolveReportPeriod } from './tunableReports/cells';

const requireUniqueIds = (items: { _id: string }[], label: string): void => {
  if (new Set(items.map((item) => item._id)).size !== items.length)
    throw new Error(`${label}: duplicate ids`);
};
type Column = IReportSection['columns'][number];
const FORMULA_REFERENCES: Record<
  IReportFormula['kind'],
  (formula: IReportFormula) => (IReportReference | undefined)[]
> = {
  balance: () => [],
  transaction: () => [],
  from_row: (formula) => [formula.source],
  ratio: (formula) => [formula.source, formula.ratioSource],
};
type Row = IReportSection['rows'][number];

export const validateReportDefinitions = (
  reports: IReportDefinition[],
): void => {
  const reportMap = new Map(reports.map((report) => [report._id, report]));
  const graph = new Map<string, string[]>();
  // Period problems are collected for every cell so one save reports them all.
  const periodIssues = new Map<string, Set<string>>();
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
  const buildNode = (
    report: IReportDefinition,
    section: IReportSection,
    row: Row,
    column: Column,
  ): string => {
    const node = reportCellKey({ report, section, row, column });
    if (graph.has(node)) return node;
    const edges: string[] = [];
    graph.set(node, edges);
    const formulas = getReportCellFormulas(section, row._id, column._id);
    for (const formula of formulas) {
      validateReportPercent(formula.percent);
      if (row.kind === 'title' || row.kind === 'date')
        throw new Error('Title and date rows cannot have formulas');
      const periodIssue = reportPeriodIssue(
        resolveReportPeriod(formula, row, column).getDate,
      );
      if (periodIssue) {
        const cells = periodIssues.get(periodIssue) ?? new Set<string>();
        cells.add(reportCellLabel({ report, section, row, column }));
        periodIssues.set(periodIssue, cells);
      }
      if (
        (formula.kind === 'from_row' || formula.kind === 'ratio') &&
        !formula.source
      )
        throw new Error('A source row is required');
      if (formula.kind === 'ratio' && !formula.ratioSource)
        throw new Error('A ratio source row is required');
      const references = FORMULA_REFERENCES[formula.kind](formula);
      for (const source of references) {
        if (!source) continue;
        const resolved = resolveReportSource(
          { report, section, column },
          source,
          reportMap.get(source.reportId || report._id),
        );
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
  if (periodIssues.size)
    throw new Error(
      [...periodIssues]
        .map(([issue, cells]) => `${issue}: ${[...cells].join('; ')}`)
        .join('\n'),
    );
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

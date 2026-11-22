import { reportInputSchema, IReportDefinition } from '../../@types/report';
import {
  resolveReportPeriod,
  validateReportDefinitions,
} from '../reportValidation';

const definition = (_id = 'a'): IReportDefinition => ({
  ...reportInputSchema.parse({
    code: _id,
    name: _id,
    sections: [
      {
        _id: 's',
        name: 'Section',
        columns: [{ _id: 'c', name: 'Closing', getDate: 'last', isPre: true }],
        rows: [
          { _id: 'r', name: 'Cash' },
          { _id: 'total', name: 'Total' },
        ],
        formulas: [{ _id: 'f', rowId: 'r', kind: 'balance' }],
      },
    ],
  }),
  _id,
  version: 1,
});
test('period inheritance respects explicit false and formula overrides', () => {
  const report = definition();
  const section = report.sections[0];
  expect(
    resolveReportPeriod(
      section.formulas[0],
      section.rows[0],
      section.columns[0],
    ),
  ).toEqual({ getDate: 'last', isPre: true });
  section.rows[0].isPre = false;
  section.rows[0].getDate = 'first';
  expect(
    resolveReportPeriod(
      section.formulas[0],
      section.rows[0],
      section.columns[0],
    ),
  ).toEqual({ getDate: 'last', isPre: true });
  section.formulas[0].getDate = 'last';
  section.formulas[0].isPre = true;
  expect(
    resolveReportPeriod(
      section.formulas[0],
      section.rows[0],
      section.columns[0],
    ),
  ).toEqual({ getDate: 'last', isPre: true });
});
test('rejects unresolved date selections and accepts a movement period for balances', () => {
  const report = definition();
  delete report.sections[0].columns[0].getDate;
  report.sections[0].formulas.push({
    ...report.sections[0].formulas[0],
    _id: 'f2',
    rowId: 'total',
    kind: 'transaction',
  });
  report.sections[0].rows[1].number = '2';
  // Every cell without a formula, column or row period is listed at once.
  expect(() => validateReportDefinitions([report])).toThrow(
    'Set a period on the formula, column or row: a › Section › Cash › Closing; a › Section › 2. Total › Closing',
  );
  report.sections[0].rows[1].getDate = 'last';
  expect(() => validateReportDefinitions([report])).toThrow(
    'Set a period on the formula, column or row: a › Section › Cash › Closing',
  );
  report.sections[0].formulas.pop();
  report.sections[0].columns[0].getDate = 'between';
  expect(() => validateReportDefinitions([report])).not.toThrow();
});
test('supports independent section columns and explicit source cells', () => {
  const report = definition();
  const second = definition('b');
  second.sections[0].formulaType = 'cell';
  second.sections[0].formulas[0].columnId = 'c';
  report.sections[0].formulaType = 'cell';
  report.sections[0].formulas[0].columnId = 'c';
  report.sections[0].formulas[0] = {
    ...report.sections[0].formulas[0],
    kind: 'from_row',
    source: { reportId: 'b', sectionId: 's', rowId: 'r', columnId: 'c' },
  };
  expect(() => validateReportDefinitions([report, second])).not.toThrow();
  delete report.sections[0].formulas[0].source?.columnId;
  expect(() => validateReportDefinitions([report, second])).toThrow(
    'select a source column',
  );
});
test('rejects broken references, duplicate ids and circular row dependencies', () => {
  const report = definition();
  report.sections[0].formulas[0].kind = 'from_row';
  report.sections[0].formulas[0].source = { rowId: 'missing' };
  expect(() => validateReportDefinitions([report])).toThrow('missing');
  report.sections[0].formulas[0].source = { rowId: 'r' };
  expect(() => validateReportDefinitions([report])).toThrow('Circular');
  report.sections[0].rows.push(report.sections[0].rows[0]);
  expect(() => validateReportDefinitions([report])).toThrow('duplicate ids');
});
test('finds cycles across reports even with inherited column contexts', () => {
  const reports = [definition('a'), definition('b')];
  reports[1].sections[0].columns[0]._id = 'different';
  for (const [index, report] of reports.entries()) {
    report.sections[0].formulas[0].kind = 'from_row';
    report.sections[0].formulas[0].source = {
      reportId: reports[1 - index]._id,
      sectionId: 's',
      rowId: 'r',
    };
  }
  expect(() => validateReportDefinitions(reports)).toThrow('Circular');
});

test('permits an empty section but requires columns before formulas are configured', () => {
  const report = definition();
  report.sections[0].columns = [];
  report.sections[0].formulas = [];
  expect(() => validateReportDefinitions([report])).not.toThrow();
  report.sections[0].formulas.push({
    _id: 'f',
    rowId: 'r',
    kind: 'balance',
    plusOrMinus: true,
    percent: '100',
    ratioRule: 'divide',
  });
  expect(() => validateReportDefinitions([report])).toThrow('Add a column');
});

test('formula comparison false overrides previous column and row settings', () => {
  const section = definition().sections[0];
  section.rows[0].isPre = true;
  section.formulas[0].isPre = false;
  expect(
    resolveReportPeriod(
      section.formulas[0],
      section.rows[0],
      section.columns[0],
    ),
  ).toEqual({ getDate: 'last', isPre: false });
});

test('references require matching row/cell scopes even with an explicit column', () => {
  const a = definition('a');
  const b = definition('b');
  b.sections[0].formulaType = 'cell';
  b.sections[0].formulas[0].columnId = 'c';
  a.sections[0].formulas[0] = {
    ...a.sections[0].formulas[0],
    kind: 'from_row',
    source: { reportId: 'b', sectionId: 's', rowId: 'r', columnId: 'c' },
  };
  expect(() => validateReportDefinitions([a, b])).toThrow('same formula scope');
});

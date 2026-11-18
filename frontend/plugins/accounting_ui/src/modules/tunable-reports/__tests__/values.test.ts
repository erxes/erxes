import {
  newColumn,
  newReport,
  orderedReport,
  sortReportValues,
} from '../values';
import { reportFormSchema, reportSectionInputSchema } from '../schema';

test('reordering preserves formula references and writes explicit order', () => {
  const report = newReport('Report');
  const section = report.sections[0];
  section.rows = [
    {
      _id: 'a',
      name: 'A',
      code: '',
      number: '',
      order: 3,
      isActive: true,
      kind: 'formula',
      valueSide: 'call_value',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      tabCount: 0,
    },
    {
      _id: 'b',
      name: 'B',
      code: '',
      number: '',
      order: 1,
      isActive: true,
      kind: 'formula',
      valueSide: 'call_value',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      tabCount: 0,
    },
  ];
  section.formulas = [
    {
      _id: 'f',
      rowId: 'a',
      kind: 'from_row',
      plusOrMinus: true,
      percent: '100',
      ratioRule: 'divide',
      source: { rowId: 'b' },
    },
  ];
  const ordered = orderedReport(sortReportValues(report));
  expect(ordered.sections[0].rows.map((row) => [row._id, row.order])).toEqual([
    ['b', 0],
    ['a', 1],
  ]);
  expect(ordered.sections[0].formulas[0].source?.rowId).toBe('b');
});
test('sections start empty and explicit new columns retain their period defaults', () => {
  const report = newReport('Report');
  expect(report.sections[0].columns).toEqual([]);
  expect(report.sections[0].name).toBe('');
  expect(reportFormSchema.safeParse(report).success).toBe(true);
  const column = reportSectionInputSchema.shape.columns.element.parse(
    newColumn('Closing'),
  );
  expect(column.isPre).toBeUndefined();
  expect(column.getDate).toBe('last');
});
test('validates effective dates and source operands before saving', () => {
  const report = newReport('Report');
  const row = { _id: 'r', name: 'R' };
  const source = {
    ...report,
    sections: [
      {
        ...report.sections[0],
        columns: [{ _id: 'c', name: 'C' }],
        rows: [row],
        formulas: [{ _id: 'f', rowId: 'r', kind: 'balance' }],
      },
    ],
  };
  expect(reportFormSchema.safeParse(source).success).toBe(false);
  // A balance over the between period is the net period change.
  source.sections[0].columns[0] = {
    ...source.sections[0].columns[0],
    getDate: 'between',
  };
  expect(reportFormSchema.safeParse(source).success).toBe(true);
});

test('a missing formula and column date falls back to the row date', () => {
  const report = newReport('Report');
  report.sections[0] = reportSectionInputSchema.parse({
    _id: 's',
    columns: [{ _id: 'c', name: 'Movement' }],
    rows: [{ _id: 'r' }],
    formulas: [{ _id: 'f', rowId: 'r', kind: 'balance' }],
  });
  expect(reportFormSchema.safeParse(report).success).toBe(false);
  report.sections[0].rows[0].getDate = 'last';
  expect(reportFormSchema.safeParse(report).success).toBe(true);
  report.sections[0].rows[0].getDate = undefined;
  report.sections[0].formulas[0].getDate = 'between';
  expect(reportFormSchema.safeParse(report).success).toBe(true);
});

test.each([
  '100',
  '-20.5',
  'if(value>100:[20])10',
  'if(value<=0:0,value>100:20)10',
])('accepts supported percentage syntax: %s', (percent) => {
  const section = reportSectionInputSchema.safeParse({
    _id: 's',
    columns: [],
    rows: [],
    formulas: [{ _id: 'f', rowId: 'r', kind: 'balance', percent }],
  });
  expect(section.success).toBe(true);
});
test.each(['NaN', 'value * 10', 'if(value>100:[20)10'])(
  'rejects invalid percentage text before saving: %s',
  (percent) => {
    expect(
      reportSectionInputSchema.safeParse({
        _id: 's',
        columns: [],
        rows: [],
        formulas: [{ _id: 'f', rowId: 'r', kind: 'balance', percent }],
      }).success,
    ).toBe(false);
  },
);

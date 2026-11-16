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
        columns: [{ _id: 'c', name: 'C', getDate: 'between' }],
        rows: [row],
        formulas: [{ _id: 'f', rowId: 'r', kind: 'balance' }],
      },
    ],
  };
  expect(reportFormSchema.safeParse(source).success).toBe(false);
  source.sections[0].columns[0].getDate = 'last';
  expect(reportFormSchema.safeParse(source).success).toBe(true);
});

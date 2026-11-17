import { Mongoose, Schema } from 'mongoose';
import { reportSchema } from '../report';

jest.mock('erxes-api-shared/utils', () => {
  let sequence = 0;
  return {
    mongooseStringRandomId: {
      type: String,
      default: () => `report-id-${++sequence}`,
    },
    schemaWrapper: (schema: Schema): Schema => schema,
  };
});

const mongoose = new Mongoose();
const Report = mongoose.model('ReportDefinitionTest', reportSchema);

const createReport = () =>
  new Report({
    code: 'СТ1',
    name: 'Санхүүгийн байдлын тайлан',
    sections: [
      {
        _id: 'section-a',
        columns: [{ _id: 'opening', name: 'Эхний үлдэгдэл', getDate: 'first' }],
        rows: [{ _id: 'cash', name: 'Мөнгө' }],
        formulas: [
          {
            rowId: 'cash',
            kind: 'balance',
            debitAccountCategoryId: 'cash-category',
          },
        ],
      },
      {
        _id: 'section-b',
        formulaType: 'cell',
        columns: [
          { _id: 'current', name: 'Тайлант үе' },
          { _id: 'previous', name: 'Өмнөх он', isPre: true },
        ],
        rows: [
          { _id: 'total', name: 'Нийт' },
          { _id: 'note', kind: 'title' },
        ],
        formulas: [
          {
            rowId: 'total',
            columnId: 'current',
            kind: 'from_row',
            source: {
              reportId: 'another-report',
              sectionId: 'source-section',
              rowId: 'source-row',
              columnId: 'source-column',
            },
            percent: 'if(>1000:10)5',
          },
        ],
      },
    ],
  });

afterAll(() => mongoose.deleteModel('ReportDefinitionTest'));

test('preserves independent section tables and cross-report formula references', () => {
  const report = createReport();
  expect(report.validateSync()).toBeUndefined();
  const data = report.toObject();
  expect(data.sections.map((section) => section.columns.length)).toEqual([
    1, 2,
  ]);
  expect(data.sections.map((section) => section.rows.length)).toEqual([1, 2]);
  expect(data.sections[1].formulas[0].source).toEqual({
    reportId: 'another-report',
    sectionId: 'source-section',
    rowId: 'source-row',
    columnId: 'source-column',
  });
  expect(data.sections[1].formulas[0].percent).toBe('if(>1000:10)5');
  expect(typeof data.sections[0].formulas[0]._id).toBe('string');
  expect(data.sections[0].formulas[0].percent).toBe('100');
});

test('retains embedded ids across metadata edits and serialization', () => {
  const report = createReport();
  const before = report.toObject();
  report.set('name', 'Updated title');
  const restored = new Report(report.toObject()).toObject();
  expect(restored.sections).toEqual(before.sections);
  expect(restored._id).toBe(before._id);
});

test.each(['from_row', 'ratio'])(
  'requires a source row for %s formulas',
  (kind) => {
    const report = createReport();
    report.set('sections.0.formulas.0.kind', kind);
    expect(
      report.validateSync()?.errors['sections.0.formulas.0.source'],
    ).toBeDefined();
  },
);

test('requires both operands for ratios and rejects incomplete references', () => {
  const report = createReport();
  report.set('sections.0.formulas.0', {
    rowId: 'cash',
    kind: 'ratio',
    source: { rowId: 'numerator' },
  });
  expect(
    Object.values(report.validateSync()?.errors ?? {}).map(
      (error) => error.path,
    ),
  ).toContain('ratioSource');
  report.set('sections.0.formulas.0.ratioSource', { rowId: 'denominator' });
  expect(report.validateSync()).toBeUndefined();
  report.set('sections.0.formulas.0.ratioSource', { sectionId: 'other' });
  expect(
    Object.values(report.validateSync()?.errors ?? {}).map(
      (error) => error.path,
    ),
  ).toContain('rowId');
});

test('rejects unsupported periods and formula kinds', () => {
  const report = createReport();
  report.set('sections.0.columns.0.getDate', 'unknown');
  report.set('sections.0.formulas.0.kind', 'script');
  const errors = report.validateSync()?.errors;
  expect(errors?.['sections.0.columns.0.getDate']).toBeDefined();
  expect(errors?.['sections.0.formulas.0.kind']).toBeDefined();
});

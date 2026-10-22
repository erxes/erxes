import { buildDataModelRecordQuery } from '../records/query';
import { normalizeDataModelRecordValue } from '../records/fields';
import { recordField } from './recordFixtures';

describe('custom record query planning', () => {
  it('bounds the combined size of otherwise valid filters', () => {
    expect(() =>
      buildDataModelRecordQuery([recordField()], {
        filters: [
          {
            fieldId: 'title',
            operator: 'IN',
            value: Array(100).fill('x'.repeat(10000)),
          },
        ],
      }),
    ).toThrow('128 KiB');
  });
  it('casts range operands to comparable types', () => {
    const query = buildDataModelRecordQuery(
      [
        recordField({ _id: 'amount', type: 'number' }),
        recordField({ _id: 'start', type: 'date' }),
      ],
      {
        filters: [
          { fieldId: 'amount', operator: 'GTE', value: '10' },
          { fieldId: 'start', operator: 'LT', value: '2026-10-22' },
        ],
        sort: { field: 'amount', direction: 'ASC' },
      },
    );
    expect(query.filter).toEqual({
      $and: [
        { 'propertiesData.amount': { $gte: 10 } },
        { 'propertiesData.start': { $lt: new Date('2026-10-22') } },
      ],
    });
    expect(query.sort).toEqual({ 'propertiesData.amount': 1, _id: 1 });
  });

  it('escapes text searches rather than executing user regexes', () => {
    const query = buildDataModelRecordQuery([recordField()], {
      filters: [{ fieldId: 'title', operator: 'CONTAINS', value: '(a+)+$' }],
    });
    expect(query.filter).toEqual({
      $and: [
        {
          'propertiesData.title': { $regex: '\\(a\\+\\)\\+\\$', $options: 'i' },
        },
      ],
    });
  });

  it('normalizes IN operands for multi-select membership', () => {
    const query = buildDataModelRecordQuery(
      [
        recordField({
          type: 'multiSelect',
          options: [{ label: 'A', value: 'a' }],
        }),
      ],
      {
        filters: [{ fieldId: 'title', operator: 'IN', value: ['a'] }],
      },
    );
    expect(query.filter).toEqual({
      $and: [{ 'propertiesData.title': { $in: ['a'] } }],
    });
  });

  it.each([
    {
      filters: [
        { fieldId: 'title', operator: 'EQ', value: { $where: 'true' } },
      ],
    },
    { filters: [{ fieldId: 'foreign', operator: 'EQ', value: 'x' }] },
    { filters: [{ fieldId: 'title.x', operator: 'EQ', value: 'x' }] },
    { filters: [{ fieldId: 'title', operator: '$where', value: 'x' }] },
    { filters: [{ fieldId: 'title', operator: 'GT', value: 'x' }] },
    { filters: [{ fieldId: 'title', operator: 'IN', value: [] }] },
    {
      filters: [
        { fieldId: 'title', operator: 'IN', value: Array(101).fill('x') },
      ],
    },
    {
      filters: Array(21).fill({ fieldId: 'title', operator: 'EQ', value: 'x' }),
    },
    { limit: 201 },
    { offset: -1 },
    { sort: { field: 'foreign', direction: 'ASC' } },
    { sort: { field: 'propertiesData.title', direction: 'ASC' } },
  ])('rejects unsafe/unbounded query %j', (input) => {
    expect(() => buildDataModelRecordQuery([recordField()], input)).toThrow();
  });

  it.each([
    { archivedAt: new Date() },
    { repeating: true },
    { groupAvailable: false },
  ])('rejects non-comparable field configuration %j', (overrides) => {
    expect(() =>
      buildDataModelRecordQuery([recordField(overrides)], {
        filters: [{ fieldId: 'title', operator: 'EQ', value: 'x' }],
      }),
    ).toThrow();
  });

  it.each([
    { type: 'number', value: 'not-a-number' },
    { type: 'number', value: Infinity },
    { type: 'date', value: 'not-a-date' },
    { type: 'boolean', value: {} },
    { type: 'text', value: 'x'.repeat(10001) },
    { type: 'list', value: 'not-a-list' },
  ])('rejects invalid primitive %j', ({ type, value }) => {
    expect(() =>
      normalizeDataModelRecordValue(recordField({ type }), value),
    ).toThrow();
  });
});

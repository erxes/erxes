import {
  buildDataExtensionAggregateStages,
  buildDataExtensionRecordFilter,
  isGroupableDataExtensionField,
} from './query';
import { buildCustomDataExtensionRecordType, getDataExtensionRecordType } from './recordTypes';
import { IDataExtensionField } from './types';

const field = (
  key: string,
  type: IDataExtensionField['type'],
  extra: Partial<IDataExtensionField> = {},
): IDataExtensionField => ({
  recordType: 'custom:contract',
  key,
  label: key,
  type,
  order: 0,
  status: 'active',
  ...extra,
});

const contract = buildCustomDataExtensionRecordType({
  key: 'contract',
  singularLabel: 'Contract',
  pluralLabel: 'Contracts',
});

const fields = [
  field('title', 'text'),
  field('value', 'currency', { settings: { currency: 'MNT' } }),
  field('stage', 'select', {
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'signed', label: 'Signed' },
    ],
  }),
  field('endsAt', 'date'),
  field('stars', 'rating', { settings: { scale: 5 } }),
  field('office', 'address'),
  field('company', 'relation', {
    relation: { targetRecordType: 'core:company', kind: 'manyToOne', side: 'source' },
  }),
  field('deals', 'relation', {
    relation: { targetRecordType: 'core:company', kind: 'manyToOne', side: 'inverse' },
  }),
  field('team', 'member', { settings: { multiple: true } }),
];

const build = (conditions: unknown[], match?: 'all' | 'any') =>
  buildDataExtensionRecordFilter(contract, fields, {
    match,
    conditions: conditions as never,
  });

describe('buildDataExtensionRecordFilter', () => {
  it('builds typed conditions on namespace paths', () => {
    expect(
      build([
        { field: 'value', operator: 'gte', value: 1000 },
        { field: 'stage', operator: 'in', value: ['draft', 'signed'] },
        { field: 'endsAt', operator: 'lt', value: '2027-01-01T00:00:00.000Z' },
        { field: 'company', operator: 'eq', value: 'company-1' },
      ]),
    ).toEqual({
      $and: [
        { 'dataExtensions.value.amount': { $gte: 1000 } },
        { 'dataExtensions.stage': { $in: ['draft', 'signed'] } },
        { 'dataExtensions.endsAt': { $lt: new Date('2027-01-01T00:00:00.000Z') } },
        { 'dataExtensions.company': 'company-1' },
      ],
    });
  });

  it('matches any condition and native fields of custom objects', () => {
    expect(
      build(
        [
          { field: 'name', operator: 'contains', value: 'acme' },
          { field: 'createdAt', operator: 'gte', value: '2027-01-01T00:00:00.000Z' },
        ],
        'any',
      ),
    ).toEqual({
      $or: [
        { $or: [{ name: /acme/i }] },
        { createdAt: { $gte: new Date('2027-01-01T00:00:00.000Z') } },
      ],
    });
  });

  it('escapes search text so it is matched literally', () => {
    const filter = build([{ field: 'title', operator: 'contains', value: '.*(a+)+$' }]);
    const pattern = ((filter.$and as never[])[0] as { $or: Record<string, RegExp>[] }).$or[0]['dataExtensions.title'];

    expect(pattern.test('x.*(a+)+$y')).toBe(true);
    expect(pattern.test('aaaa')).toBe(false);
  });

  it('looks for text in every part of a composite value', () => {
    expect(build([{ field: 'office', operator: 'notContains', value: 'Darkhan' }])).toEqual({
      $and: [
        {
          $nor: [
            {
              $or: ['street', 'street2', 'city', 'state', 'postalCode', 'country'].map((part) => ({
                [`dataExtensions.office.${part}`]: /Darkhan/i,
              })),
            },
          ],
        },
      ],
    });
  });

  it.each([
    [{ field: 'title', operator: 'gt', value: 'x' }, 'cannot be filtered with "gt"'],
    [{ field: 'stage', operator: 'eq', value: 'lost' }, 'one of its options'],
    [{ field: 'stars', operator: 'eq', value: 9 }, '1 to 5'],
    [{ field: 'value', operator: 'eq', value: { $gt: 0 } }, 'compares against an amount'],
    [{ field: 'title', operator: 'eq', value: { $ne: null } }, 'must be a string'],
    [{ field: 'company', operator: 'eq', value: { $exists: true } }, 'record id'],
    [{ field: 'deals', operator: 'eq', value: 'x' }, 'other record type'],
    [{ field: 'secret', operator: 'eq', value: 'x' }, 'Unknown field'],
    [{ field: 'title', operator: '$where', value: '1' }, 'Unknown operator'],
    [{ field: 'stage', operator: 'in', value: [] }, 'list of values'],
  ])('refuses %j', (condition, message) => {
    expect(() => build([condition])).toThrow(message);
  });

  it('treats native names as unknown on module record types', () => {
    expect(() =>
      buildDataExtensionRecordFilter(getDataExtensionRecordType('core:company')!, fields, {
        conditions: [{ field: 'name', operator: 'eq', value: 'x' }],
      }),
    ).toThrow('Unknown field');
  });

  it('builds empty checks and caps the number of conditions', () => {
    expect(build([{ field: 'title', operator: 'isEmpty' }])).toEqual({
      $and: [
        {
          $or: [
            { 'dataExtensions.title': { $exists: false } },
            { 'dataExtensions.title': null },
            { 'dataExtensions.title': '' },
            { 'dataExtensions.title': { $size: 0 } },
          ],
        },
      ],
    });
    expect(() =>
      build(Array.from({ length: 21 }, () => ({ field: 'title', operator: 'isEmpty' }))),
    ).toThrow('at most 20');
  });
});

describe('aggregates', () => {
  it('groups by a single-value field and totals numeric ones', () => {
    expect(
      buildDataExtensionAggregateStages(fields, 'stage', [
        { op: 'count' },
        { op: 'sum', field: 'value' },
        { op: 'avg', field: 'stars' },
      ]),
    ).toEqual([
      {
        $group: {
          _id: { $ifNull: ['$dataExtensions.stage', null] },
          count: { $sum: 1 },
          m1: { $sum: '$dataExtensions.value.amount' },
          m2: { $avg: '$dataExtensions.stars' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 200 },
    ]);
  });

  it('refuses grouping by many-valued fields and totals of text', () => {
    expect(isGroupableDataExtensionField(fields[6])).toBe(true);
    expect(isGroupableDataExtensionField(fields[8])).toBe(false);
    expect(() => buildDataExtensionAggregateStages(fields, 'team', [])).toThrow('cannot be used to group');
    expect(() =>
      buildDataExtensionAggregateStages(fields, undefined, [{ op: 'sum', field: 'title' }]),
    ).toThrow('needs a number');
    expect(() =>
      buildDataExtensionAggregateStages(fields, undefined, [{ op: '$function' as never, field: 'value' }]),
    ).toThrow('Unknown total');
  });
});

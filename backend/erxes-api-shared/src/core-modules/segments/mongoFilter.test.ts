import {
  SegmentFieldMeta,
  SegmentFieldNamespace,
  SegmentOperator,
} from './fieldMeta';
import { compileSegmentMongoFilter } from './mongoFilter';
import { SegmentNode } from './nodes';

const NOW = new Date('2026-08-23T10:30:00.000Z');

const fields: SegmentFieldMeta[] = [
  {
    key: 'status',
    label: 'Status',
    operators: [SegmentOperator.Equals],
    kind: 'projected',
    path: 'status',
    input: 'text',
  },
  {
    key: 'name',
    label: 'Name',
    operators: [SegmentOperator.Contains],
    kind: 'projected',
    path: 'name',
    input: 'text',
  },
  {
    key: 'amount',
    label: 'Amount',
    operators: [SegmentOperator.NumberGt],
    kind: 'projected',
    path: 'totalAmount',
    input: 'number',
  },
  {
    key: 'closeDate',
    label: 'Close date',
    operators: [SegmentOperator.DateGte],
    kind: 'projected',
    path: 'closeDate',
    input: 'date',
  },
  {
    key: 'tagIds',
    label: 'Tags',
    operators: [SegmentOperator.Equals],
    kind: 'projected',
    path: 'tagIds',
    input: 'text',
  },
  {
    key: 'pipelineId',
    label: 'Pipeline',
    operators: [SegmentOperator.Equals],
    kind: 'derived',
    dependsOn: [{ fields: ['stageId'] }],
    input: 'text',
  },
];

const namespaces: SegmentFieldNamespace[] = [
  {
    prefix: 'customFieldsData',
    label: 'Custom properties',
    path: 'customFieldsData',
    keyPath: 'field',
    valuePath: 'value',
  },
];

const field = (
  fieldKey: string,
  operator: SegmentOperator,
  value?: string | number | Date | string[],
): SegmentNode => ({
  kind: 'field',
  contentType: 'sales:deal',
  fieldKey,
  operator,
  value,
});

const compile = (node: SegmentNode) =>
  compileSegmentMongoFilter(node, { fields, namespaces, now: NOW });

describe('compileSegmentMongoFilter · operators', () => {
  it('compiles onto the declared path, not the field key', () => {
    expect(
      compile(field('amount', SegmentOperator.NumberGt, 100)).filter,
    ).toEqual({ totalAmount: { $gte: 100 } });
  });

  it('escapes a contains value so it cannot inject a pattern', () => {
    expect(
      compile(field('name', SegmentOperator.Contains, 'a.b*c')).filter,
    ).toEqual({ name: { $regex: 'a\\.b\\*c', $options: 'i' } });
  });

  it('treats null and an empty array as unset, matching the evaluator', () => {
    expect(compile(field('tagIds', SegmentOperator.IsSet)).filter).toEqual({
      tagIds: { $nin: [null, []], $exists: true },
    });
    expect(compile(field('tagIds', SegmentOperator.IsNotSet)).filter).toEqual({
      tagIds: { $in: [null, []] },
    });
  });

  it('matches an id list, and matches nothing when the list is empty', () => {
    expect(
      compile(field('status', SegmentOperator.In, ['won', 'lost'])).filter,
    ).toEqual({ status: { $in: ['won', 'lost'] } });

    // A resolved condition with no hits has to exclude every record; dropping
    // it would leave the query wider than the segment asked for.
    expect(compile(field('status', SegmentOperator.In, [])).filter).toEqual({
      status: { $in: [] },
    });
  });

  it('turns a relative-day operator into one closed day', () => {
    const { filter } = compile(field('closeDate', SegmentOperator.DaysAgo, 3));
    const range = filter.closeDate as Record<string, Date>;

    expect(range.$gte).toEqual(new Date('2026-08-20T00:00:00.000Z'));
    expect(range.$lte).toEqual(new Date('2026-08-20T23:59:59.999Z'));
  });

  it('normalizes a deprecated operator before compiling', () => {
    expect(
      compile(field('closeDate', SegmentOperator.DateRelativeGt, '2026-01-01'))
        .filter,
    ).toEqual({ closeDate: { $gte: new Date('2026-01-01T00:00:00.000Z') } });
  });
});

describe('compileSegmentMongoFilter · namespaces', () => {
  it('matches the key and the value inside one entry', () => {
    const { filter } = compile(
      field('customFieldsData.plan', SegmentOperator.Equals, 'enterprise'),
    );

    expect(filter).toEqual({
      customFieldsData: {
        $elemMatch: { field: 'plan', value: { $eq: 'enterprise' } },
      },
    });
  });
});

describe('compileSegmentMongoFilter · trees', () => {
  const group = (
    conjunction: 'and' | 'or',
    children: SegmentNode[],
  ): SegmentNode => ({ kind: 'group', conjunction, children });

  it('collapses a single-child group instead of nesting $and', () => {
    expect(
      compile(group('and', [field('status', SegmentOperator.Equals, 'won')]))
        .filter,
    ).toEqual({ status: { $eq: 'won' } });
  });

  it('compiles and / or', () => {
    const won = field('status', SegmentOperator.Equals, 'won');
    const big = field('amount', SegmentOperator.NumberGt, 100);

    expect(compile(group('and', [won, big])).filter).toEqual({
      $and: [{ status: { $eq: 'won' } }, { totalAmount: { $gte: 100 } }],
    });
    expect(compile(group('or', [won, big])).filter).toEqual({
      $or: [{ status: { $eq: 'won' } }, { totalAmount: { $gte: 100 } }],
    });
  });

  it('keeps two conditions on one path apart under $and', () => {
    const { filter } = compile(
      group('and', [
        field('amount', SegmentOperator.NumberGt, 10),
        field('amount', SegmentOperator.NumberLt, 100),
      ]),
    );

    expect(filter).toEqual({
      $and: [{ totalAmount: { $gte: 10 } }, { totalAmount: { $lte: 100 } }],
    });
  });
});

describe('compileSegmentMongoFilter · what it cannot express', () => {
  it('reports a derived field rather than dropping it', () => {
    const result = compile(field('pipelineId', SegmentOperator.Equals, 'p-1'));

    expect(result.unsupported).toEqual(['sales:deal.pipelineId']);
    expect(result.filter).toEqual({});
  });

  it('reports an undeclared field', () => {
    expect(
      compile(field('removed', SegmentOperator.Equals, 'x')).unsupported,
    ).toEqual(['sales:deal.removed']);
  });

  it('reports a relation', () => {
    const result = compile({
      kind: 'relation',
      relationKey: 'customer.deals',
      measure: { op: 'exists' },
      child: field('status', SegmentOperator.Equals, 'won'),
    });

    expect(result.unsupported).toEqual(['customer.deals']);
  });

  it('still compiles the siblings it can express', () => {
    const result = compile({
      kind: 'group',
      conjunction: 'and',
      children: [
        field('status', SegmentOperator.Equals, 'won'),
        field('pipelineId', SegmentOperator.Equals, 'p-1'),
      ],
    });

    expect(result.filter).toEqual({ status: { $eq: 'won' } });
    expect(result.unsupported).toEqual(['sales:deal.pipelineId']);
  });
});

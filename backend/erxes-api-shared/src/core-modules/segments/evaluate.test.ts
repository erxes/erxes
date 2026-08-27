import { decideSegmentNode, SegmentDecideContext } from './evaluate';
import { SegmentOperator } from './fieldMeta';
import { SegmentNode, SegmentRelationNode, segmentRelationRef } from './nodes';

const NOW = new Date('2026-08-23T10:30:00.000Z');

const field = (
  fieldKey: string,
  operator: SegmentOperator,
  value?: string | number | boolean | Date | string[],
): SegmentNode => ({
  kind: 'field',
  contentType: 'sales:deal',
  fieldKey,
  operator,
  value,
});

const decide = (
  node: SegmentNode,
  values: Record<string, unknown>,
  extra: Partial<SegmentDecideContext> = {},
) =>
  decideSegmentNode(node, {
    values: new Map(
      Object.entries(values).map(([key, value]) => [
        `sales:deal.${key}`,
        value,
      ]),
    ),
    now: NOW,
    ...extra,
  });

describe('decideSegmentNode · operators', () => {
  it('matches equality on a scalar and on an array member', () => {
    const node = field('stageId', SegmentOperator.Equals, 'stage-1');

    expect(decide(node, { stageId: 'stage-1' })).toBe('matched');
    expect(decide(node, { stageId: 'stage-2' })).toBe('notMatched');
    expect(
      decide(field('tagIds', SegmentOperator.Equals, 't-2'), {
        tagIds: ['t-1', 't-2'],
      }),
    ).toBe('matched');
  });

  it('matches membership in a list the way $in does', () => {
    const node = field('stageId', SegmentOperator.In, ['s-1', 's-2']);

    expect(decide(node, { stageId: 's-2' })).toBe('matched');
    expect(decide(node, { stageId: 's-3' })).toBe('notMatched');
    // An empty list matches nothing, agreeing with `{ $in: [] }`.
    expect(
      decide(field('stageId', SegmentOperator.In, []), { stageId: 's-1' }),
    ).toBe('notMatched');
    expect(
      decide(field('tagIds', SegmentOperator.NotIn, ['t-1']), {
        tagIds: ['t-2'],
      }),
    ).toBe('matched');
  });

  it('lets an absent field satisfy the negative operators', () => {
    expect(decide(field('status', SegmentOperator.NotEquals, 'won'), {})).toBe(
      'matched',
    );
    expect(decide(field('name', SegmentOperator.NotContains, 'bat'), {})).toBe(
      'matched',
    );
  });

  it('compares contains without case', () => {
    const node = field('name', SegmentOperator.Contains, 'BAT');

    expect(decide(node, { name: 'Batbayar' })).toBe('matched');
    expect(decide(node, { name: 'Dorj' })).toBe('notMatched');
    expect(decide(node, {})).toBe('notMatched');
  });

  it('treats an empty array as unset but an empty string as set', () => {
    expect(decide(field('tagIds', SegmentOperator.IsSet), { tagIds: [] })).toBe(
      'notMatched',
    );
    expect(decide(field('name', SegmentOperator.IsSet), { name: '' })).toBe(
      'matched',
    );
    expect(decide(field('name', SegmentOperator.IsNotSet), {})).toBe('matched');
  });

  it('reads the number comparisons as inclusive, matching the old queries', () => {
    const gte = field('amount', SegmentOperator.NumberGt, 100);

    expect(decide(gte, { amount: 100 })).toBe('matched');
    expect(decide(gte, { amount: 99 })).toBe('notMatched');
    expect(
      decide(field('amount', SegmentOperator.NumberLt, 100), { amount: 100 }),
    ).toBe('matched');
  });

  it('compares dates against a stored string', () => {
    const node = field(
      'closeDate',
      SegmentOperator.DateGte,
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(decide(node, { closeDate: '2026-06-05T00:00:00.000Z' })).toBe(
      'matched',
    );
    expect(decide(node, { closeDate: '2025-06-05T00:00:00.000Z' })).toBe(
      'notMatched',
    );
  });

  it('matches a whole day bucket rather than a range', () => {
    const threeDaysAgo = field('createdAt', SegmentOperator.DaysAgo, 3);

    expect(
      decide(threeDaysAgo, { createdAt: '2026-08-20T23:59:00.000Z' }),
    ).toBe('matched');
    expect(
      decide(threeDaysAgo, { createdAt: '2026-08-20T00:00:00.000Z' }),
    ).toBe('matched');
    // inside the range but a different day, so the bucket does not match
    expect(
      decide(threeDaysAgo, { createdAt: '2026-08-21T10:00:00.000Z' }),
    ).toBe('notMatched');
  });

  it('points the from-now operators at the future', () => {
    expect(
      decide(field('closeDate', SegmentOperator.DaysFromNow, 2), {
        closeDate: '2026-08-25T08:00:00.000Z',
      }),
    ).toBe('matched');
  });

  it('honours deprecated operators still stored on production segments', () => {
    // `dateis` was a second spelling of `is`, `drgt` of `dateigt`
    expect(
      decide(field('closeDate', SegmentOperator.DateIsSet), { closeDate: 'x' }),
    ).toBe('matched');
    expect(
      decide(field('amount', SegmentOperator.DateRelativeGt, 50), {
        amount: 60,
      }),
    ).toBe('matched');
  });
});

describe('decideSegmentNode · trees', () => {
  const group = (
    conjunction: 'and' | 'or',
    children: SegmentNode[],
  ): SegmentNode => ({ kind: 'group', conjunction, children });

  it('resolves and / or over settled children', () => {
    const won = field('status', SegmentOperator.Equals, 'won');
    const big = field('amount', SegmentOperator.NumberGt, 1000);

    expect(
      decide(group('and', [won, big]), { status: 'won', amount: 2000 }),
    ).toBe('matched');
    expect(
      decide(group('and', [won, big]), { status: 'won', amount: 10 }),
    ).toBe('notMatched');
    expect(
      decide(group('or', [won, big]), { status: 'lost', amount: 2000 }),
    ).toBe('matched');
    expect(
      decide(group('or', [won, big]), { status: 'lost', amount: 10 }),
    ).toBe('notMatched');
  });

  it('nests groups', () => {
    const tree = group('and', [
      field('status', SegmentOperator.Equals, 'won'),
      group('or', [
        field('stageId', SegmentOperator.Equals, 'a'),
        field('stageId', SegmentOperator.Equals, 'b'),
      ]),
    ]);

    expect(decide(tree, { status: 'won', stageId: 'b' })).toBe('matched');
    expect(decide(tree, { status: 'won', stageId: 'c' })).toBe('notMatched');
  });

  it('never lets an empty group sweep in every record', () => {
    expect(decide(group('and', []), { status: 'won' })).toBe('unknown');
  });
});

describe('decideSegmentNode · unavailable values', () => {
  const unavailable = new Set(['sales:deal.amount']);

  it('separates an unanswered plugin from a genuinely unset field', () => {
    const node = field('amount', SegmentOperator.NumberGt, 100);

    expect(decide(node, {}, { unavailable })).toBe('unknown');
    expect(decide(node, {})).toBe('notMatched');
  });

  it('still settles when the rest of an and already fails', () => {
    const tree: SegmentNode = {
      kind: 'group',
      conjunction: 'and',
      children: [
        field('status', SegmentOperator.Equals, 'won'),
        field('amount', SegmentOperator.NumberGt, 100),
      ],
    };

    expect(decide(tree, { status: 'lost' }, { unavailable })).toBe(
      'notMatched',
    );
    expect(decide(tree, { status: 'won' }, { unavailable })).toBe('unknown');
  });

  it('settles an or as soon as one child matches', () => {
    const tree: SegmentNode = {
      kind: 'group',
      conjunction: 'or',
      children: [
        field('status', SegmentOperator.Equals, 'won'),
        field('amount', SegmentOperator.NumberGt, 100),
      ],
    };

    expect(decide(tree, { status: 'won' }, { unavailable })).toBe('matched');
    expect(decide(tree, { status: 'lost' }, { unavailable })).toBe('unknown');
  });
});

describe('decideSegmentNode · relation', () => {
  const relation = (
    measure: SegmentRelationNode['measure'],
    extra: Partial<SegmentRelationNode> = {},
  ): SegmentRelationNode => ({
    kind: 'relation',
    relationKey: 'customer.deals',
    measure,
    child: field('status', SegmentOperator.Equals, 'won'),
    ...extra,
  });

  const decideRelation = (
    node: SegmentRelationNode,
    resolved?: unknown,
    extra: Partial<SegmentDecideContext> = {},
  ) =>
    decideSegmentNode(node, {
      values:
        resolved === undefined
          ? new Map()
          : new Map([[segmentRelationRef(node), resolved]]),
      now: NOW,
      ...extra,
    });

  it('answers exists and none from the same boolean', () => {
    expect(decideRelation(relation({ op: 'exists' }), true)).toBe('matched');
    expect(decideRelation(relation({ op: 'none' }), true)).toBe('notMatched');
    expect(decideRelation(relation({ op: 'none' }), false)).toBe('matched');
  });

  it('compares a count through the ordinary operator table', () => {
    const node = relation(
      { op: 'count' },
      { operator: SegmentOperator.NumberGt, value: 3 },
    );

    expect(decideRelation(node, 3)).toBe('matched');
    expect(decideRelation(node, 2)).toBe('notMatched');
  });

  it('compares a sum the same way', () => {
    const node = relation(
      { op: 'sum', fieldKey: 'amount' },
      { operator: SegmentOperator.NumberGt, value: 1000000 },
    );

    expect(decideRelation(node, 1500000)).toBe('matched');
    expect(decideRelation(node, 900000)).toBe('notMatched');
  });

  it('keeps two measures on one relation apart', () => {
    const count = relation({ op: 'count' });
    const sum = relation({ op: 'sum', fieldKey: 'amount' });

    expect(segmentRelationRef(count)).not.toBe(segmentRelationRef(sum));
  });

  it('stays undecided until the traversal has been measured', () => {
    const node = relation({ op: 'exists' });

    expect(decideRelation(node)).toBe('unknown');
    expect(
      decideRelation(node, true, {
        unavailable: new Set([segmentRelationRef(node)]),
      }),
    ).toBe('unknown');
  });

  it('stays undecided when a numeric measure has no operator', () => {
    expect(decideRelation(relation({ op: 'count' }), 5)).toBe('unknown');
  });
});

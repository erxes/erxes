import { SegmentRelationMeta } from './relationRegistry';
import { SegmentField } from './fieldBuilders';

import { measureSegmentRelations } from './measureRelations';
import { SegmentOwnedSource } from './ownedSource';
import { SegmentRelationRequest } from './plan';

const USER = 'core:organization.users';
const DEAL = 'sales:sales.deals';

type Deal = {
  _id: string;
  amount?: number;
  status?: string;
  assignedUserIds?: string[];
};

const DEALS: Deal[] = [
  { _id: 'd1', amount: 100, status: 'open', assignedUserIds: ['u1'] },
  { _id: 'd2', amount: 250, status: 'open', assignedUserIds: ['u1', 'u2'] },
  { _id: 'd3', amount: 40, status: 'lost', assignedUserIds: ['u2'] },
];

const matches = (deal: Deal, query: Record<string, unknown>): boolean =>
  Object.entries(query).every(([path, condition]) => {
    const value = (deal as Record<string, unknown>)[path];
    const held = Array.isArray(value) ? value : [value];

    if (condition && typeof condition === 'object') {
      const { $in: any, $eq: exact } = condition as {
        $in?: unknown[];
        $eq?: unknown;
      };

      if (any) {
        return held.some((item) => any.includes(item));
      }

      return exact === undefined || held.includes(exact);
    }

    return held.includes(condition);
  });

const dealSource = (): SegmentOwnedSource => ({
  find: async (query) => DEALS.filter((deal) => matches(deal, query)),

  aggregate: async (pipeline) => {
    const [{ $match: match }, , , { $group: group }] = pipeline as [
      { $match: Record<string, unknown> },
      unknown,
      { $match: Record<string, unknown> },
      { $group: { _id: string; measured: Record<string, unknown> } },
    ];

    const path = group._id.replace('$', '');
    const rows = new Map<string, Deal[]>();

    for (const deal of DEALS.filter((candidate) => matches(candidate, match))) {
      for (const id of (deal as Record<string, unknown>)[path] as string[]) {
        rows.set(id, [...(rows.get(id) || []), deal]);
      }
    }

    const accumulator = Object.keys(group.measured)[0];
    const source = String(Object.values(group.measured)[0]).replace('$', '');

    return [...rows].map(([id, deals]) => ({
      _id: id,
      measured:
        accumulator === '$sum' && source === '1'
          ? deals.length
          : deals.reduce(
              (n, deal) =>
                n + Number((deal as Record<string, unknown>)[source] || 0),
              0,
            ),
    }));
  },
});

const context = (relations: SegmentRelationMeta[]) => ({
  sourceFor: (contentType: string) =>
    contentType === DEAL ? dealSource() : null,
  relations,
  fields: {
    [DEAL]: [
      SegmentField.text({ key: 'status', label: 'Status' }),
      SegmentField.number({ key: 'amount', label: 'Amount' }),
    ],
  },
});

const request = (
  measure: SegmentRelationRequest['measure'],
  extra: Partial<SegmentRelationRequest> = {},
): SegmentRelationRequest => ({
  kind: 'relation',
  ref: 'r1',
  relationKey: 'user.deals',
  measure,
  ...extra,
});

const byField: SegmentRelationMeta[] = [
  {
    key: 'user.deals',
    label: 'Deals',
    subjectType: USER,
    relatedType: DEAL,
    join: { via: 'field', on: 'related', path: 'assignedUserIds' },
  },
];

const byRelation: SegmentRelationMeta[] = [
  {
    key: 'user.deals',
    label: 'Deals',
    subjectType: USER,
    relatedType: DEAL,
    join: {
      via: 'relation',
      subjectRecordType: 'core:user',
      relatedRecordType: 'sales:deal',
    },
  },
];

const EDGES = { u1: ['d1', 'd2'], u2: ['d2', 'd3'] };

describe('measureSegmentRelations', () => {
  it('counts the same either way the records are joined', async () => {
    const joined = await measureSegmentRelations(
      context(byField),
      USER,
      ['u1', 'u2'],
      [request({ op: 'count' })],
    );

    const edged = await measureSegmentRelations(
      context(byRelation),
      USER,
      ['u1', 'u2'],
      [request({ op: 'count' }, { edges: EDGES })],
    );

    expect(joined.values).toEqual({ u1: { r1: 2 }, u2: { r1: 2 } });
    expect(edged.values).toEqual(joined.values);
  });

  it('narrows both joins by the same predicate', async () => {
    const child = {
      kind: 'field' as const,
      contentType: DEAL,
      fieldKey: 'status',
      operator: 'e' as never,
      value: 'open',
    };

    const joined = await measureSegmentRelations(
      context(byField),
      USER,
      ['u1', 'u2'],
      [request({ op: 'count' }, { child })],
    );

    const edged = await measureSegmentRelations(
      context(byRelation),
      USER,
      ['u1', 'u2'],
      [request({ op: 'count' }, { child, edges: EDGES })],
    );

    expect(joined.values).toEqual({ u1: { r1: 2 }, u2: { r1: 1 } });
    expect(edged.values).toEqual(joined.values);
  });

  it('reduces a numeric field over the batch', async () => {
    const { values } = await measureSegmentRelations(
      context(byField),
      USER,
      ['u1', 'u2'],
      [request({ op: 'sum', fieldKey: 'amount' })],
    );

    expect(values).toEqual({ u1: { r1: 350 }, u2: { r1: 290 } });
  });

  it('is undecidable when the edges were never resolved', async () => {
    const { values, unavailable } = await measureSegmentRelations(
      context(byRelation),
      USER,
      ['u1'],
      [request({ op: 'count' })],
    );

    expect(values).toEqual({});
    expect(unavailable).toEqual(['r1']);
  });

  it('refuses a measure over a field that is not a stored number', async () => {
    const { unavailable } = await measureSegmentRelations(
      context(byField),
      USER,
      ['u1'],
      [request({ op: 'sum', fieldKey: 'status' })],
    );

    expect(unavailable).toEqual(['r1']);
  });

  it('reports a relation this service does not own', async () => {
    const { unavailable } = await measureSegmentRelations(
      context([]),
      USER,
      ['u1'],
      [request({ op: 'count' })],
    );

    expect(unavailable).toEqual(['r1']);
  });
});

import { segmentRelationRef } from './nodeRefs';
import { SegmentOperator } from './operators';

import { SegmentNode, SegmentRelationNode } from './nodes';
import { buildSegmentEvaluationPlan, planValueRefs } from './plan';

const field = (
  contentType: string,
  fieldKey: string,
  value?: string,
): SegmentNode => ({
  kind: 'field',
  contentType,
  fieldKey,
  operator: SegmentOperator.Equals,
  value,
});

const group = (children: SegmentNode[]): SegmentNode => ({
  kind: 'group',
  conjunction: 'and',
  children,
});

const plan = (segments: SegmentNode[], relationOwners?: Map<string, string>) =>
  buildSegmentEvaluationPlan({
    subjectType: 'core:customer',
    subjectIds: ['c-1', 'c-2'],
    segments: segments.map((root, index) => ({ _id: `seg-${index}`, root })),
    relationOwners,
  });

describe('buildSegmentEvaluationPlan', () => {
  it('asks each plugin once for the union of what every segment needs', () => {
    const result = plan([
      group([
        field('core:customer', 'state', 'customer'),
        field('sales:deal', 'stageId', 'a'),
      ]),
      group([
        field('core:customer', 'state', 'lead'),
        field('sales:deal', 'status', 'won'),
      ]),
    ]);

    expect([...result.requestsByPlugin.keys()]).toEqual(['core', 'sales']);
    expect(result.requestsByPlugin.get('core')).toEqual([
      {
        kind: 'field',
        ref: 'core:customer.state',
        contentType: 'core:customer',
        fieldKey: 'state',
      },
    ]);
    expect(
      result.requestsByPlugin.get('sales')?.map((request) => request.ref),
    ).toEqual(['sales:deal.stageId', 'sales:deal.status']);
  });

  it('collapses the same field asked for by many segments into one request', () => {
    const stage = field('sales:deal', 'stageId', 'a');
    const result = plan(
      Array.from({ length: 53 }, (_, index) =>
        group([stage, field('sales:deal', 'status', `s-${index % 2}`)]),
      ),
    );

    expect(result.requestsByPlugin.get('sales')).toHaveLength(2);
  });

  it('walks nested groups', () => {
    const result = plan([
      group([
        field('core:customer', 'state'),
        group([field('core:company', 'primaryName')]),
      ]),
    ]);

    expect(result.requestsByPlugin.get('core')?.map((r) => r.ref)).toEqual([
      'core:company.primaryName',
      'core:customer.state',
    ]);
  });

  it('carries the subject batch through untouched', () => {
    const result = plan([group([field('core:customer', 'state')])]);

    expect(result.subjectType).toBe('core:customer');
    expect(result.subjectIds).toEqual(['c-1', 'c-2']);
  });
});

describe('buildSegmentEvaluationPlan · relations', () => {
  const relation = (relationKey: string, child: SegmentNode): SegmentNode => ({
    kind: 'relation',
    relationKey,
    measure: { op: 'exists' },
    child,
  });

  it('routes a relation to the plugin that owns it', () => {
    const node = relation(
      'customer.deals',
      field('sales:deal', 'status', 'won'),
    );

    const result = plan(
      [group([node])],
      new Map([['customer.deals', 'sales']]),
    );

    expect(result.requestsByPlugin.get('sales')).toContainEqual({
      kind: 'relation',
      ref: segmentRelationRef(node as SegmentRelationNode),
      relationKey: 'customer.deals',
      measure: { op: 'exists' },
      child: node.child,
    });
    expect(result.unresolvable).toEqual([]);
  });

  it('keeps two predicates on one relation apart', () => {
    const won = relation(
      'customer.deals',
      field('sales:deal', 'status', 'won'),
    );
    const big = relation(
      'customer.deals',
      field('sales:deal', 'amount', '1000'),
    );

    const result = plan(
      [group([won, big])],
      new Map([['customer.deals', 'sales']]),
    );

    expect(result.requestsByPlugin.get('sales')).toHaveLength(2);
    expect(segmentRelationRef(won as SegmentRelationNode)).not.toBe(
      segmentRelationRef(big as SegmentRelationNode),
    );
  });

  it('reports a relation nothing owns instead of dropping it', () => {
    const node = relation(
      'customer.tickets',
      field('tickets:ticket', 'status'),
    );
    const result = plan([group([node])]);

    expect(result.requestsByPlugin.size).toBe(0);
    expect(result.unresolvable).toEqual([
      segmentRelationRef(node as SegmentRelationNode),
    ]);
  });

  it('reports a field whose contentType has no plugin', () => {
    const result = plan([group([field('', 'state')])]);

    expect(result.unresolvable).toEqual(['.state']);
  });

  it('lists every ref the resolvers owe back', () => {
    const result = plan([
      group([field('core:customer', 'state'), field('sales:deal', 'status')]),
    ]);

    expect(planValueRefs(result)).toEqual([
      'core:customer.state',
      'sales:deal.status',
    ]);
  });
});

import { segmentRelationRef } from './nodeRefs';
import { SegmentOperator } from './operators';
import { SegmentRelationMeta } from './relationRegistry';
import {
  evaluateSegmentBatch,
  SegmentEvaluationGateway,
} from './evaluateBatch';

import { SegmentNode, SegmentRelationNode } from './nodes';
import { SegmentValueRequest } from './plan';

const dealsRelation: SegmentRelationMeta = {
  key: 'customer.deals',
  label: 'Deals',
  subjectType: 'core:contacts.customers',
  relatedType: 'sales:sales.deals',
  join: {
    via: 'relation',
    subjectRecordType: 'core:contacts.customers',
    relatedRecordType: 'sales:deal',
  },
};

const relationDirectory = {
  owners: new Map([['customer.deals', 'sales']]),
  relations: new Map([['customer.deals', dealsRelation]]),
};

const tagCondition: SegmentNode = {
  kind: 'field',
  contentType: 'core:contacts.customers',
  fieldKey: 'tagIds',
  operator: SegmentOperator.Equals,
  value: 'tag-1',
};

const dealCount: SegmentRelationNode = {
  kind: 'relation',
  relationKey: 'customer.deals',
  measure: { op: 'count' },
  operator: SegmentOperator.Equals,
  value: 1,
};

const segment = {
  _id: 'segment-1',
  contentType: 'core:contacts.customers',
  root: {
    kind: 'group',
    conjunction: 'and',
    children: [tagCondition, dealCount],
  } as SegmentNode,
};

const countRef = segmentRelationRef(dealCount);

const gatewayWith = (
  stub: Partial<SegmentEvaluationGateway>,
): SegmentEvaluationGateway => ({
  relationsFor: async () => relationDirectory,
  resolveFields: async () => ({ values: {} }),
  resolveEdges: async () => ({}),
  ...stub,
});

describe('evaluateSegmentBatch', () => {
  it('splits subjects into matched, notMatched and undecided', async () => {
    const gateway = gatewayWith({
      resolveEdges: async () => ({ 'c-1': ['d-1'], 'c-2': ['d-1', 'd-2'] }),
      resolveFields: async (plugin) =>
        plugin === 'core'
          ? {
              values: {
                'c-1': { 'core:contacts.customers.tagIds': ['tag-1'] },
                'c-2': { 'core:contacts.customers.tagIds': ['tag-1'] },
                'c-3': { 'core:contacts.customers.tagIds': ['tag-9'] },
              },
            }
          : {
              values: {
                'c-1': { [countRef]: 1 },
                'c-2': { [countRef]: 2 },
                'c-3': { [countRef]: 0 },
              },
            },
    });

    const result = await evaluateSegmentBatch(gateway, segment, [
      'c-1',
      'c-2',
      'c-3',
    ]);

    expect(result.matched).toEqual(['c-1']);
    expect(result.notMatched).toEqual(['c-2', 'c-3']);
    expect(result.undecided).toEqual([]);
  });

  it('leaves a subject undecided when a plugin fails', async () => {
    const gateway = gatewayWith({
      resolveEdges: async () => ({ 'c-1': ['d-1'] }),
      resolveFields: async (plugin) => {
        if (plugin === 'sales') {
          throw new Error('sales is down');
        }

        return {
          values: { 'c-1': { 'core:contacts.customers.tagIds': ['tag-1'] } },
        };
      },
    });

    const result = await evaluateSegmentBatch(gateway, segment, ['c-1']);

    expect(result).toEqual({
      matched: [],
      notMatched: [],
      undecided: ['c-1'],
    });
  });

  it('hands the measuring plugin the edges it cannot resolve itself', async () => {
    const seen: SegmentValueRequest[] = [];

    const gateway = gatewayWith({
      resolveEdges: async () => ({ 'c-1': ['d-1', 'd-2'] }),
      resolveFields: async (plugin, input) => {
        if (plugin === 'sales') {
          seen.push(...input.requests);
        }

        return { values: {} };
      },
    });

    await evaluateSegmentBatch(gateway, segment, ['c-1']);

    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({
      kind: 'relation',
      relationKey: 'customer.deals',
      edges: { 'c-1': ['d-1', 'd-2'] },
    });
  });

  it('asks for edges once per related type, not once per request', async () => {
    let edgeLookups = 0;

    const twoMeasures: SegmentNode = {
      kind: 'group',
      conjunction: 'and',
      children: [
        dealCount,
        {
          kind: 'relation',
          relationKey: 'customer.deals',
          measure: { op: 'sum', fieldKey: 'totalAmount' },
          operator: SegmentOperator.NumberGt,
          value: 100,
        },
      ],
    };

    const gateway = gatewayWith({
      resolveEdges: async () => {
        edgeLookups++;
        return { 'c-1': ['d-1'] };
      },
    });

    await evaluateSegmentBatch(gateway, { ...segment, root: twoMeasures }, [
      'c-1',
    ]);

    expect(edgeLookups).toBe(1);
  });

  it('reads nothing for an empty batch', async () => {
    let touched = false;

    const gateway = gatewayWith({
      relationsFor: async () => {
        touched = true;
        return relationDirectory;
      },
    });

    expect(await evaluateSegmentBatch(gateway, segment, [])).toEqual({
      matched: [],
      notMatched: [],
      undecided: [],
    });
    expect(touched).toBe(false);
  });
});

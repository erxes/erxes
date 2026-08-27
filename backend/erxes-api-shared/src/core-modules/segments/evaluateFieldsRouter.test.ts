import { createSegmentEvaluateFieldsHandler } from './evaluateFieldsRouter';
import { SegmentOperator } from './fieldMeta';
import { SegmentValueRequest } from './plan';
import { SegmentEvaluateFieldsResult } from './types';

const dealFields = {
  'sales:sales.deals': [
    {
      key: 'status',
      label: 'Status',
      operators: [SegmentOperator.Equals],
      kind: 'projected' as const,
      path: 'status',
      input: 'text' as const,
    },
  ],
};

const dealRelations = [
  {
    key: 'customer.deals',
    label: 'Deals',
    subjectType: 'core:contacts.customers',
    relatedType: 'sales:sales.deals',
    join: {
      via: 'relation' as const,
      subjectRecordType: 'core:customer',
      relatedRecordType: 'sales:deal',
    },
  },
];

const fieldRequest: SegmentValueRequest = {
  kind: 'field',
  ref: 'sales:sales.deals.status',
  contentType: 'sales:sales.deals',
  fieldKey: 'status',
};

const relationRequest: SegmentValueRequest = {
  kind: 'relation',
  ref: 'customer.deals#abc',
  relationKey: 'customer.deals',
  measure: { op: 'count' },
};

const generateModels = async () => ({ tag: 'models' });

describe('createSegmentEvaluateFieldsHandler', () => {
  it('routes a relation to the module that declared it, not the subject type', async () => {
    const seen: SegmentValueRequest[][] = [];

    const handler = createSegmentEvaluateFieldsHandler({
      modules: {
        sales: {
          segmentFields: dealFields,
          segmentRelations: dealRelations,
          evaluateFields: async (
            data,
          ): Promise<SegmentEvaluateFieldsResult> => {
            seen.push(data.requests);
            return { values: { 'customer-1': { [relationRequest.ref]: 2 } } };
          },
        },
      },
      generateModels,
    });

    // The batch is about customers; only sales can measure their deals.
    const result = await handler({
      subdomain: 'os',
      data: {
        subjectType: 'core:contacts.customers',
        subjectIds: ['customer-1'],
        requests: [relationRequest],
      },
    });

    expect(seen).toEqual([[relationRequest]]);
    expect(result.values['customer-1']).toEqual({ 'customer.deals#abc': 2 });
    expect(result.unavailable).toBeUndefined();
  });

  it('splits one batch across the modules that own each ref', async () => {
    const calls: string[] = [];

    const answering =
      (name: string) => async (): Promise<SegmentEvaluateFieldsResult> => {
        calls.push(name);
        return { values: {} };
      };

    const handler = createSegmentEvaluateFieldsHandler({
      modules: {
        sales: {
          segmentFields: dealFields,
          evaluateFields: answering('sales'),
        },
        pos: {
          segmentFields: { 'sales:posOrder': [] },
          segmentRelations: dealRelations.map((relation) => ({
            ...relation,
            key: 'customer.posOrders',
          })),
          evaluateFields: answering('pos'),
        },
      },
      generateModels,
    });

    await handler({
      subdomain: 'os',
      data: {
        subjectType: 'core:contacts.customers',
        subjectIds: ['customer-1'],
        requests: [
          fieldRequest,
          { ...relationRequest, relationKey: 'customer.posOrders' },
        ],
      },
    });

    expect(calls.sort()).toEqual(['pos', 'sales']);
  });

  it('reports a ref no module declares instead of answering it unset', async () => {
    const handler = createSegmentEvaluateFieldsHandler({
      modules: {
        sales: {
          segmentFields: dealFields,
          evaluateFields: async () => ({ values: {} }),
        },
      },
      generateModels,
    });

    const result = await handler({
      subdomain: 'os',
      data: {
        subjectType: 'core:contacts.customers',
        subjectIds: ['customer-1'],
        requests: [relationRequest],
      },
    });

    expect(result.unavailable).toEqual(['customer.deals#abc']);
  });
});

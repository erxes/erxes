import { SegmentOperator } from './operators';
import { SegmentFieldMeta, SegmentFieldNamespace } from './fieldMeta';
import {
  namespacePaths,
  projectionForRequests,
  readNamespacedValue,
  splitSegmentFieldRequests,
} from './fieldRequests';
import { SegmentValueRequest } from './plan';

const fields: Record<string, SegmentFieldMeta[]> = {
  'sales:deal': [
    {
      key: 'stageId',
      label: 'Stage',
      operators: [SegmentOperator.Equals],
      kind: 'projected',
      path: 'stageId',
      input: 'select',
      source: 'component',
      component: 'dealStage',
    },
    {
      key: 'productId',
      label: 'Product',
      operators: [SegmentOperator.Equals],
      kind: 'projected',
      path: 'productsData.productId',
      input: 'text',
    },
    {
      key: 'totalAmount',
      label: 'Total amount',
      operators: [SegmentOperator.NumberGt],
      kind: 'derived',
      dependsOn: [{ fields: ['productsData'] }],
      input: 'number',
    },
  ],
};

const fieldRequest = (fieldKey: string): SegmentValueRequest => ({
  kind: 'field',
  ref: `sales:deal.${fieldKey}`,
  contentType: 'sales:deal',
  fieldKey,
});

describe('splitSegmentFieldRequests', () => {
  it('separates fields read off the document from ones the plugin computes', () => {
    const split = splitSegmentFieldRequests(
      [fieldRequest('stageId'), fieldRequest('totalAmount')],
      fields,
    );

    expect(split.projected).toEqual([
      {
        ref: 'sales:deal.stageId',
        contentType: 'sales:deal',
        fieldKey: 'stageId',
        path: 'stageId',
      },
    ]);
    expect(split.derived).toEqual([
      {
        ref: 'sales:deal.totalAmount',
        contentType: 'sales:deal',
        fieldKey: 'totalAmount',
      },
    ]);
    expect(split.undeclared).toEqual([]);
  });

  it('carries the declared mongo path, which may differ from the key', () => {
    const split = splitSegmentFieldRequests(
      [fieldRequest('productId')],
      fields,
    );

    expect(split.projected[0].path).toBe('productsData.productId');
  });

  it('reports a ref the plugin no longer declares', () => {
    const split = splitSegmentFieldRequests(
      [fieldRequest('removedField')],
      fields,
    );

    expect(split.undeclared).toEqual(['sales:deal.removedField']);
    expect(split.projected).toEqual([]);
    expect(split.derived).toEqual([]);
  });

  it('reports a ref for a content type the plugin declares nothing for', () => {
    const split = splitSegmentFieldRequests(
      [
        {
          kind: 'field',
          ref: 'sales:order.total',
          contentType: 'sales:order',
          fieldKey: 'total',
        },
      ],
      fields,
    );

    expect(split.undeclared).toEqual(['sales:order.total']);
  });

  it('keeps relation requests aside for their own resolver', () => {
    const relation: SegmentValueRequest = {
      kind: 'relation',
      ref: 'customer.deals#abcd1234',
      relationKey: 'customer.deals',
      measure: { op: 'exists' },
      child: {
        kind: 'field',
        contentType: 'sales:deal',
        fieldKey: 'status',
        operator: SegmentOperator.Equals,
        value: 'won',
      },
    };

    const split = splitSegmentFieldRequests(
      [relation, fieldRequest('stageId')],
      fields,
    );

    expect(split.relations).toEqual([relation]);
    expect(split.projected).toHaveLength(1);
  });

  it('treats a plugin with no declaration as declaring nothing', () => {
    expect(
      splitSegmentFieldRequests([fieldRequest('stageId')]).undeclared,
    ).toEqual(['sales:deal.stageId']);
  });
});

describe('projectionForRequests', () => {
  it('reads every projected path in one query, always with _id', () => {
    const split = splitSegmentFieldRequests(
      [fieldRequest('stageId'), fieldRequest('productId')],
      fields,
    );

    expect(projectionForRequests(split.projected)).toEqual({
      _id: 1,
      stageId: 1,
      'productsData.productId': 1,
    });
  });

  it('still asks for _id when nothing is projected', () => {
    expect(projectionForRequests([])).toEqual({ _id: 1 });
  });
});

describe('splitSegmentFieldRequests · namespaces', () => {
  const namespaces: Record<string, SegmentFieldNamespace[]> = {
    'sales:deal': [
      {
        prefix: 'customFieldsData',
        label: 'Custom properties',
        path: 'customFieldsData',
        keyPath: 'field',
        valuePath: 'value',
      },
    ],
  };

  it('routes a tenant-keyed entry to its namespace', () => {
    const split = splitSegmentFieldRequests(
      [fieldRequest('customFieldsData.Gm3K8ni3r2i4eNeXC')],
      fields,
      namespaces,
    );

    expect(split.namespaced).toEqual([
      {
        ref: 'sales:deal.customFieldsData.Gm3K8ni3r2i4eNeXC',
        contentType: 'sales:deal',
        fieldKey: 'customFieldsData.Gm3K8ni3r2i4eNeXC',
        namespace: namespaces['sales:deal'][0],
        entryKey: 'Gm3K8ni3r2i4eNeXC',
      },
    ]);
    expect(split.undeclared).toEqual([]);
  });

  it('leaves a bare prefix with no key undeclared', () => {
    const split = splitSegmentFieldRequests(
      [fieldRequest('customFieldsData')],
      fields,
      namespaces,
    );

    expect(split.namespaced).toEqual([]);
    expect(split.undeclared).toEqual(['sales:deal.customFieldsData']);
  });

  it('lets a declared field win over a namespace prefix', () => {
    const withPrefixField = {
      'sales:deal': [
        ...fields['sales:deal'],
        {
          key: 'customFieldsData.pinned',
          label: 'Pinned',
          operators: [SegmentOperator.Equals],
          kind: 'projected' as const,
          path: 'pinned',
          input: 'text' as const,
        },
      ],
    };

    const split = splitSegmentFieldRequests(
      [fieldRequest('customFieldsData.pinned')],
      withPrefixField,
      namespaces,
    );

    expect(split.projected).toHaveLength(1);
    expect(split.namespaced).toEqual([]);
  });

  it('reads the entry value out of the array', () => {
    const split = splitSegmentFieldRequests(
      [fieldRequest('customFieldsData.plan')],
      fields,
      namespaces,
    );

    const document = {
      customFieldsData: [
        { field: 'other', value: 'no' },
        { field: 'plan', value: 'enterprise' },
      ],
    };

    expect(readNamespacedValue(document, split.namespaced[0])).toBe(
      'enterprise',
    );
    expect(readNamespacedValue({}, split.namespaced[0])).toBeUndefined();
  });

  it('lists each namespace array once for the projection', () => {
    const split = splitSegmentFieldRequests(
      [fieldRequest('customFieldsData.a'), fieldRequest('customFieldsData.b')],
      fields,
      namespaces,
    );

    expect(namespacePaths(split.namespaced)).toEqual(['customFieldsData']);
  });
});

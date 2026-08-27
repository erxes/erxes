import { segmentDependencies } from './dependencies';
import { SegmentOperator, SegmentRelationMeta } from './fieldMeta';
import { SegmentNode } from './nodes';

const relations = new Map<string, SegmentRelationMeta>([
  [
    'customer.deals',
    {
      key: 'customer.deals',
      label: 'Deals',
      subjectType: 'core:contacts.customers',
      relatedType: 'sales:sales.deals',
      // Core's relation records name their ends differently from the segment
      // types, which is the whole reason these are declared separately.
      join: {
        via: 'relation',
        subjectRecordType: 'core:customer',
        relatedRecordType: 'sales:deal',
      },
    },
  ],
]);

const tagged: SegmentNode = {
  kind: 'field',
  contentType: 'core:contacts.customers',
  fieldKey: 'tagIds',
  operator: SegmentOperator.Equals,
  value: 'tag-1',
};

describe('segmentDependencies', () => {
  it('always includes the segment’s own content type', () => {
    expect(
      segmentDependencies('core:contacts.customers', {
        kind: 'group',
        conjunction: 'and',
        children: [],
      }),
    ).toEqual(['core:contacts.customers']);
  });

  it('reaches the related type through a relation with no predicate', () => {
    // "customers with at least one deal" still has to be re-checked when a
    // deal changes, even though no deal field is named anywhere.
    const root: SegmentNode = {
      kind: 'group',
      conjunction: 'and',
      children: [
        tagged,
        {
          kind: 'relation',
          relationKey: 'customer.deals',
          measure: { op: 'count' },
          operator: SegmentOperator.NumberGt,
          value: 1,
        },
      ],
    };

    expect(
      segmentDependencies('core:contacts.customers', root, relations),
    ).toEqual(['core:contacts.customers', 'sales:sales.deals']);
  });

  it('reads the fields inside a relation predicate', () => {
    const root: SegmentNode = {
      kind: 'group',
      conjunction: 'and',
      children: [
        {
          kind: 'relation',
          relationKey: 'customer.deals',
          measure: { op: 'count' },
          operator: SegmentOperator.Equals,
          value: 1,
          child: {
            kind: 'field',
            contentType: 'sales:sales.deals',
            fieldKey: 'stageProbability',
            operator: SegmentOperator.Equals,
            value: 'Won',
          },
        },
      ],
    };

    // Resolvable from the predicate alone, so a relation whose plugin is not
    // registered still contributes what its conditions name.
    expect(segmentDependencies('core:contacts.customers', root)).toEqual([
      'core:contacts.customers',
      'sales:sales.deals',
    ]);
  });

  it('does not repeat a type named more than once', () => {
    const root: SegmentNode = {
      kind: 'group',
      conjunction: 'or',
      children: [tagged, tagged],
    };

    expect(segmentDependencies('core:contacts.customers', root)).toEqual([
      'core:contacts.customers',
    ]);
  });
});

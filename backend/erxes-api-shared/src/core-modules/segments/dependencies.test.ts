import { SegmentOperator } from './operators';
import { SegmentRelationMeta } from './relationRegistry';
import { segmentDependencies, segmentDependsOnClock } from './dependencies';

import { SegmentNode } from './nodes';

const relations = new Map<string, SegmentRelationMeta>([
  [
    'customer.deals',
    {
      key: 'customer.deals',
      label: 'Deals',
      subjectType: 'core:contacts.customers',
      relatedType: 'sales:sales.deals',
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

  it('files the collection a field reads its value out of', () => {
    const root: SegmentNode = {
      kind: 'group',
      conjunction: 'and',
      children: [
        {
          kind: 'field',
          contentType: 'sales:sales.deals',
          fieldKey: 'stageProbability',
          operator: SegmentOperator.Equals,
          value: 'Won',
        },
      ],
    };

    const fieldSources = new Map([
      ['sales:sales.deals:stageProbability', ['sales:sales.stages']],
    ]);

    expect(
      segmentDependencies('sales:sales.deals', root, undefined, fieldSources),
    ).toEqual(['sales:sales.deals', 'sales:sales.stages']);

    expect(segmentDependencies('sales:sales.deals', root)).toEqual([
      'sales:sales.deals',
    ]);
  });

  it('reaches the related type through a relation with no predicate', () => {
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

describe('segmentDependsOnClock', () => {
  const dated = (operator: SegmentOperator): SegmentNode => ({
    kind: 'field',
    contentType: 'core:contacts.customers',
    fieldKey: 'createdAt',
    operator,
    value: '30',
  });

  it('spots a relative operator', () => {
    expect(segmentDependsOnClock(dated(SegmentOperator.DaysAgo))).toBe(true);
    expect(segmentDependsOnClock(dated(SegmentOperator.DaysFromNow))).toBe(
      true,
    );
  });

  it('leaves a fixed date alone - it means the same thing tomorrow', () => {
    expect(segmentDependsOnClock(dated(SegmentOperator.DateGte))).toBe(false);
    expect(segmentDependsOnClock(dated(SegmentOperator.Equals))).toBe(false);
  });

  it('looks inside a relation predicate, where the same trap lives', () => {
    expect(
      segmentDependsOnClock({
        kind: 'relation',
        relationKey: 'customer.deals',
        measure: { op: 'exists' },
        child: dated(SegmentOperator.DaysAgo),
      }),
    ).toBe(true);
  });
});

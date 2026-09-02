import { SegmentOperator } from './operators';

import {
  canonicalSegmentText,
  sameSegmentDefinition,
  segmentFingerprint,
} from './fingerprint';
import { SegmentNode } from './nodes';

const field = (fieldKey: string, value: string): SegmentNode => ({
  kind: 'field',
  contentType: 'core:contacts.customers',
  fieldKey,
  operator: SegmentOperator.Equals,
  value,
});

const group = (children: SegmentNode[]): SegmentNode => ({
  kind: 'group',
  conjunction: 'and',
  children,
});

const print = (root: SegmentNode) =>
  segmentFingerprint('core:contacts.customers', root);

describe('segmentFingerprint', () => {
  it('ignores the order conditions were typed in', () => {
    const one = group([field('state', 'customer'), field('tagIds', 't-1')]);
    const other = group([field('tagIds', 't-1'), field('state', 'customer')]);

    expect(print(one)).toBe(print(other));
  });

  it('sees through a group wrapped around a single condition', () => {
    const bare = group([field('state', 'customer')]);
    const wrapped = group([group([field('state', 'customer')])]);

    expect(print(bare)).toBe(print(wrapped));
  });

  it('ignores a group left empty by the builder', () => {
    const withEmpty = group([field('state', 'customer'), group([])]);

    expect(print(withEmpty)).toBe(print(group([field('state', 'customer')])));
  });

  it('separates definitions that differ', () => {
    expect(print(group([field('state', 'customer')]))).not.toBe(
      print(group([field('state', 'lead')])),
    );
  });

  it('separates the same tree on a different content type', () => {
    const root = group([field('state', 'customer')]);

    expect(segmentFingerprint('core:contacts.customers', root)).not.toBe(
      segmentFingerprint('core:contacts.leads', root),
    );
  });

  it('keeps the exact text, so a hash collision cannot decide anything', () => {
    expect(
      canonicalSegmentText('core:contacts.customers', group([field('a', 'x')])),
    ).not.toBe(
      canonicalSegmentText('core:contacts.customers', group([field('a', 'y')])),
    );
  });
});

describe('sameSegmentDefinition', () => {
  const TYPE = 'core:contacts.customers';
  const state = field('state', 'customer');
  const tag = field('tagIds', 't-1');

  it('sees a reordered tree as the same question', () => {
    expect(
      sameSegmentDefinition(TYPE, group([state, tag]), group([tag, state])),
    ).toBe(true);
  });

  it('sees through a group wrapped around one condition', () => {
    expect(
      sameSegmentDefinition(
        TYPE,
        group([state, tag]),
        group([group([state]), tag]),
      ),
    ).toBe(true);
  });

  it('does not confuse a changed value for a reorder', () => {
    expect(
      sameSegmentDefinition(
        TYPE,
        group([state, tag]),
        group([tag, field('state', 'lead')]),
      ),
    ).toBe(false);
  });

  it('separates trees about different records', () => {
    expect(sameSegmentDefinition(TYPE, group([state]), group([state]))).toBe(
      true,
    );
    expect(
      canonicalSegmentText(TYPE, group([state])) ===
        canonicalSegmentText('sales:sales.deals', group([state])),
    ).toBe(false);
  });
});

import { SegmentOperator } from './fieldMeta';
import { canonicalSegmentText, segmentFingerprint } from './fingerprint';
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
    // The fingerprint narrows to candidates; this is what settles them.
    expect(
      canonicalSegmentText('core:contacts.customers', group([field('a', 'x')])),
    ).not.toBe(
      canonicalSegmentText('core:contacts.customers', group([field('a', 'y')])),
    );
  });
});

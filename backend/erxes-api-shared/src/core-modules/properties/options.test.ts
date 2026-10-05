import { SegmentNode } from '../segments/nodes';
import { reconcilePropertyOptions, segmentFiltersByOption } from './options';

const option = (value: string, deprecated?: boolean) => ({
  label: value.toUpperCase(),
  value,
  ...(deprecated === undefined ? {} : { deprecated }),
});

describe('reconcilePropertyOptions', () => {
  const stored = [option('a'), option('b'), option('c')];

  it('keeps what the form sends, label edits included', () => {
    const incoming = [
      { label: 'Renamed', value: 'a' },
      option('b'),
      option('c'),
    ];

    expect(reconcilePropertyOptions(stored, incoming, [])).toEqual(incoming);
  });

  it('drops a removed option no record holds', () => {
    const result = reconcilePropertyOptions(
      stored,
      [option('a'), option('b')],
      [{ value: 'a', count: 4 }],
    );

    expect(result.map(({ value }) => value)).toEqual(['a', 'b']);
  });

  it('archives a removed option a record still holds', () => {
    const result = reconcilePropertyOptions(
      stored,
      [option('a')],
      [
        { value: 'b', count: 2 },
        { value: 'c', count: 0 },
      ],
    );

    expect(result).toEqual([option('a'), option('b', true)]);
  });

  it('archives every removed option when they could not be counted', () => {
    const result = reconcilePropertyOptions(stored, [option('a')], null);

    expect(result).toEqual([option('a'), option('b', true), option('c', true)]);
  });

  it('adds a new option as given', () => {
    const result = reconcilePropertyOptions(
      stored,
      [...stored, option('d')],
      [],
    );

    expect(result.map(({ value }) => value)).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('segmentFiltersByOption', () => {
  const field = (fieldKey: string, value: string | string[]) =>
    ({
      kind: 'field',
      contentType: 'core:contacts.customers',
      fieldKey,
      operator: 'in',
      value,
    }) as SegmentNode;

  const group = (...children: SegmentNode[]): SegmentNode => ({
    kind: 'group',
    conjunction: 'and',
    children,
  });

  it('finds an option named in a nested condition', () => {
    const root = group(
      field('state', 'customer'),
      group(field('propertiesData.f1', ['o1', 'o3'])),
    );

    expect(segmentFiltersByOption(root, 'f1', 'o3')).toBe(true);
    expect(segmentFiltersByOption(root, 'f1', 'o2')).toBe(false);
  });

  it('matches a single value and a repeating group row', () => {
    expect(
      segmentFiltersByOption(
        group(field('propertiesData.f1', 'o1')),
        'f1',
        'o1',
      ),
    ).toBe(true);
    expect(
      segmentFiltersByOption(
        group(field('propertiesData.g:edu/f1', 'o1')),
        'f1',
        'o1',
      ),
    ).toBe(true);
  });

  it('ignores another field holding the same value', () => {
    expect(
      segmentFiltersByOption(
        group(field('propertiesData.f2', 'o1')),
        'f1',
        'o1',
      ),
    ).toBe(false);
  });

  it('passes over a segment carried over without conditions', () => {
    expect(segmentFiltersByOption(undefined, 'f1', 'o1')).toBe(false);
  });
});

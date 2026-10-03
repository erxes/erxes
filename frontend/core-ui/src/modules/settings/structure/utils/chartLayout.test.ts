import {
  buildChartLayout,
  buildChildrenMap,
  getDescendantIds,
  getSubtreeIds,
} from './chartLayout';

const item = (
  _id: string,
  parentId?: string | null,
  order?: string | null,
) => ({ _id, parentId: parentId ?? null, order: order ?? _id });

const opts = { nodeWidth: 100, nodeHeight: 50, hGap: 20, vGap: 40 };

const mustGet = <T,>(map: Map<string, T>, id: string): T => {
  const value = map.get(id);
  if (value === undefined) {
    throw new Error(`missing entry for ${id}`);
  }
  return value;
};

describe('buildChildrenMap', () => {
  it('groups children by parent and ignores missing parents', () => {
    const items = [
      item('a'),
      item('b', 'a'),
      item('c', 'a'),
      item('d', 'ghost'),
      item('a2', 'a'),
    ];
    const map = buildChildrenMap(items);
    expect(map.get('a')?.sort()).toEqual(['a2', 'b', 'c']);
    expect(map.has('ghost')).toBe(false);
  });

  it('ignores self-referencing items', () => {
    const map = buildChildrenMap([item('a', 'a')]);
    expect(map.size).toBe(0);
  });
});

describe('getDescendantIds / getSubtreeIds', () => {
  const items = [
    item('a'),
    item('b', 'a'),
    item('c', 'a'),
    item('d', 'b'),
    item('e', 'd'),
  ];
  const map = buildChildrenMap(items);

  it('collects all descendants transitively', () => {
    expect([...getDescendantIds(map, 'a')].sort()).toEqual([
      'b',
      'c',
      'd',
      'e',
    ]);
    expect(getDescendantIds(map, 'b')).toEqual(new Set(['d', 'e']));
    expect(getDescendantIds(map, 'e')).toEqual(new Set());
  });

  it('includes the node itself in subtree ids', () => {
    expect(getSubtreeIds(map, 'b')).toEqual(new Set(['b', 'd', 'e']));
  });
});

describe('buildChartLayout', () => {
  it('lays out a single root centered on its children', () => {
    const items = [item('root'), item('a', 'root'), item('b', 'root')];
    const { positions, edges } = buildChartLayout(items, new Set(), opts);

    const rootX = mustGet(positions, 'root').x;
    const ax = mustGet(positions, 'a').x;
    const bx = mustGet(positions, 'b').x;
    expect(rootX).toBe((ax + bx) / 2);
    expect(mustGet(positions, 'a').depth).toBe(1);
    expect(mustGet(positions, 'a').y).toBe(50 + 40);
    expect(mustGet(positions, 'root').y).toBe(0);
    expect(edges).toEqual([
      { id: 'root-a', source: 'root', target: 'a' },
      { id: 'root-b', source: 'root', target: 'b' },
    ]);
  });

  it('orders siblings by order field', () => {
    const items = [
      item('root'),
      item('b', 'root', 'B/'),
      item('a', 'root', 'A/'),
    ];
    const { positions } = buildChartLayout(items, new Set(), opts);
    expect(mustGet(positions, 'a').x).toBeLessThan(mustGet(positions, 'b').x);
  });

  it('orders multiple roots left to right', () => {
    const items = [item('r2', null, 'B/'), item('r1', null, 'A/')];
    const { positions, rootIds } = buildChartLayout(items, new Set(), opts);
    expect(rootIds).toEqual(['r1', 'r2']);
    expect(mustGet(positions, 'r2').x).toBe(100 + 20);
  });

  it('hides descendants of collapsed nodes', () => {
    const items = [
      item('root'),
      item('a', 'root'),
      item('b', 'a'),
      item('sibling', 'root'),
    ];
    const { positions, edges } = buildChartLayout(
      items,
      new Set(['a']),
      opts,
    );
    expect(positions.has('b')).toBe(false);
    expect(positions.has('a')).toBe(true);
    expect(edges.find((edge) => edge.target === 'b')).toBeUndefined();
  });

  it('keeps cyclic items on the canvas instead of losing them', () => {
    const items = [item('a', 'b'), item('b', 'a'), item('root')];
    const { positions } = buildChartLayout(items, new Set(), opts);
    expect(positions.has('a')).toBe(true);
    expect(positions.has('b')).toBe(true);
    expect(positions.has('root')).toBe(true);
  });

  it('stacks depths vertically with the deepest layer lowest', () => {
    const items = [item('root'), item('a', 'root'), item('b', 'a')];
    const { positions } = buildChartLayout(items, new Set(), opts);
    expect(mustGet(positions, 'root').y).toBe(0);
    expect(mustGet(positions, 'a').y).toBe(50 + 40);
    expect(mustGet(positions, 'b').y).toBe(50 + 40 + 50 + 40);
  });
});

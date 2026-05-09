import {
  cloneWithNewIds,
  findNode,
  findParent,
  insertAt,
  moveNode,
  removeAt,
  replaceProps,
} from './tree';
import { BuilderNode } from '../types';

const makeRoot = (): BuilderNode => ({
  id: 'root',
  type: 'Container',
  kind: 'organism',
  props: {},
  children: [
    {
      id: 'a',
      type: 'Heading',
      kind: 'atom',
      props: { text: 'A' },
    },
    {
      id: 'b',
      type: 'FeaturesGrid',
      kind: 'organism',
      props: {},
      children: [
        { id: 'b1', type: 'FeatureItem', kind: 'molecule', props: {} },
      ],
    },
  ],
});

describe('tree utils', () => {
  it('finds nodes by id (deep)', () => {
    const root = makeRoot();
    expect(findNode(root, 'a')?.id).toBe('a');
    expect(findNode(root, 'b1')?.id).toBe('b1');
    expect(findNode(root, 'missing')).toBeNull();
  });

  it('finds the parent and index of a node', () => {
    const root = makeRoot();
    const at = findParent(root, 'b1');
    expect(at?.parent.id).toBe('b');
    expect(at?.index).toBe(0);
  });

  it('inserts a node at a given index', () => {
    const root = makeRoot();
    const newNode: BuilderNode = {
      id: 'c',
      type: 'Paragraph',
      kind: 'atom',
      props: {},
    };
    const next = insertAt(root, 'root', 1, newNode);
    expect(next.children?.map((c) => c.id)).toEqual(['a', 'c', 'b']);
    // original is untouched (immutability)
    expect(root.children?.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('removes a node by id', () => {
    const root = makeRoot();
    const next = removeAt(root, 'a');
    expect(next.children?.map((c) => c.id)).toEqual(['b']);
  });

  it('replaces props on a single node', () => {
    const root = makeRoot();
    const next = replaceProps(root, 'a', { text: 'updated' });
    expect(findNode(next, 'a')?.props.text).toBe('updated');
    expect(findNode(root, 'a')?.props.text).toBe('A');
  });

  it('moveNode reparents a node', () => {
    const root = makeRoot();
    const next = moveNode(root, 'a', 'b', 0);
    expect(next.children?.map((c) => c.id)).toEqual(['b']);
    expect(findNode(next, 'b')?.children?.map((c) => c.id)).toEqual([
      'a',
      'b1',
    ]);
  });

  it('moveNode refuses to drop a node into its own subtree', () => {
    const root = makeRoot();
    const next = moveNode(root, 'b', 'b1', 0);
    expect(next).toBe(root);
  });

  it('cloneWithNewIds assigns fresh ids recursively', () => {
    const root = makeRoot();
    let i = 0;
    const cloned = cloneWithNewIds(root, () => `new-${i++}`);
    expect(cloned.id).toBe('new-0');
    expect(cloned.children?.[0].id).toBe('new-1');
    expect(cloned.children?.[1].id).toBe('new-2');
    expect(cloned.children?.[1].children?.[0].id).toBe('new-3');
  });
});

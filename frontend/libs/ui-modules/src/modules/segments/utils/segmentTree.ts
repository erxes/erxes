import { TSegmentGroupNode, TSegmentNode } from '../types/segmentNode';
import { TNodePath } from '../types';

/**
 * Moving a condition from one group to another.
 *
 * Done as a rewrite of the whole tree rather than as two field-array edits:
 * the source and the target are separate `useFieldArray` instances, so a move
 * between them has no single array to reorder. One pure function over the tree
 * is also the only version of this that can be reasoned about - a drop is
 * either a valid tree or it is refused.
 */

/** `root.children.0.children.2` -> `[0, 2]`. `root` -> `[]`. */
const indicesOf = (path: TNodePath): number[] =>
  path
    .split('.children.')
    .slice(1)
    .map((part) => Number(part));

const parentPath = (path: TNodePath): TNodePath =>
  path.slice(0, path.lastIndexOf('.children.'));

const lastIndex = (path: TNodePath): number =>
  Number(path.slice(path.lastIndexOf('.children.') + '.children.'.length));

/** Where a node sits: which group holds it, and at which position. */
export type TNodeSlot = { parent: TNodePath; index: number };

export const slotOf = (path: TNodePath): TNodeSlot | null =>
  path.includes('.children.')
    ? { parent: parentPath(path), index: lastIndex(path) }
    : null;

const groupAt = (
  root: TSegmentGroupNode,
  path: TNodePath,
): TSegmentGroupNode | null => {
  let current: TSegmentNode = root;

  for (const index of indicesOf(path)) {
    if (current.kind !== 'group') {
      return null;
    }

    const next: TSegmentNode | undefined = current.children[index];

    if (!next) {
      return null;
    }

    current = next;
  }

  return current.kind === 'group' ? current : null;
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

/**
 * Drops groups a move left empty.
 *
 * An empty group is not a neutral container: it matches nobody and blocks the
 * form's own validation, so leaving one behind would turn a move into an error
 * the user did not make. The root stays whatever happens - the form needs
 * something to add the next condition to.
 */
const pruneEmptyGroups = (node: TSegmentGroupNode): TSegmentGroupNode => ({
  ...node,
  children: node.children
    .map((child) => (child.kind === 'group' ? pruneEmptyGroups(child) : child))
    .filter((child) => child.kind !== 'group' || child.children.length > 0),
});

/**
 * The tree with one node moved. `null` when the move is not one to make -
 * a node onto itself, or a group into its own descendant, where the subtree
 * being moved is also the one being moved into.
 */
export const moveSegmentNode = (
  root: TSegmentGroupNode,
  from: TNodePath,
  to: TNodeSlot,
): TSegmentGroupNode | null => {
  const source = slotOf(from);

  if (!source) {
    return null;
  }

  if (to.parent === from || to.parent.startsWith(`${from}.children.`)) {
    return null;
  }

  const next = clone(root);
  const sourceGroup = groupAt(next, source.parent);
  const targetGroup = groupAt(next, to.parent);

  if (!sourceGroup || !targetGroup) {
    return null;
  }

  const [moved] = sourceGroup.children.splice(source.index, 1);

  if (!moved) {
    return null;
  }

  // The removal shifted everything after it up one, so a target further down
  // the same list is now one place closer.
  const index =
    sourceGroup === targetGroup && to.index > source.index
      ? to.index - 1
      : to.index;

  if (sourceGroup === targetGroup && index === source.index) {
    return null;
  }

  targetGroup.children.splice(Math.max(0, index), 0, moved);

  return pruneEmptyGroups(next);
};

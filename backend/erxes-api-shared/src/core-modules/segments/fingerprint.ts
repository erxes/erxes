import { SegmentNode } from './nodes';

/**
 * A stable identity for what a segment asks, independent of how it was typed.
 *
 * Two segments with the same definition are not untidy - they are the same
 * work done twice. Every change re-evaluates both, writes membership for both,
 * and records two transitions and two daily counts for one answer.
 *
 * The tree is put in a canonical form first, because the builder produces
 * several shapes for one question: a group holding a single condition means
 * what the condition alone means, and `and` / `or` do not care what order
 * their children are in.
 */

/** Key order and absent values must not change the identity. */
const stable = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stable).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));

    return `{${entries
      .map(([key, entry]) => `${JSON.stringify(key)}:${stable(entry)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value ?? null);
};

export const canonicalSegmentNode = (node: SegmentNode): SegmentNode => {
  if (node.kind !== 'group') {
    return node;
  }

  const children = node.children
    .map(canonicalSegmentNode)
    // An empty group asks nothing, so it cannot change what the tree asks.
    .filter((child) => child.kind !== 'group' || child.children.length > 0)
    .sort((left, right) => stable(left).localeCompare(stable(right)));

  // A group of one is that one; the wrapper carries no meaning of its own.
  if (children.length === 1) {
    return children[0];
  }

  return { ...node, children };
};

/** The canonical tree as text - the exact comparison, when one is needed. */
export const canonicalSegmentText = (
  contentType: string,
  root: SegmentNode,
): string => `${contentType}|${stable(canonicalSegmentNode(root))}`;

/**
 * FNV-1a over the canonical text. Short enough to index, and only ever used to
 * narrow to candidates - two segments are declared the same after their
 * canonical text matches, so a collision costs a comparison, not a wrong
 * answer.
 */
export const segmentFingerprint = (
  contentType: string,
  root: SegmentNode,
): string => {
  const source = canonicalSegmentText(contentType, root);
  let hash = 0x811c9dc5;

  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
};

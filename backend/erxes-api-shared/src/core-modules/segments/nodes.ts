import { SegmentOperator } from './fieldMeta';

/**
 * A segment's conditions as one tree.
 *
 * This is a cross-service contract: core owns the definition, plugins resolve
 * the values behind it, and the segmentation runtime decides membership from
 * it. Only the Mongoose schema lives in core-api.
 *
 * It replaces the two parallel nesting mechanisms of the old shape - `subOf` on
 * the document and `subSegmentId` inside a condition - which between them left
 * 633 references pointing at segments that no longer exist.
 */

export type SegmentValue = string | number | boolean | Date | string[];

export type SegmentGroupNode = {
  kind: 'group';
  conjunction: 'and' | 'or';
  children: SegmentNode[];
};

export type SegmentFieldNode = {
  kind: 'field';
  /** Owner of the field. May differ from the segment's own contentType. */
  contentType: string;
  fieldKey: string;
  operator: SegmentOperator;
  value?: SegmentValue;
};

/**
 * What to ask of the related records once the relation has been traversed.
 *
 * `exists`/`none` answer a yes-or-no; the rest reduce the set to a number that
 * is then compared with an operator, so "at least three won deals" and "has a
 * won deal" are the same node with a different measure.
 */
export type SegmentMeasure =
  | { op: 'exists' }
  | { op: 'none' }
  | { op: 'count' }
  | { op: 'sum' | 'avg' | 'min' | 'max'; fieldKey: string };

export type SegmentRelationNode = {
  kind: 'relation';
  relationKey: string;
  measure: SegmentMeasure;
  /** Narrows which related records the measure sees. */
  child?: SegmentNode;
  /** Required by the measures that produce a number. */
  operator?: SegmentOperator;
  value?: SegmentValue;
};

export type SegmentNode =
  | SegmentGroupNode
  | SegmentFieldNode
  | SegmentRelationNode;

/** Key a field node's resolved value is filed under, e.g. `sales:deal.stageId`. */
export const segmentFieldRef = (node: SegmentFieldNode): string =>
  `${node.contentType}.${node.fieldKey}`;

/** FNV-1a, so the same predicate always produces the same suffix. */
const hashValue = (value: unknown): string => {
  const source = JSON.stringify(value);
  let hash = 0x811c9dc5;

  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
};

/**
 * Key a relation node's measured value is filed under. The measure and the
 * predicate are both part of the key, because one segment may ask several
 * things of the same relation - "how many won deals" and "total amount of all
 * deals" both traverse `customer.deals` and must not overwrite each other.
 */
export const segmentRelationRef = (node: SegmentRelationNode): string =>
  `${node.relationKey}#${hashValue({
    measure: node.measure,
    child: node.child,
  })}`;

export type SegmentWalkOptions = {
  /**
   * A relation's predicate runs against the related records, not the subject,
   * so it is a leaf for anything reasoning about the subject. Only tooling that
   * renders or rewrites the whole tree should turn this on.
   */
  intoRelationChild?: boolean;
};

/** Depth-first walk over a tree, parents before children. */
export function* walkSegmentNodes(
  node: SegmentNode,
  options: SegmentWalkOptions = {},
): Generator<SegmentNode> {
  yield node;

  if (node.kind === 'group') {
    for (const child of node.children) {
      yield* walkSegmentNodes(child, options);
    }
  }

  if (node.kind === 'relation' && options.intoRelationChild && node.child) {
    yield* walkSegmentNodes(node.child, options);
  }
}

/**
 * Every value key a tree needs resolved before it can be decided. A relation
 * contributes one folded boolean, never the fields inside its predicate.
 */
export const collectSegmentValueRefs = (node: SegmentNode): string[] => {
  const refs = new Set<string>();

  for (const current of walkSegmentNodes(node)) {
    if (current.kind === 'field') {
      refs.add(segmentFieldRef(current));
    }

    if (current.kind === 'relation') {
      refs.add(segmentRelationRef(current));
    }
  }

  return [...refs];
};

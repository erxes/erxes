import { SegmentNode } from './nodes';
import {
  segmentFieldRef,
  segmentRelationRef,
  segmentReferenceRef,
} from './nodeRefs';

export type SegmentWalkOptions = {
  intoRelationChild?: boolean;
};

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

export const collectSegmentValueRefs = (
  node: SegmentNode,
  subjectType?: string,
): string[] => {
  const refs = new Set<string>();

  for (const current of walkSegmentNodes(node)) {
    if (current.kind === 'field') {
      refs.add(segmentFieldRef(current));
    }

    if (current.kind === 'relation') {
      refs.add(segmentRelationRef(current));
    }

    if (current.kind === 'segment' && subjectType) {
      refs.add(segmentReferenceRef(subjectType));
    }
  }

  return [...refs];
};

export const collectSegmentReferences = (node: SegmentNode): string[] => {
  const ids = new Set<string>();

  for (const current of walkSegmentNodes(node, { intoRelationChild: true })) {
    if (current.kind === 'segment') {
      ids.add(current.segmentId);
    }
  }

  return [...ids];
};

export const hasSegmentReferenceInRelation = (node: SegmentNode): boolean => {
  for (const current of walkSegmentNodes(node)) {
    if (
      current.kind === 'relation' &&
      current.child &&
      collectSegmentReferences(current.child).length
    ) {
      return true;
    }
  }

  return false;
};

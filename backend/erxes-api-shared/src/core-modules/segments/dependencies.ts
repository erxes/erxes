import { SegmentRelationMeta } from './fieldMeta';
import { SegmentNode, walkSegmentNodes } from './nodes';

/**
 * Every content type a segment reads.
 *
 * This is what turns a change into work: when a deal changes, the segments to
 * re-check are the ones that read deals - including a customer segment that
 * only reaches them through a relation. Stored on the segment so the lookup is
 * one indexed query rather than a walk over every definition.
 *
 * Derived from the tree rather than declared, so it cannot fall out of step
 * with the conditions it describes.
 */
export const segmentDependencies = (
  contentType: string,
  root: SegmentNode,
  relations?: ReadonlyMap<string, SegmentRelationMeta>,
): string[] => {
  // Its own records always matter, even for a segment with no conditions yet.
  const types = new Set<string>([contentType]);

  // Into relation children too: the fields inside a predicate are read from the
  // related records, and a change to one of those changes the answer.
  for (const node of walkSegmentNodes(root, { intoRelationChild: true })) {
    if (node.kind === 'field') {
      types.add(node.contentType);
    }

    if (node.kind === 'relation') {
      const related = relations?.get(node.relationKey)?.relatedType;

      // A relation whose plugin is currently disabled contributes nothing here.
      // Its own predicate still does, through the field nodes above.
      if (related) {
        types.add(related);
      }
    }
  }

  return [...types].sort();
};

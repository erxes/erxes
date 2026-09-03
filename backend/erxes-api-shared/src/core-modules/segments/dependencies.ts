import { SegmentOperator, normalizeSegmentOperator } from './operators';
import { SegmentRelationMeta } from './relationRegistry';
import { walkSegmentNodes } from './walkNodes';

import { SegmentNode } from './nodes';

export const segmentDependencyKey = (segmentId: string): string =>
  `segment:${segmentId}`;

export const segmentDependencies = (
  contentType: string,
  root: SegmentNode,
  relations?: ReadonlyMap<string, SegmentRelationMeta>,
  fieldSources?: ReadonlyMap<string, string[]>,
): string[] => {
  const types = new Set<string>([contentType]);

  for (const node of walkSegmentNodes(root, { intoRelationChild: true })) {
    if (node.kind === 'field') {
      types.add(node.contentType);

      const sources =
        fieldSources?.get(`${node.contentType}:${node.fieldKey}`) || [];

      sources.forEach((source) => types.add(source));
    }

    if (node.kind === 'segment') {
      types.add(segmentDependencyKey(node.segmentId));
    }

    if (node.kind === 'relation') {
      const related = relations?.get(node.relationKey)?.relatedType;

      if (related) {
        types.add(related);
      }
    }
  }

  return [...types].sort();
};

const CLOCK_OPERATORS = new Set<SegmentOperator>([
  SegmentOperator.DaysAgo,
  SegmentOperator.DaysFromNow,
  SegmentOperator.MinutesAgo,
  SegmentOperator.MinutesFromNow,
  SegmentOperator.AnniversaryToday,
  SegmentOperator.AnniversaryFromNow,
  SegmentOperator.AnniversaryAgo,
]);

export const segmentDependsOnClock = (root: SegmentNode): boolean => {
  for (const node of walkSegmentNodes(root, { intoRelationChild: true })) {
    const operator =
      node.kind === 'field' || node.kind === 'relation'
        ? node.operator
        : undefined;

    if (operator && CLOCK_OPERATORS.has(normalizeSegmentOperator(operator))) {
      return true;
    }
  }

  return false;
};

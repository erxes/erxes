import {
  SegmentFieldNode,
  SegmentRelationNode,
  SEGMENT_MEMBERSHIP_FIELD,
} from './nodes';

export const segmentReferenceRef = (subjectType: string): string =>
  `${subjectType}.${SEGMENT_MEMBERSHIP_FIELD}`;

export const segmentFieldRef = (node: SegmentFieldNode): string =>
  `${node.contentType}.${node.fieldKey}`;

const hashValue = (value: unknown): string => {
  const source = JSON.stringify(value);
  let hash = 0x811c9dc5;

  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
};

export const segmentRelationRef = (node: SegmentRelationNode): string =>
  `${node.relationKey}#${hashValue({
    measure: node.measure,
    child: node.child,
  })}`;

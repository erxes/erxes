import { SegmentOperator } from './operators';

export type SegmentValue = string | number | boolean | Date | string[];

export type SegmentGroupNode = {
  kind: 'group';
  conjunction: 'and' | 'or';
  children: SegmentNode[];
};

export type SegmentFieldNode = {
  kind: 'field';
  contentType: string;
  fieldKey: string;
  operator: SegmentOperator;
  value?: SegmentValue;
  meta?: Record<string, string>;
};

export type SegmentMeasure =
  | { op: 'exists' }
  | { op: 'none' }
  | { op: 'count' }
  | { op: 'sum' | 'avg' | 'min' | 'max'; fieldKey: string };

export type SegmentRelationNode = {
  kind: 'relation';
  relationKey: string;
  measure: SegmentMeasure;
  child?: SegmentNode;
  operator?: SegmentOperator;
  value?: SegmentValue;
};

export type SegmentReferenceNode = {
  kind: 'segment';
  segmentId: string;
  exclude?: boolean;
};

export type SegmentNode =
  | SegmentGroupNode
  | SegmentFieldNode
  | SegmentRelationNode
  | SegmentReferenceNode;

/** The field every record carries its membership in, added by `schemaWrapper`. */
export const SEGMENT_MEMBERSHIP_FIELD = 'segmentIds';

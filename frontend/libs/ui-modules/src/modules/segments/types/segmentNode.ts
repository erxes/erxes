export type TSegmentValue = string | number | boolean | string[];

export type TSegmentGroupNode = {
  kind: 'group';
  conjunction: 'and' | 'or';
  children: TSegmentNode[];
};

export type TSegmentFieldNode = {
  kind: 'field';
  contentType: string;
  fieldKey: string;
  operator: string;
  value?: TSegmentValue;
  meta?: Record<string, string>;
};

export type TSegmentReferenceNode = {
  kind: 'segment';
  segmentId: string;
  exclude?: boolean;
};

export type TSegmentNode =
  | TSegmentGroupNode
  | TSegmentFieldNode
  | TSegmentRelationNode
  | TSegmentReferenceNode;

export type TSegmentOperatorInput = 'none' | 'field' | 'number';

export type TSegmentOperator = {
  value: string;
  label: string;
  input: TSegmentOperatorInput;
  hint?: string;
};

export type TSegmentFieldInput =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select';

export type TSegmentField = {
  key: string;
  label: string;
  operators: TSegmentOperator[];
  kind: 'projected' | 'derived';
  input: TSegmentFieldInput;
  source?: 'static' | 'query' | 'component';
  options?: { value: string; label: string }[];
  query?: { name: string; labelField: string; valueField?: string };
  component?: string;
};

export type TSegmentRelation = {
  key: string;
  label: string;
  subjectType: string;
  relatedType: string;
  measureOperators: TSegmentOperator[];
};

export type TSegmentMeasure =
  | { op: 'exists' | 'none' | 'count' }
  | { op: 'sum' | 'avg' | 'min' | 'max'; fieldKey: string };

export type TSegmentRelationNode = {
  kind: 'relation';
  relationKey: string;
  measure: TSegmentMeasure;
  child?: TSegmentNode;
  operator?: string;
  value?: TSegmentValue;
};

export const emptyGroup = (): TSegmentGroupNode => ({
  kind: 'group',
  conjunction: 'and',
  children: [],
});

export const emptySegmentReference = (): TSegmentReferenceNode => ({
  kind: 'segment',
  segmentId: '',
});

export const emptyCondition = (contentType: string): TSegmentFieldNode => ({
  kind: 'field',
  contentType,
  fieldKey: '',
  operator: '',
});

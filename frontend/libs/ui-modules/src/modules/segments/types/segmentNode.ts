/**
 * The wire shape of a segment's condition tree, mirroring the contract in
 * `erxes-api-shared`. Declared here rather than imported because the frontend
 * does not depend on backend packages.
 */

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
};

export type TSegmentNode =
  | TSegmentGroupNode
  | TSegmentFieldNode
  | TSegmentRelationNode;

/** What the user needs to supply for an operator, as the backend declares it. */
export type TSegmentOperatorInput = 'none' | 'field' | 'number';

export type TSegmentOperator = {
  value: string;
  label: string;
  input: TSegmentOperatorInput;
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
  /** Operators a count or sum of this relation is compared with. */
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

export const emptyCondition = (contentType: string): TSegmentFieldNode => ({
  kind: 'field',
  contentType,
  fieldKey: '',
  operator: '',
});

export type PropertyFilterOperator =
  | 'eq'
  | 'ne'
  | 'contains'
  | 'doesNotContain'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'isTrue'
  | 'isFalse'
  | 'in'
  | 'notIn'
  | 'isSet'
  | 'isNotSet'
  | 'fileType';

export interface IPropertyFilterCondition {
  /** Either `<fieldId>` or `g:<groupId>/<fieldId>` for a repeating group. */
  fieldId: string;
  type?: string;
  operator?: PropertyFilterOperator;
  value?: unknown;
}

export interface IPropertyFilterOptions {
  /** Defaults to `propertiesData`. */
  prefix?: string;
}

export type PropertyFilterQuery = Record<string, unknown>;

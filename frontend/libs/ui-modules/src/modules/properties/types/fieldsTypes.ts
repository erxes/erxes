export type IField = {
  _id: string;
  name: string;
  code: string;
  options?: Array<{ label: string; value: string }>;
  type: string;
  group?: string;
  groupId?: string;
  logics?: Record<string, any>;
  relationType?: string;
  multiple?: boolean;
  icon?: string;
  configs?: Record<string, any>;
  validation?: any;
  selectOptions?: Array<{ label: string; value: string }>;
};

export interface IFieldGroup {
  _id: string;
  name: string;
  code: string;
  description: string;
  contentType: string;
  order: number;
  logics?: Record<string, any>;
  configs?: Record<string, any>;
}

export type mutateFunction = (
  variables: { _id: string } & Record<string, unknown>,
) => void;

export interface FieldColumnProps {
  fields: IField[];
  mutateHook: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
}

export interface FieldCellProps {
  field: IField;
  value: unknown;
  customFieldsData?: Record<string, unknown>;
  mutateHook: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
  id: string;
}

export type FieldCellValueProps = Omit<FieldCellProps, 'mutateHook' | 'id'>;

export type FieldCellValueContentProps = FieldCellValueProps & {
  handleChange: (value: unknown) => void;
  loading: boolean;
};

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
  fieldId: string;
  type?: string;
  operator: PropertyFilterOperator;
  value?: unknown;
}

export interface OperatorOption {
  value: PropertyFilterOperator;
  label: string;

  noValue?: boolean;
}

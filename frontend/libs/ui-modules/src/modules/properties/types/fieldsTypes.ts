export type IField = {
  _id: string;
  name: string;
  code: string;
  options?: Array<{ label: string; value: string | number }>;
  type?: string;
  group?: string;
  logics?: Record<string, any>;
  relationType?: string;
  multiple?: boolean;
  icon?: string;
};

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
  value: string;
  customFieldsData?: Record<string, unknown>;
  mutateHook: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
  id: string;
}

export type FieldCellValueProps = Omit<FieldCellProps, 'mutateHook'>;

export type FieldCellValueContentProps = FieldCellValueProps & {
  mutate: mutateFunction;
  loading: boolean;
};

import { ICategory } from '@erxes/ui/src/utils/categories';
import { IField } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type FieldsQueryResponse = {
  fields: IField[];
  loading: boolean;
  refetch: () => Promise<void>;
};

export type FieldsCombinedByType = {
  _id: string;
  name: string;
  label: string;
  brandName?: string;
  brandId?: string;
  type: string;
  selectOptions?: any[];
  order?: number;
  group?: string;
  options?: string[];
  title?: string;
  value?: string;
};

export type FieldsCombinedByTypeQueryResponse = {
  fieldsCombinedByContentType: FieldsCombinedByType[];
} & QueryResponse;

export interface IFieldGroup {
  _id: string;
  name: string;
  contentType: string;
  order: React.ReactNode;
  description: string;
  code: string;
  isVisible: boolean;
  isVisibleInDetail: boolean;
  isDefinedByErxes: boolean;
  fields: IField[];
  lastUpdatedUserId: string;
  lastUpdatedUser: IUser;
  config: any;
}

// mutation types
export type FieldsMutationVariables = {
  type?: string;
  validation?: string;
  text?: string;
  description?: string;
  options?: any[];
  groupId?: string;
  isVisibleToCreate?: boolean;
};

export type FieldsAddMutationResponse = {
  fieldsAdd: (fieldsAdd: {
    variables: FieldsMutationVariables;
  }) => Promise<any>;
};

export type FieldsEditMutationResponse = {
  fieldsEdit: (fieldsEdit: {
    variables: { _id: string } & FieldsMutationVariables;
  }) => Promise<any>;
};

export type FieldsUpdateVisibilityToCreateMutationResponse = {
  fieldsUpdateSystemFields: (fieldsUpdateSystemFields: {
    variables: {
      _id: string;
      isVisibleToCreate?: boolean;
      isRequired?: boolean;
    };
  }) => Promise<any>;
};

export type FieldsGroupsQueryResponse = {
  fieldsGroups: IFieldGroup[];
  loading: boolean;
  refetch: ({ contentType }: { contentType?: string }) => Promise<any>;
};

export type AddFieldsMutationVariables = {
  contentType: string;
  contentTypeId: string;
  field: IField;
};

export type AddFieldsMutationResponse = {
  addFieldsMutation: (params: {
    variables: AddFieldsMutationVariables;
  }) => void;
};

export type DefaultColumnsConfigQueryResponse = {
  fieldsDefaultColumnsConfig: IConfigColumn[];
} & QueryResponse;

export interface IConfigColumn {
  _id: string;
  name: string;
  label: string;
  order: number;
  checked?: boolean;
}

export type InboxFieldsQueryResponse = {
  inboxFields: {
    customer: IField[];
    device: IField[];
    conversation: IField[];
  };
  loading: boolean;
};

export type SystemFieldsGroupsQueryResponse = {
  getSystemFieldsGroup: IFieldGroup;
  loading: boolean;
  refetch: ({ contentType }: { contentType?: string }) => Promise<any>;
};

export type ProductCategoriesQueryResponse = {
  productCategories: ICategory[];
} & QueryResponse;

export type LogicParams = {
  fieldId: string;
  operator: string;
  logicValue: any;
  validation?: string;
  fieldValue?: any;
  type?: string;
};

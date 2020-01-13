import { IUser } from 'modules/auth/types';

export interface IField {
  _id: string;
  key?: string;
  contentType: string;
  contentTypeId?: string;
  type: string;
  validation?: string;
  text?: string;
  description?: string;
  options?: string[];
  isRequired?: boolean;
  order?: React.ReactNode;
  isVisible?: boolean;
  isDefinedByErxes?: boolean;
  groupId?: string;
  lastUpdatedUser?: IUser;
  lastUpdatedUserId?: string;
}

export interface IFieldGroup {
  _id: string;
  name: string;
  contentType: string;
  order: React.ReactNode;
  description: string;
  isVisible: boolean;
  isDefinedByErxes: boolean;
  fields: IField[];
  lastUpdatedUserId: string;
  lastUpdatedUser: IUser;
}

export interface IContentTypeFields {
  _id: string;
  name: string;
  label: string;
}

export interface IConfigColumn {
  name: string;
  label: string;
  order: number;
}

// query types

export type DefaultColumnsConfigQueryResponse = {
  fieldsDefaultColumnsConfig: IConfigColumn[];
  loading: boolean;
  refetch: () => void;
};

export type FieldsQueryResponse = {
  fields: IField[];
  loading: boolean;
  refetch: () => Promise<void>;
};

export type FieldsGroupsQueryResponse = {
  fieldsGroups: IFieldGroup[];
  loading: boolean;
};

export type FieldsCombinedByType = {
  _id: string;
  name: string;
  label: string;
  brandName: string;
  brandId: string;
};

export type FieldsCombinedByTypeQueryResponse = {
  fieldsCombinedByContentType: FieldsCombinedByType[];
  loading: boolean;
  refetch: () => void;
};

export type AddFieldsMutationVariables = {
  contentType: string;
  contentTypeId: string;
  field: IField;
};

export type AddFieldsMutationResponse = {
  addFieldsMutation: (
    params: {
      variables: AddFieldsMutationVariables;
    }
  ) => void;
};

// mutation types
export type FieldsMutationVariables = {
  type: string;
  validation: string;
  text: string;
  description: string;
  options: any[];
  groupId: string;
};

export type FieldsGroupsMutationVariables = {
  name: string;
  description: string;
  isVisible: boolean;
};

export type FieldsGroupsRemoveMutationResponse = {
  fieldsGroupsRemove: (params: { variables: { _id: string } }) => Promise<any>;
};

export type FieldsRemoveMutationResponse = {
  fieldsRemove: (params: { variables: { _id: string } }) => Promise<any>;
};

export type FieldsGroupsUpdateVisibleMutationResponse = {
  fieldsGroupsUpdateVisible: (
    params: { variables: { _id: string; isVisible: boolean } }
  ) => Promise<any>;
};

export type FieldsUpdateVisibleMutationResponse = {
  fieldsUpdateVisible: (
    params: { variables: { _id: string; isVisible: boolean } }
  ) => Promise<any>;
};

export type FieldsAddMutationResponse = {
  fieldsAdd: (
    fieldsAdd: { variables: FieldsMutationVariables }
  ) => Promise<any>;
};

export type FieldsEditMutationResponse = {
  fieldsEdit: (
    fieldsEdit: { variables: FieldsMutationVariables }
  ) => Promise<any>;
};

export type FieldsGroupsAddMutationResponse = {
  fieldsGroupsAdd: (
    fieldsAdd: { variables: FieldsGroupsMutationVariables }
  ) => Promise<any>;
};

export type FieldsGroupsEditMutationResponse = {
  fieldsGroupsEdit: (
    fieldsEdit: { variables: FieldsGroupsMutationVariables }
  ) => Promise<any>;
};

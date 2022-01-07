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
};

export type FieldsCombinedByTypeQueryResponse = {
  fieldsCombinedByContentType: FieldsCombinedByType[];
} & QueryResponse;

export interface IBoardSelectItem {
  _id?: string;
  boardId: string;
  pipelineIds: string[];
}

export interface IFieldGroup {
  _id: string;
  name: string;
  contentType: string;
  order: React.ReactNode;
  description: string;
  isVisible: boolean;
  isVisibleInDetail: boolean;
  isDefinedByErxes: boolean;
  fields: IField[];
  lastUpdatedUserId: string;
  lastUpdatedUser: IUser;
  boardsPipelines?: IBoardSelectItem[];
}

// mutation types
export type FieldsMutationVariables = {
  type: string;
  validation: string;
  text: string;
  description: string;
  options: any[];
  groupId: string;
};

export type FieldsAddMutationResponse = {
  fieldsAdd: (fieldsAdd: {
    variables: FieldsMutationVariables;
  }) => Promise<any>;
};

export type FieldsEditMutationResponse = {
  fieldsEdit: (fieldsEdit: {
    variables: FieldsMutationVariables;
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

export interface IField {
  _id: string;
  key?: string;
  contentType: string;
  contentTypeId?: string;
  type: string;
  validation?: string;
  text?: string;
  content?: string;
  description?: string;
  options?: string[];
  isRequired?: boolean;
  order?: React.ReactNode;
  canHide?: boolean;
  isVisible?: boolean;
  isVisibleInDetail?: boolean;
  isDefinedByErxes?: boolean;
  groupId?: string;
  lastUpdatedUser?: IUser;
  lastUpdatedUserId?: string;
  associatedFieldId?: string;
  column?: number;
  associatedField?: {
    _id: string;
    text: string;
    contentType: string;
  };
  logics?: IFieldLogic[];
  logicAction?: string;
  groupName?: string;
  pageNumber?: number;
}

export interface IFieldLogic {
  fieldId?: string;
  tempFieldId?: string;
  logicOperator: string;
  logicValue: string;
  __typename?: string;
}

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
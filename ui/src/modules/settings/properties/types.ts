import { IUser } from 'modules/auth/types';
import { QueryResponse } from 'modules/common/types';

export interface IFieldLogic {
  fieldId?: string;
  tempFieldId?: string;
  logicOperator: string;
  logicValue: string;
  __typename?: string;
}
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

export interface IContentTypeFields {
  _id: string;
  name: string;
  label: string;
}

export interface IConfigColumn {
  _id: string;
  name: string;
  label: string;
  order: number;
  checked?: boolean;
}

// query types

export type DefaultColumnsConfigQueryResponse = {
  fieldsDefaultColumnsConfig: IConfigColumn[];
} & QueryResponse;

export type FieldsQueryResponse = {
  fields: IField[];
  loading: boolean;
  refetch: () => Promise<void>;
};

export type FieldsGroupsQueryResponse = {
  fieldsGroups: IFieldGroup[];
  loading: boolean;
  refetch: ({ contentType }: { contentType?: string }) => Promise<any>;
};

export type SystemFieldsGroupsQueryResponse = {
  getSystemFieldsGroup: IFieldGroup;
  loading: boolean;
  refetch: ({ contentType }: { contentType?: string }) => Promise<any>;
};

export type InboxFieldsQueryResponse = {
  fieldsInbox: {
    customer: IField[];
    device: IField[];
    conversation: IField[];
  };
  loading: boolean;
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
};

export type FieldsCombinedByTypeQueryResponse = {
  fieldsCombinedByContentType: FieldsCombinedByType[];
} & QueryResponse;

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
  isVisibleInDetail: boolean;
};

export type FieldsGroupsRemoveMutationResponse = {
  fieldsGroupsRemove: (params: { variables: { _id: string } }) => Promise<any>;
};

export type FieldsRemoveMutationResponse = {
  fieldsRemove: (params: { variables: { _id: string } }) => Promise<any>;
};

export type FieldsGroupsUpdateVisibleMutationResponse = {
  fieldsGroupsUpdateVisible: (params: {
    variables: { _id: string; isVisible: boolean };
  }) => Promise<any>;
};

export type FieldsUpdateVisibleMutationResponse = {
  fieldsUpdateVisible: (params: {
    variables: {
      _id: string;
      isVisible?: boolean;
      isVisibleInDetail?: boolean;
    };
  }) => Promise<any>;
};

export type FieldsUpdateOrderMutationVariables = {
  orders: {
    _id: string;
    order: number;
  };
};

export type FieldsUpdateOrderMutationResponse = {
  fieldsUpdateOrder: (params: {
    variables: FieldsUpdateOrderMutationVariables;
  }) => Promise<any>;
};

export type GroupsUpdateOrderMutationVariables = {
  orders: {
    _id: string;
    order: number;
  };
};

export type GroupsUpdateOrderMutationResponse = {
  groupsUpdateOrder: (params: {
    variables: GroupsUpdateOrderMutationVariables;
  }) => Promise<any>;
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

export type FieldsGroupsAddMutationResponse = {
  fieldsGroupsAdd: (fieldsAdd: {
    variables: FieldsGroupsMutationVariables;
  }) => Promise<any>;
};

export type FieldsGroupsEditMutationResponse = {
  fieldsGroupsEdit: (fieldsEdit: {
    variables: FieldsGroupsMutationVariables;
  }) => Promise<any>;
};

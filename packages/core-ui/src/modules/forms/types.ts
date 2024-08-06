export interface IContentTypeFields {
  _id: string;
  name: string;
  label: string;
}

// query types

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

// mutation types

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
      isVisibleToCreate?: boolean;
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

export type GroupsUpdateOrderMutationResponse = {
  groupsUpdateOrder: (params: {
    variables: FieldsUpdateOrderMutationVariables;
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

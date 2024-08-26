import { IFieldGroup } from "@erxes/ui-forms/src/settings/properties/types";
import { IField } from "@erxes/ui/src/types";

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
  fieldsGroupsRemove: (params: { variables: { _id: string } }) => Promise<JSON>;
};

export type FieldsRemoveMutationResponse = {
  fieldsRemove: (params: { variables: { _id: string } }) => Promise<IField>;
};

export type FieldsGroupsUpdateVisibleMutationResponse = {
  fieldsGroupsUpdateVisible: (params: {
    variables: { _id: string; isVisible: boolean };
  }) => Promise<IFieldGroup>;
};

export type FieldsUpdateVisibleMutationResponse = {
  fieldsUpdateVisible: (params: {
    variables: {
      _id: string;
      isVisible?: boolean;
      isVisibleInDetail?: boolean;
      isVisibleToCreate?: boolean;
    };
  }) => Promise<IField>;
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
  }) => Promise<IField[]>;
};

export type GroupsUpdateOrderMutationResponse = {
  groupsUpdateOrder: (params: {
    variables: FieldsUpdateOrderMutationVariables;
  }) => Promise<IFieldGroup[]>;
};

export type FieldsGroupsAddMutationResponse = {
  fieldsGroupsAdd: (fieldsAdd: {
    variables: FieldsGroupsMutationVariables;
  }) => Promise<IFieldGroup>;
};

export type FieldsGroupsEditMutationResponse = {
  fieldsGroupsEdit: (fieldsEdit: {
    variables: FieldsGroupsMutationVariables;
  }) => Promise<IFieldGroup>;
};

import { IConditionsRule } from "@erxes/ui/src/types";
import { IUser } from "../auth/types";
import { ITag } from "../tags/types";
import { IForm } from "@erxes/ui-forms/src/forms/types";
import { IAttachment } from "../common/types";

export interface IContentTypeFields {
  _id: string;
  name: string;
  label: string;
}

export interface ICallout {
  title?: string;
  body?: string;
  buttonText?: string;
  featuredImage?: string;
  imgSize?: string;
  skip?: boolean;
}

export interface ILeadData {
  loadType?: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string[];
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankTitle?: string;
  thankContent?: string;
  redirectUrl?: string;
  themeColor?: string;
  callout?: ICallout;
  rules?: IConditionsRule[];
  createdUserId?: string;
  createdUser?: IUser;
  createdDate?: Date;
  viewCount?: number;
  contactsGathered?: number;
  tagIds?: string[];
  getTags?: ITag[];
  form?: IForm;
  isRequireOnce?: boolean;
  saveAsCustomer?: boolean;
  clearCacheAfterSave?: boolean;
  templateId?: string;
  attachments?: IAttachment[];
  css?: string;
  conversionRate?: number;
  successImage?: string;
  successImageSize?: string;
  verifyEmail?: boolean;
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

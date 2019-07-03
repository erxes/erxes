import { IConditionsRule } from 'modules/common/types';
import { IUser } from '../auth/types';
import { IBrand } from '../settings/brands/types';
import { IIntegration } from '../settings/integrations/types';
import { IField } from '../settings/properties/types';
import { ITag } from '../tags/types';

export interface ICallout {
  title?: string;
  body?: string;
  buttonText?: string;
  featuredImage?: string;
  skip?: boolean;
}

export interface IForm {
  _id: string;
  title?: string;
  code?: string;
  description?: string;
  buttonText?: string;
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
}

export interface IFormIntegration extends IIntegration {
  brand: IBrand;
  form: IForm;
  tags: ITag[];
  createdUser: IUser;
}

// mutation types
export type AddFormMutationVariables = {
  title: string;
  description: string;
  buttonText: string;
  themeColor: string;
  callout: ICallout;
};

export type AddFormMutationResponse = {
  addFormMutation: (
    params: { variables: AddFormMutationVariables }
  ) => Promise<any>;
};

export type EditFormMutationVariables = {
  _id: string;
  title: string;
  description: string;
  buttonText: string;
  themeColor: string;
  callout: ICallout;
};

export type EditFormMutationResponse = {
  editFormMutation: (
    params: {
      variables: EditFormMutationVariables;
    }
  ) => Promise<any>;
};

export type RemoveMutationVariables = {
  _id: string;
};

export type RemoveMutationResponse = {
  removeMutation: (
    params: { variables: RemoveMutationVariables }
  ) => Promise<any>;
};

export type AddFieldMutationVariables = {
  createFieldsData: IField[];
};

export type AddFieldMutationResponse = {
  addFieldMutation: (
    params: {
      variables: AddFieldMutationVariables;
    }
  ) => Promise<void>;
};

export type EditFieldMutationVariables = {
  updateFieldsData: IField[];
};

export type EditFieldMutationResponse = {
  editFieldMutation: (
    params: {
      variables: EditFieldMutationVariables;
    }
  ) => Promise<void>;
};

export type RemoveFieldMutationVariables = {
  removeFieldsData: IField[];
};

export type RemoveFieldMutationResponse = {
  removeFieldMutation: (
    params: { variable: RemoveFieldMutationVariables }
  ) => Promise<void>;
};

// query types

export type FormIntegrationsQueryResponse = {
  integrations: IFormIntegration;
  loading: boolean;
  refetch: () => void;
};

export type Counts = {
  [key: string]: number;
};

export type IntegrationsCount = {
  total: number;
  byTag: Counts;
  byChannel: Counts;
  byBrand: Counts;
  byKind: Counts;
};

export type CountQueryResponse = {
  integrationsTotalCount: IntegrationsCount;
  loading: boolean;
  refetch: () => void;
};

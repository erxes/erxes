import { IConditionsRule } from 'modules/common/types';
import { IUser } from '../auth/types';
import { IForm } from '../forms/types';
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

export interface ILead {
  _id: string;
  formId: string;
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
}

export interface ILeadIntegration extends IIntegration {
  brand: IBrand;
  lead: ILead;
  tags: ITag[];
  createdUser: IUser;
}

// mutation types
export type AddLeadMutationVariables = {
  formId: string;
  themeColor?: string;
  callout?: ICallout;
  rules?: IConditionsRule[];
};

export type AddLeadMutationResponse = {
  addLeadMutation: (
    params: { variables: AddLeadMutationVariables }
  ) => Promise<any>;
};

export type EditLeadMutationVariables = {
  _id: string;
  formId: string;
  themeColor?: string;
  callout?: ICallout;
  rules?: IConditionsRule[];
};

export type EditLeadMutationResponse = {
  editLeadMutation: (
    params: {
      variables: EditLeadMutationVariables;
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

// query types
export type LeadIntegrationsQueryResponse = {
  integrations: ILeadIntegration;
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

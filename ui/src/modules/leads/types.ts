import {
  IAttachment,
  IConditionsRule,
  QueryResponse
} from 'modules/common/types';
import { IUser } from '../auth/types';
import { IForm } from '../forms/types';
import { IBrand } from '../settings/brands/types';
import { IIntegration } from '../settings/integrations/types';
import { ITag } from '../tags/types';

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
  templateId?: string;
  attachments?: IAttachment[];
  css?: string;
  conversionRate?: number;
}

export interface IWebhookData {
  script: string;
  scriptEnabled: boolean;
  token: string;
}

export interface ILeadIntegration extends IIntegration {
  brand: IBrand;
  tags: ITag[];
  createdUser: IUser;
}

export type RemoveMutationVariables = {
  _id: string;
};

export type RemoveMutationResponse = {
  removeMutation: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type CopyMutationResponse = {
  copyMutation: (params: { variables: { _id: string } }) => Promise<void>;
};

// query types
export type LeadIntegrationsQueryResponse = {
  integrations: ILeadIntegration[];
} & QueryResponse;

export type Counts = {
  [key: string]: number;
};

export type IntegrationsCount = {
  total: number;
  byTag: Counts;
  byChannel: Counts;
  byBrand: Counts;
  byKind: Counts;
  byStatus: Counts;
};

export type CountQueryResponse = {
  integrationsTotalCount: IntegrationsCount;
} & QueryResponse;

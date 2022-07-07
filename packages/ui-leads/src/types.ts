import {
  Counts,
  IAttachment,
  IConditionsRule,
  MutationVariables,
  QueryResponse
} from '@erxes/ui/src/types';

import { IBrand } from '@erxes/ui/src/brands/types';
import { IForm } from '@erxes/ui-forms/src/forms/types';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
import { ITag } from '@erxes/ui-tags/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

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
  templateId?: string;
  attachments?: IAttachment[];
  css?: string;
  conversionRate?: number;
  successImage?: string;
  successImageSize?: string;
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

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type CopyMutationResponse = {
  copyMutation: (params: { variables: { _id: string } }) => Promise<void>;
};

// query types
export type LeadIntegrationsQueryResponse = {
  integrations: ILeadIntegration[];
} & QueryResponse;

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

import { IBrand, QueryResponse } from 'types';
import { IAttachment, IConditionsRule } from '../types';
import { IUser } from '../auth/types';
import { ITag } from '../tags/types';

export interface IForm {
  _id: string;
  code?: string;
}

export interface ILeadIntegration {
  _id: string;
  name: string;
  code: string;
  kind: string;
  brand: IBrand;
  form: IForm;
}

export type LeadIntegrationsQueryResponse = {
  integrations: ILeadIntegration[];
} & QueryResponse;

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
  successImage?: string;
  successImageSize?: string;
}

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

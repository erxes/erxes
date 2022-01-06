import { QueryResponse } from "@erxes/ui/src/types";
import { IBrand } from "@erxes/ui/src/brands/types";
import { IAttachment, IConditionsRule } from "@erxes/ui/src/types";
import { IUser } from "@erxes/ui/src/auth/types";
import { ITag } from "@erxes/ui/src/tags/types";

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

export type LeadIntegrationsQueryResponse = {
  integrations: ILeadIntegration[];
} & QueryResponse;

export type CountQueryResponse = {
  integrationsTotalCount: IntegrationsCount;
} & QueryResponse;

export type TagCountQueryResponse = {
  [key: string]: number;
};

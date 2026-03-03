import { Document } from 'mongoose';
import { IAttachment } from 'erxes-api-shared/core-types';

export interface IAppearances {
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontSans?: string;
  fontHeading?: string;
  fontMono?: string;
}

export interface IIntegrations {
  googleAnalytics?: string;
  facebookPixel?: string;
  googleTagManager?: string;
  messengerBrandCode?: string;
}

export type EnvironmentVariable = {
  key: string;
  value: string;
};

export interface IWeb {
  clientPortalId: string;
  name: string;
  description?: string;
  keywords?: string[];
  domain?: string;
  copyright?: string;
  thumbnail?: IAttachment;
  logo?: IAttachment;
  favicon?: IAttachment;
  appearances?: IAppearances;
  // deploy fields
  templateId?: string;
  templateType?: string;
  erxesAppToken?: string;
  externalLinks?: Record<string, string>;
  integrations?: IIntegrations;
  environmentVariables?: EnvironmentVariable[];
}

export interface IWebDocument extends IWeb, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

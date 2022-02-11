import * as express from 'express';
import { Document, Schema } from 'mongoose';

import { IUserDocument } from '@erxes/common-types/src/users';

export interface IBrandEmailConfig {
  type?: string;
  template?: string;
}

interface IBrandEmailConfigDocument extends IBrandEmailConfig, Document {}

export interface IBrand {
  code?: string;
  name?: string;
  description?: string;
  userId?: string;
  emailConfig?: IBrandEmailConfig;
}

export interface IBrandDocument extends IBrand, Document {
  _id: string;
  emailConfig?: IBrandEmailConfigDocument;
  createdAt: Date;
}

export interface IContext {
  res: express.Response;
  requestInfo: any;
  user: IUserDocument;
  docModifier: <T>(doc: T) => any;
  brandIdSelector: {};
  userBrandIdsSelector: {};
  commonQuerySelector: {};
  commonQuerySelectorElk: {};
  singleBrandIdSelector: {};
  dataSources: {
    AutomationsAPI: any;
    EngagesAPI: any;
    IntegrationsAPI: any;
    HelpersApi: any;
  };
  dataLoaders: any;
}

export interface IColumnLabel {
  name: string;
  label: string;
}
export interface IFetchElkArgs {
  action: string;
  index: string;
  body: any;
  _id?: string;
  defaultValue?: any;
}

export interface IRule {
  kind: string;
  text: string;
  condition: string;
  value: string;
}

export interface ILink {
  [key: string]: string;
}

export interface IRuleDocument extends IRule, Document {
  _id: string;
}

// schema for form's rules
export const ruleSchema = new Schema(
  {
    _id: { type: String },

    // browserLanguage, currentUrl, etc ...
    kind: { type: String, label: 'Kind' },

    // Browser language, Current url etc ...
    text: { type: String, label: 'Text' },

    // is, isNot, startsWith
    condition: { type: String, label: 'Condition' },

    value: { type: String, label: 'Value', optional: true }
  },
  { _id: false }
);

export const customFieldSchema = new Schema(
  {
    field: { type: String },
    value: { type: Schema.Types.Mixed },
    stringValue: { type: String, optional: true },
    numberValue: { type: Number, optional: true },
    dateValue: { type: Date, optional: true }
  },
  { _id: false }
);

export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
}

export const attachmentSchema = new Schema(
  {
    name: { type: String },
    url: { type: String },
    type: { type: String },
    size: { type: Number, optional: true }
  },
  { _id: false }
);

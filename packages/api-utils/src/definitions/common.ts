import { Document, Schema } from 'mongoose';

import { field } from './utils';

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

export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
}

export const customFieldSchema = new Schema(
  {
    field: field({ type: String }),
    value: field({ type: Schema.Types.Mixed }),
    stringValue: field({ type: String, optional: true }),
    numberValue: field({ type: Number, optional: true }),
    dateValue: field({ type: Date, optional: true })
  },
  { _id: false }
);

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

// schema for form's rules
export const ruleSchema = new Schema(
  {
    _id: field({ type: String }),

    // browserLanguage, currentUrl, etc ...
    kind: field({ type: String, label: 'Kind' }),

    // Browser language, Current url etc ...
    text: field({ type: String, label: 'Text' }),

    // is, isNot, startsWith
    condition: field({ type: String, label: 'Condition' }),

    value: field({ type: String, label: 'Value', optional: true })
  },
  { _id: false }
);

export const attachmentSchema = new Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true }),
    duration: field({ type: Number, optional: true })
  },
  { _id: false }
);
import { Document, Schema } from 'mongoose';
import { field } from './utils';
export interface IRule {
  kind: string;
  text: string;
  condition: string;
  value: string;
}

export interface ILink {
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  github?: string;
  youtube?: string;
  website?: string;
}

export interface IRuleDocument extends IRule, Document {
  _id: string;
}

// schema for form's rules
const ruleSchema = new Schema(
  {
    _id: field({ type: String }),

    // browserLanguage, currentUrl, etc ...
    kind: field({ type: String, label: 'Kind' }),

    // Browser language, Current url etc ...
    text: field({ type: String, label: 'Text' }),

    // is, isNot, startsWith
    condition: field({ type: String, label: 'Condition' }),

    value: field({ type: String, label: 'Value' }),
  },
  { _id: false },
);

const linkSchema = new Schema(
  {
    linkedIn: field({ type: String, optional: true, label: 'LinkedIn' }),
    twitter: field({ type: String, optional: true, label: 'Twitter' }),
    facebook: field({ type: String, optional: true, label: 'Facebook' }),
    github: field({ type: String, optional: true, label: 'Github' }),
    youtube: field({ type: String, optional: true, label: 'Youtube' }),
    website: field({ type: String, optional: true, label: 'Website' }),
  },
  { _id: false },
);

export { linkSchema, ruleSchema };

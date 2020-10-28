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

    value: field({ type: String, label: 'Value' })
  },
  { _id: false }
);

const customFieldSchema = new Schema(
  {
    field: field({ type: String }),
    value: field({ type: Schema.Types.Mixed }),
    stringValue: field({ type: String, optional: true }),
    numberValue: field({ type: Number, optional: true }),
    dateValue: field({ type: Date, optional: true })
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

export { ruleSchema, customFieldSchema };

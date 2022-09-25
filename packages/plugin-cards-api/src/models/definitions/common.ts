import { Document, Schema } from 'mongoose';
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

const customFieldSchema = new Schema(
  {
    field: { type: String },
    value: { type: Schema.Types.Mixed },
    stringValue: { type: String, optional: true },
    numberValue: { type: Number, optional: true },
    dateValue: { type: Date, optional: true },
    locationValue: {
      type: {
        type: String,
        enum: ['Point'],
        optional: true
      },
      coordinates: {
        type: [Number],
        optional: true
      },
      required: false
    }
  },
  { _id: false }
);

customFieldSchema.index({ locationValue: '2dsphere' });

export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
}

export { ruleSchema, customFieldSchema };

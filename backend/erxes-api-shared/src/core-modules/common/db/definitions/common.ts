import { Schema } from 'mongoose';
import { mongooseField } from '../../../../utils';

export const customFieldSchema = new Schema(
  {
    field: mongooseField({ type: 'String' }),
    value: mongooseField({ type: Schema.Types.Mixed }),
    stringValue: mongooseField({ type: 'String', optional: true }),
    numberValue: mongooseField({ type: 'Number', optional: true }),
    dateValue: mongooseField({ type: 'Date', optional: true }),
  },
  { _id: false },
);

// schema for form's rules
export const ruleSchema = new Schema(
  {
    _id: mongooseField({ type: String }),

    // browserLanguage, currentUrl, etc ...
    kind: mongooseField({ type: String, label: 'Kind' }),

    // Browser language, Current url etc ...
    text: mongooseField({ type: String, label: 'Text' }),

    // is, isNot, startsWith
    condition: mongooseField({ type: String, label: 'Condition' }),

    value: mongooseField({ type: String, label: 'Value', optional: true }),
  },
  { _id: false },
);

export const attachmentSchema = new Schema(
  {
    name: mongooseField({ type: String }),
    url: mongooseField({ type: String }),
    type: mongooseField({ type: String }),
    size: mongooseField({ type: Number, optional: true }),
    duration: mongooseField({ type: Number, optional: true }),
  },
  { _id: false },
);

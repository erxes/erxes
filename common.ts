import { Document, Schema } from 'mongoose';
import { field } from '../utils';
export interface IRule extends Document {
  _id: string;
  kind: string;
  text: string;
  condition: string;
  value: string;
}

// schema for form's rules
const ruleSchema = new Schema(
  {
    _id: field({ type: String }),

    // browserLanguage, currentUrl, etc ...
    kind: field({ type: String }),

    // Browser language, Current url etc ...
    text: field({ type: String }),

    // is, isNot, startsWith
    condition: field({ type: String }),

    value: field({ type: String }),
  },
  { _id: false },
);

export { ruleSchema };

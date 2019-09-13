import { Document, Schema } from 'mongoose';
import { IRule, ruleSchema } from './common';
import { FORM_TYPES } from './constants';
import { calloutSchema, ICallout, ISubmission, submissionSchema } from './integrations';
import { field, schemaWrapper } from './utils';

export interface IForm {
  title: string;
  code?: string;
  type: string;
  description?: string;
  buttonText?: string;
}

export interface IFormDocument extends IForm, Document {
  _id: string;
  createdUserId: string;
  createdDate: Date;
  // TODO: remove
  contactsGathered?: number;
  // TODO: remove
  viewCount?: number;
  // TODO: remove
  submissions?: ISubmission[];
  // TODO: remove
  themeColor?: string;
  // TODO: remove
  callout?: ICallout;
  // TODO: remove
  rules?: IRule;
}

// schema for form document
export const formSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String, optional: true }),
    type: field({ type: String, enum: FORM_TYPES.ALL, required: true }),
    description: field({
      type: String,
      optional: true,
    }),
    buttonText: field({ type: String, optional: true }),
    code: field({ type: String }),
    createdUserId: field({ type: String }),
    createdDate: field({
      type: Date,
      default: Date.now,
    }),

    // TODO: remove
    themeColor: field({
      type: String,
      optional: true,
    }),
    // TODO: remove
    callout: field({
      type: calloutSchema,
      optional: true,
    }),
    // TODO: remove
    viewCount: field({
      type: Number,
      optional: true,
    }),
    // TODO: remove
    contactsGathered: field({
      type: Number,
      optional: true,
    }),
    // TODO: remove
    submissions: field({
      type: [submissionSchema],
      optional: true,
    }),
    // TODO: remove
    rules: field({
      type: [ruleSchema],
      optional: true,
    }),
  }),
);

export interface IFormSubmission {
  customerId?: string;
  contentType?: string;
  contentTypeId?: string;
  formId?: string;
  formFieldId?: string;
  value?: JSON;
  submittedAt?: Date;
}

export interface IFormSubmissionDocument extends IFormSubmission, Document {
  _id: string;
}

// schema for form submission document
export const formSubmissionSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    customerId: field({ type: String, optional: true }),
    contentType: field({ type: String, optional: true }),
    contentTypeId: field({ type: String, optional: true }),
    value: field({ type: Object, optional: true }),
    submittedAt: field({ type: Date, default: Date.now }),
    formId: field({ type: String, optional: true }),
    formFieldId: field({ type: String, optional: true }),
  }),
);

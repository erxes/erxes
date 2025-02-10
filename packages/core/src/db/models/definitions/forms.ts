import { Document, Schema, HydratedDocument } from 'mongoose';
import { field, schemaWrapper } from './utils';
import { IRule, ruleSchema } from '@erxes/api-utils/src/definitions/common';
import { IAttachment } from '@erxes/api-utils/src/types';
import { LEAD_LOAD_TYPES, LEAD_SUCCESS_ACTIONS } from './constants';

export interface IForm {
  _id: string;
  createdUserId: string;
  createdDate: Date;
  name: string;
  title: string;
  code?: string;
  type: string;
  description?: string;
  numberOfPages?: number;
  buttonText?: string;
  tagIds?: string[];

  departmentIds?: string[];
  languageCode?: string;
  visibility?: string;
  status?: string;
  brandId?: string;
  leadData?: ILeadData;
  integrationId?: string;
}

export interface IFormSubmissionFilter {
  operator: string;
  value: any;
  formFieldId: string;
}

export interface ICallout extends Document {
  title?: string;
  body?: string;
  buttonText?: string;
  featuredImage?: string;
  skip?: boolean;
  calloutImgSize?: string;
}

export interface ILeadData {
  loadType?: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string;
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankTitle?: string;
  thankContent?: string;
  redirectUrl?: string;
  themeColor?: string;
  callout?: ICallout;
  rules?: IRule;
  viewCount?: number;
  contactsGathered?: number;
  isRequireOnce?: boolean;
  saveAsCustomer?: boolean;
  clearCacheAfterSave?: boolean;
  templateId?: string;
  attachments?: IAttachment[];
  css?: string;
  successImage?: string;
  successImageSize?: string;
  verifyEmail?: boolean;
}

export interface ILeadDataDocument extends ILeadData, Document {
  viewCount?: number;
  contactsGathered?: number;
}

export type IFormDocument = HydratedDocument<IForm>;

export interface IFormSubmission {
  customerId?: string;
  userId?: string;
  contentType?: string;
  contentTypeId?: string;
  formId?: string;
  formFieldId?: string;
  value?: JSON;
  submittedAt?: Date;
  groupId?: string;
}

export interface IFormSubmissionDocument extends IFormSubmission, Document {
  _id: string;
}

// schema for form submission document
export const formSubmissionSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    customerId: field({ type: String, optional: true }),
    userId: field({ type: String, optional: true }),
    contentType: field({ type: String, optional: true }),
    contentTypeId: field({ type: String, optional: true }),
    value: field({ type: Object, optional: true }),
    submittedAt: field({ type: Date, default: Date.now }),
    formId: field({ type: String, optional: true }),
    formFieldId: field({ type: String, optional: true }),
    groupId: field({ type: String, optional: true }),
  })
);

export const calloutSchema = new Schema(
  {
    title: field({ type: String, optional: true, label: 'Title' }),
    body: field({ type: String, optional: true, label: 'Body' }),
    buttonText: field({ type: String, optional: true, label: 'Button text' }),
    calloutImgSize: field({
      type: String,
      optional: true,
      label: 'Callout image size',
    }),
    featuredImage: field({
      type: String,
      optional: true,
      label: 'Featured image',
    }),
    skip: field({ type: Boolean, optional: true, label: 'Skip' }),
  },
  { _id: false }
);

export const leadDataSchema = new Schema(
  {
    loadType: field({
      type: String,
      enum: LEAD_LOAD_TYPES.ALL,
      label: 'Load type',
    }),
    successAction: field({
      type: String,
      enum: LEAD_SUCCESS_ACTIONS.ALL,
      optional: true,
      label: 'Success action',
    }),
    fromEmail: field({
      type: String,
      optional: true,
      label: 'From email',
    }),
    userEmailTitle: field({
      type: String,
      optional: true,
      label: 'User email title',
    }),
    userEmailContent: field({
      type: String,
      optional: true,
      label: 'User email content',
    }),
    adminEmails: field({
      type: [String],
      optional: true,
      label: 'Admin emails',
    }),
    adminEmailTitle: field({
      type: String,
      optional: true,
      label: 'Admin email title',
    }),
    adminEmailContent: field({
      type: String,
      optional: true,
      label: 'Admin email content',
    }),
    thankTitle: field({
      type: String,
      optional: true,
      label: 'Thank content title',
    }),
    thankContent: field({
      type: String,
      optional: true,
      label: 'Thank content',
    }),
    redirectUrl: field({
      type: String,
      optional: true,
      label: 'Redirect URL',
    }),
    themeColor: field({
      type: String,
      optional: true,
      label: 'Theme color code',
    }),
    callout: field({
      type: calloutSchema,
      optional: true,
      label: 'Callout',
    }),
    viewCount: field({
      type: Number,
      optional: true,
      label: 'View count',
      default: 0,
    }),
    contactsGathered: field({
      type: Number,
      optional: true,
      label: 'Contacts gathered',
      default: 0,
    }),
    rules: field({
      type: [ruleSchema],
      optional: true,
      label: 'Rules',
    }),
    isRequireOnce: field({
      type: Boolean,
      optional: true,
      label: 'Do not show again if already filled out',
    }),
    saveAsCustomer: field({
      type: Boolean,
      optional: true,
      label: 'Save as customer',
    }),
    templateId: field({
      type: String,
      optional: true,
      label: 'Template',
    }),
    attachments: field({ type: Object, optional: true, label: 'Attachments' }),
    css: field({
      type: String,
      optional: true,
      label: 'Custom CSS',
    }),
    successImage: field({
      type: String,
      optional: true,
      label: 'Success image',
    }),
    successImageSize: field({
      type: String,
      optional: true,
      label: 'Success image size',
    }),
    verifyEmail: field({
      type: Boolean,
      optional: true,
      label: 'Verify email',
    }),
    clearCacheAfterSave: field({
      type: Boolean,
      optional: true,
      label: 'Clear cache after save',
    })
  },
  { _id: false }
);

// schema for form document
export const formSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, required: true }),
    title: field({ type: String, optional: true }),
    type: field({ type: String, required: true }),
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

    numberOfPages: field({
      type: Number,
      optional: true,
      min: 1,
    }),

    brandId: field({ type: String, optional: true, label: 'Brand' }),

    leadData: field({ type: leadDataSchema, label: 'Lead data' }),
    departmentIds: field({
      type: [String],
      optional: true,
      label: 'Departments',
    }),
    languageCode: field({ type: String, optional: true, label: 'Language' }),
    visibility: field({ type: String, optional: true, label: 'Visibility' }),
    tagIds: field({ type: [String], optional: true, label: 'Tags' }),
    status: field({
      type: String,
      optional: true,
      label: 'Status',
      enum: ['active', 'archived'],
      default: 'active',
    }),
    integrationId: field({
      type: String,
      optional: true,
      label: 'Integration',
    }),
  })
);

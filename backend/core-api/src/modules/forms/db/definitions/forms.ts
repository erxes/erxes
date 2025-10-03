import { Document, Schema, HydratedDocument } from 'mongoose';
// import { IRule, ruleSchema } from '@erxes/api-utils/src/definitions/common';
import { IAttachment } from '../../types';
import { LEAD_LOAD_TYPES, LEAD_SUCCESS_ACTIONS } from '../../constants';
import { IRule } from 'erxes-api-shared/core-types';
import { ruleSchema } from 'erxes-api-shared/core-modules';
import { schemaWrapper } from 'erxes-api-shared/utils';

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
    customerId: { type: String, optional: true },
    userId: { type: String, optional: true },
    contentType: { type: String, optional: true },
    contentTypeId: { type: String, optional: true },
    value: { type: Object, optional: true },
    submittedAt: { type: Date, default: Date.now },
    formId: { type: String, optional: true },
    formFieldId: { type: String, optional: true },
    groupId: { type: String, optional: true },
  }),
);

export const calloutSchema = new Schema(
  {
    title: { type: String, optional: true, label: 'Title' },
    body: { type: String, optional: true, label: 'Body' },
    buttonText: { type: String, optional: true, label: 'Button text' },
    calloutImgSize: {
      type: String,
      optional: true,
      label: 'Callout image size',
    },
    featuredImage: {
      type: String,
      optional: true,
      label: 'Featured image',
    },
    skip: { type: Boolean, optional: true, label: 'Skip' },
  },
  { _id: false },
);

export const leadDataSchema = new Schema(
  {
    loadType: {
      type: String,
      enum: LEAD_LOAD_TYPES.ALL,
      label: 'Load type',
    },
    successAction: {
      type: String,
      enum: LEAD_SUCCESS_ACTIONS.ALL,
      optional: true,
      label: 'Success action',
    },
    fromEmail: {
      type: String,
      optional: true,
      label: 'From email',
    },
    userEmailTitle: {
      type: String,
      optional: true,
      label: 'User email title',
    },
    userEmailContent: {
      type: String,
      optional: true,
      label: 'User email content',
    },
    adminEmails: {
      type: [String],
      optional: true,
      label: 'Admin emails',
    },
    adminEmailTitle: {
      type: String,
      optional: true,
      label: 'Admin email title',
    },
    adminEmailContent: {
      type: String,
      optional: true,
      label: 'Admin email content',
    },
    thankTitle: {
      type: String,
      optional: true,
      label: 'Thank content title',
    },
    thankContent: {
      type: String,
      optional: true,
      label: 'Thank content',
    },
    redirectUrl: {
      type: String,
      optional: true,
      label: 'Redirect URL',
    },
    themeColor: {
      type: String,
      optional: true,
      label: 'Theme color code',
    },
    callout: {
      type: calloutSchema,
      optional: true,
      label: 'Callout',
    },
    viewCount: {
      type: Number,
      optional: true,
      label: 'View count',
      default: 0,
    },
    contactsGathered: {
      type: Number,
      optional: true,
      label: 'Contacts gathered',
      default: 0,
    },
    rules: {
      type: [ruleSchema],
      optional: true,
      label: 'Rules',
    },
    isRequireOnce: {
      type: Boolean,
      optional: true,
      label: 'Do not show again if already filled out',
    },
    saveAsCustomer: {
      type: Boolean,
      optional: true,
      label: 'Save as customer',
    },
    templateId: {
      type: String,
      optional: true,
      label: 'Template',
    },
    attachments: { type: Object, optional: true, label: 'Attachments' },
    css: {
      type: String,
      optional: true,
      label: 'Custom CSS',
    },
    successImage: {
      type: String,
      optional: true,
      label: 'Success image',
    },
    successImageSize: {
      type: String,
      optional: true,
      label: 'Success image size',
    },
    verifyEmail: {
      type: Boolean,
      optional: true,
      label: 'Verify email',
    },
    clearCacheAfterSave: {
      type: Boolean,
      optional: true,
      label: 'Clear cache after save',
    },
  },
  { _id: false },
);

// schema for form document
export const formSchema = schemaWrapper(
  new Schema({
    name: { type: String, required: true },
    title: { type: String, optional: true },
    type: { type: String, required: true },
    description: {
      type: String,
      optional: true,
    },
    buttonText: { type: String, optional: true },
    code: { type: String },
    createdUserId: { type: String },
    createdDate: {
      type: Date,
      default: Date.now,
    },

    numberOfPages: {
      type: Number,
      optional: true,
      min: 1,
    },

    brandId: { type: String, optional: true, label: 'Brand' },

    leadData: { type: leadDataSchema, label: 'Lead data' },
    departmentIds: {
      type: [String],
      optional: true,
      label: 'Departments',
    },
    languageCode: { type: String, optional: true, label: 'Language' },
    visibility: { type: String, optional: true, label: 'Visibility' },
    tagIds: { type: [String], optional: true, label: 'Tags' },
    status: {
      type: String,
      optional: true,
      label: 'Status',
      enum: ['active', 'archived'],
      default: 'active',
    },
    integrationId: {
      type: String,
      optional: true,
      label: 'Integration',
    },
  }),
);

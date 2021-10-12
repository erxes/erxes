import { Document, Schema } from 'mongoose';
import { attachmentSchema } from './boards';
import { LEAD_SUCCESS_ACTIONS } from './constants';
import { IAttachment } from './integrations';

import { field } from './utils';

interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

export interface IStyle {
  itemShape?: string;
  widgetColor?: string;
  productAvailable?: string;
  productUnavailable?: string;
  productSelected?: string;

  textAvailable?: string;
  textUnavailable?: string;
  textSelected?: string;
}

export interface IStyleDocument extends IStyle, Document {}

export interface IDisplayBlock {
  shape?: string;
  columns?: number;
  rows?: number;
  margin?: number;
}

export interface IDisplayBlockDocument extends IDisplayBlock, Document {}

export interface IBooking {
  // content
  name?: string;
  image?: string[];
  description?: string;

  userFilters?: string[];
  productCategoryId: string;

  // style
  styles?: IStyle;

  // settings
  title?: string;
  brandId?: string;
  channelIds?: string[];
  languageCode?: string;
  formId?: string;

  tagIds?: string[];
  viewCount?: number;
  isActive?: boolean;
}

export interface IBookingDocument extends ICommonFields, IBooking, Document {
  _id: string;
  style?: IStyleDocument;
  displayBlock?: IDisplayBlockDocument;
}

export interface ILeadData {
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
  contactsGathered?: number;
  isRequireOnce?: boolean;
  templateId?: string;
  attachments?: IAttachment[];
}

// Mongoose schemas ==================

// Schema for common fields
const commonFields = {
  createdBy: field({ type: String, label: 'Created by' }),
  createdDate: field({ type: Date, label: 'Created at' }),
  modifiedBy: field({ type: String, label: 'Modified by' }),
  modifiedDate: field({ type: Date, label: 'Modified at' })
};

export const styleSchema = new Schema(
  {
    itemShape: field({ type: String, optional: true, label: 'Shape' }),
    widgetColor: field({ type: String, label: 'Widget color' }),

    productAvailable: field({ type: String, label: 'Product available' }),
    productUnavailable: field({ type: String, label: 'Product unavailable' }),
    productSelected: field({ type: String, label: 'Select Product' }),

    textAvailable: field({ type: String, label: 'Text available' }),
    textUnavailable: field({ type: String, label: 'Text unavailable' }),
    textSelected: field({ type: String, label: 'Select text' })
  },
  { _id: false }
);

export const displayBlockSchema = new Schema(
  {
    shape: field({ type: String, optional: true, label: 'Shape' }),
    columns: field({ type: String, optional: true, lable: 'Column' }),
    rows: field({ type: String, optional: true, label: 'Row' }),
    margin: field({ type: String, optional: true, label: 'Margin' })
  },
  { _id: false }
);

// subdocument schema for LeadData
export const leadDataSchema = new Schema(
  {
    successAction: field({
      type: String,
      enum: LEAD_SUCCESS_ACTIONS.ALL,
      optional: true,
      label: 'Success action'
    }),
    fromEmail: field({
      type: String,
      optional: true,
      label: 'From email'
    }),
    userEmailTitle: field({
      type: String,
      optional: true,
      label: 'User email title'
    }),
    userEmailContent: field({
      type: String,
      optional: true,
      label: 'User email content'
    }),
    adminEmails: field({
      type: [String],
      optional: true,
      label: 'Admin emails'
    }),
    adminEmailTitle: field({
      type: String,
      optional: true,
      label: 'Admin email title'
    }),
    adminEmailContent: field({
      type: String,
      optional: true,
      label: 'Admin email content'
    }),
    thankTitle: field({
      type: String,
      optional: true,
      label: 'Thank content title'
    }),
    thankContent: field({
      type: String,
      optional: true,
      label: 'Thank content'
    }),
    redirectUrl: field({
      type: String,
      optional: true,
      label: 'Redirect URL'
    }),
    themeColor: field({
      type: String,
      optional: true,
      label: 'Theme color code'
    }),
    isRequireOnce: field({
      type: Boolean,
      optional: true,
      label: 'Do now show again if already filled out'
    }),
    templateId: field({
      type: String,
      optional: true,
      label: 'Template'
    }),
    attachments: field({ type: Object, optional: true, label: 'Attachments' })
  },
  { _id: false }
);
export const bookingSchema = new Schema({
  _id: field({ pkey: true }),
  // styles
  styles: field({ type: styleSchema }),

  // content
  name: field({ type: String, optional: true, label: 'Name' }),
  image: field({ type: attachmentSchema }),
  description: field({ type: String, optional: true, label: 'Description' }),

  userFilters: field({ type: [String], optional: true, label: 'Filter' }),

  productCategoryId: field({
    type: String,
    optional: true,
    label: 'Product category'
  }),

  tagIds: field({ type: [String], optional: true, label: 'Tags' }),

  // settings
  title: field({ type: String, optional: true, label: 'Title' }),
  brandId: field({ type: String, optional: true, label: 'Brand' }),
  channelIds: field({ type: [String], optional: true, label: 'Channel' }),
  languageCode: field({ type: String, optional: true, label: 'Language' }),
  formId: field({ type: String, optional: true, label: 'Form' }),
  viewCount: field({ type: Number, optional: true, label: 'View count' }),
  isActive: field({
    type: Boolean,
    optional: true,
    default: true,
    label: 'Is active'
  }),

  displayBlock: field({ type: displayBlockSchema }),

  leadData: field({ type: leadDataSchema, label: 'Lead data' }),

  ...commonFields
});

import { Document, Schema } from 'mongoose';

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

export interface IBooking {
  // content
  name?: string;
  image?: string[];
  description?: string;
  userFilters?: string[];
  productCategoryId?: string;

  // style
  styles?: IStyle;

  // settings
  title?: string;
  brandId?: string;
  channelIds?: string[];
  languageCode?: string;
  formId?: string;
  buttonText?: string;

  tagIds?: string[];
}

export interface IBookingDocument extends ICommonFields, IBooking, Document {
  _id: string;
  style?: IStyleDocument;
}

// Mongoose schemas ==================

// Schema for common fields
const commonFields = {
  createdBy: field({ type: String, label: 'Created by' }),
  createdDate: field({ type: Date, label: 'Created at' }),
  modifiedBy: field({ type: String, label: 'Modified by' }),
  modifiedDate: field({ type: Date, label: 'Modified at' })
};

const attachmentSchema = new Schema(
  {
    url: field({ type: String, optional: true }),
    name: field({ type: String }),
    size: field({ type: Number }),
    type: field({ type: String })
  },
  { _id: false }
);

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
  buttonText: field({ type: String, optional: true, label: 'Button text' }),

  ...commonFields
});

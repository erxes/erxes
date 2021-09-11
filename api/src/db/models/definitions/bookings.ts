import { Document, Schema } from 'mongoose';
import { attachmentSchema } from './boards';

import { field } from './utils';

interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

export interface IBooking {
  name?: string;
  image?: string[];
  description?: string;
  userFilters?: string[];
  productCategoryId?: string;
}

export interface IBookingDocument extends ICommonFields, IBooking, Document {
  _id: string;
}

// Mongoose schemas ==================

// Schema for common fields
const commonFields = {
  createdBy: field({ type: String, label: 'Created by' }),
  createdDate: field({ type: Date, label: 'Created at' }),
  modifiedBy: field({ type: String, label: 'Modified by' }),
  modifiedDate: field({ type: Date, label: 'Modified at' }),
  title: field({ type: String, label: 'Title' })
};

export const bookingSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  image: field({ type: attachmentSchema }),
  description: field({ type: String, label: 'Description' }),

  userFilters: field({ type: [String], label: 'Filter' }),
  productCategoryId: field({ type: String, label: 'Product category' }),

  ...commonFields
});

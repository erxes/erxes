import { Document, Schema } from 'mongoose';
import { field } from './utils';

interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

export interface IBooking {
  size?: string;
  margin?: string;
  font?: string;
  color?: string;
  images?: string[];
}

export interface IBookingDocument extends ICommonFields, IBooking, Document {
  _id: string;
}

export interface ICard {
  parentId?: string;
  productId?: string;
  stage?: string;
  blockNum?: string;
  floor?: string;
  order?: string;
}

export interface ICardDocument extends ICommonFields, ICard, Document {
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
  size: field({ type: String, label: 'Size' }),
  margin: field({ type: String, label: 'Margin' }),
  font: field({ type: String, label: 'Font' }),
  color: field({ type: String, label: 'Color' }),
  ...commonFields
});

export const cardSchema = new Schema({
  _id: field({ pkey: true }),
  parentId: field({ type: String, label: 'Parent' }),
  productId: field({ type: String, label: 'Product' }),
  stage: field({ type: String, label: 'Stage' }),
  ...commonFields
});

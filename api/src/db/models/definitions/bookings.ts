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

export interface IFloor {
  bookingId?: string;
  margin?: string;
  blockNumber?: string;
  floorNumber?: string;
  cardColor?: string;
  activeCard?: string;
  cardShape?: string;
}

export interface IFloorDocument extends ICommonFields, IFloor, Document {
  _id: string;
}

export interface ICard {
  floorId?: string;
  productId?: string;
  stage?: string;
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
  name: field({ type: String, label: 'Name' }),
  image: field({ type: attachmentSchema }),
  description: field({ type: String, label: 'Description' }),

  userFilters: field({ type: [String], label: 'Filter' }),
  productCategoryId: field({ type: String, label: 'Product category' }),

  ...commonFields
});

export const floorSchema = new Schema({
  _id: field({ pkey: true }),
  bookingId: field({ type: String, label: 'Booking' }),
  margin: field({ type: String, label: 'Margin' }),
  blockNumber: field({ type: Number, label: 'Block' }),
  floorNumber: field({ type: Number, label: 'Floor' }),
  cardColor: field({ type: String, label: 'Card color' }),
  activeCard: field({ type: String, label: 'Active card' }),
  cardShape: field({ type: String, label: 'Card shape' }),
  ...commonFields
});

export const cardSchema = new Schema({
  _id: field({ pkey: true }),
  floorId: field({ type: String, label: 'Parent' }),
  productId: field({ type: String, label: 'Product' }),
  stage: field({ type: String, label: 'Stage' }),
  order: field({ type: String, label: 'Order' }),
  ...commonFields
});

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
  images?: string[];
  font?: string;
  fontColor?: string;
  columnColor?: string;
  activeColumn?: string;
  rowColor?: string;
  activeRow?: string;
  columnShape?: string;
  rowShape?: string;
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
  size: field({ type: String, label: 'Size' }),
  images: field({ type: [String], label: 'Images' }),
  font: field({ type: String, label: 'Font' }),
  fontColor: field({ type: String, label: 'Font color' }),
  columnColor: field({ type: String, label: 'Column color' }),
  activeColumn: field({ type: String, label: 'Active column' }),
  rowColor: field({ type: String, label: 'Row color' }),
  activeRow: field({ type: String, label: 'Active row' }),
  columnShape: field({ type: String, label: 'Column Shape' }),
  rowShape: field({ type: String, label: 'Row Shape' }),
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

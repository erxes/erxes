import { stringRandomId } from '@erxes/api-utils/src/mongoose-types';
import { Document, Schema } from 'mongoose';

export interface IAddress {
  alias: string;
  customerId: string;
  coordinate: {
    lat: number;
    lng: number;
  };
  address1: string;
  address2: string;
  city: string;
  district: string;
  street: string;
  detail: string;
  more: Record<string, any>;
  w3w: string;
  note: string;
  phone: string;
}

export interface IAddressDocument extends IAddress, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

const CoordinateSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

export const addressSchema = new Schema(
  {
    _id: stringRandomId,
    alias: { type: String, label: 'Known by', index: true },
    customerId: { type: String, label: 'CustomerId', index: true },
    coordinate: {
      type: CoordinateSchema,
      label: 'Coordinate',
    },
    address1: { type: String, label: 'Address 1' },
    address2: { type: String, label: 'Address 2' },
    city: { type: String, label: 'City' },
    district: { type: String, label: 'District' },
    street: { type: String, label: 'Street' },
    detail: { type: String, label: 'Detail' },
    more: { type: Schema.Types.Mixed, label: 'More' },
    w3w: { type: String, label: 'W3W' },
    note: { type: String, label: 'Note' },
    phone: { type: String, label: 'Phone' },
    createdAt: { type: Date, label: 'createdAt' },
    updatedAt: { type: Date, label: 'updatedAt' },
  },
  { timestamps: true },
);

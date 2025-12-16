import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';


const CoordinateSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

export const addressSchema = new Schema(
  {
    _id: mongooseStringRandomId,
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

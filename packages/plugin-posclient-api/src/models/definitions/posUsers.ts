import { Document, Schema } from 'mongoose';
import { IPosUserModel } from '../PosUsers';
import { field, getDateFieldDefinition } from './utils';

interface IDetail {
  avatar?: string;
  fullName?: string;
  shortName?: string;
  position?: string;
  birthDate?: Date;
  workStartedDate?: Date;
  location?: string;
  description?: string;
  operatorPhone?: string;
}

export interface IPosUser {
  createdAt?: Date;
  username?: string;
  password: string;
  isOwner?: boolean;
  email?: string;
  isActive?: boolean;
  details?: IDetail;
}

export interface IPosUserDocument extends IPosUser, Document {
  _id: string;
}

const detailSchema = new Schema(
  {
    avatar: field({ type: String, optional: true, label: 'Avatar' }),
    shortName: field({ type: String, optional: true, label: 'Short name' }),
    fullName: field({ type: String, optional: true, label: 'Full name' }),
    birthDate: field({ type: Date, optional: true, label: 'Birth date' }),
    workStartedDate: field({
      type: Date,
      optional: true,
      label: 'Date to joined to work'
    }),
    position: field({ type: String, optional: true, label: 'Position' }),
    location: field({ type: String, optional: true, label: 'Location' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    operatorPhone: field({
      type: String,
      optional: true,
      label: 'Operator phone'
    })
  },
  { _id: false }
);

// User schema
export const posUserSchema = new Schema({
  _id: field({ pkey: true }),
  createdAt: getDateFieldDefinition('Created at'),
  username: field({ type: String, label: 'Username' }),
  password: field({ type: String }),
  isOwner: field({ type: Boolean, label: 'Is owner', default: false }),
  email: field({
    type: String,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/,
      'Please fill a valid email address'
    ],
    label: 'Email'
  }),
  isActive: field({ type: Boolean, default: true, label: 'Is active' }),
  details: field({ type: detailSchema, default: {}, label: 'Details' })
});

import { Document, Schema } from 'mongoose';
import { ILogModel } from './Logs';
import { USER_LOGIN_TYPES } from '../util';

export interface IUser {
  createdAt?: Date;
  password: string;
  email?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  registrationToken?: string;
  registrationTokenExpires?: Date;
  firstName: string;
  lastName: string;
  phone?: string;
  type?: string;
  companyName: string;
  companyRegistrationNumber?: number;
  deviceTokens?: string[];
  erxesCustomerId: string;
  erxesCompanyId: string;
}

export interface IUserDocument extends IUser, Document {
  _id: string;
}

export const userSchema = new Schema({
  type: {
    type: String,
    enum: USER_LOGIN_TYPES.ALL,
    default: USER_LOGIN_TYPES.CUSTOMER
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  email: {
    type: String,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/,
      'Please fill a valid email address'
    ],
    label: 'Email'
  },
  password: { type: String },

  firstName: { type: String, optional: true },
  phone: { type: String, optional: true },
  lastName: { type: String, optional: true },
  resetPasswordToken: { type: String, optional: true },
  registrationToken: { type: String, optional: true },
  registrationTokenExpires: { type: Date, optional: true },
  resetPasswordExpires: { type: Date, optional: true },
  companyName: { type: String, optional: true },
  companyRegistrationNumber: { type: Number, optional: true },
  erxesCustomerId: { type: String, optional: true },
  erxesCompanyId: { type: String, optional: true },
  verificationCode: { type: String, optional: true },
  verificationCodeExpires: { type: Date, optional: true },
  deviceTokens: {
    type: [String],
    default: [],
    label: 'Device tokens'
  }
});

export interface ILog {
  type: string;
  typeId: string;
  text: string;
  description?: string;
}

export interface ILogDocument extends ILog, Document {
  _id: string;
}

export const logSchema = new Schema({
  type: { type: String },
  typeId: { type: String },
  description: { type: String, optional: true },
  text: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

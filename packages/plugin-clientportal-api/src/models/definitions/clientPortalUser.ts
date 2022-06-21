import { Document, Schema } from 'mongoose';
import { USER_LOGIN_TYPES } from './constants';
import { field } from './utils';

export interface IUser {
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  code?: string;
  password?: string;
  type?: string;
  deviceTokens?: string[];
  clientPortalId: string;
  erxesCustomerId: string;
  createdAt?: Date;
  modifiedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  registrationToken?: string;
  registrationTokenExpires?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: string;
  phoneVerificationCode: string;
  phoneVerificationCodeExpires: Date;
  emailVerificationCode: string;
  emailVerificationCodeExpires: Date;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
}

export const clientPortalUserSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({
    type: String,
    enum: USER_LOGIN_TYPES.ALL,
    default: USER_LOGIN_TYPES.CUSTOMER
  }),
  email: field({
    type: String,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/,
      'Please fill a valid email address'
    ],
    label: 'Email',
    optional: true
  }),
  phone: field({ type: String, unique: true, optional: true }),
  username: field({ type: String, optional: true, unique: true }),
  code: field({ type: String, optional: true }),
  password: field({ type: String }),
  firstName: field({ type: String, optional: true }),
  lastName: field({ type: String, optional: true }),
  clientPortalId: field({ type: String, required: true }),

  erxesCustomerId: field({ type: String, optional: true }),
  phoneVerificationCode: field({ type: String, optional: true }),
  phoneVerificationCodeExpires: field({ type: Date, optional: true }),
  emailVerificationCode: field({ type: String, optional: true }),
  emailVerificationCodeExpires: field({ type: Date, optional: true }),
  isPhoneVerified: field({
    type: Boolean,
    optional: true,
    default: false
  }),
  isEmailVerified: field({
    type: Boolean,
    optional: true,
    default: false
  }),
  deviceTokens: field({
    type: [String],
    default: [],
    label: 'Device tokens'
  }),
  createdAt: field({
    type: Date,
    default: Date.now
  }),
  modifiedAt: field({ type: Date, label: 'Modified at' }),

  resetPasswordToken: field({ type: String, optional: true }),
  resetPasswordExpires: field({ type: Date, optional: true }),

  registrationToken: field({ type: String }),
  registrationTokenExpires: field({ type: Date })
});

clientPortalUserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 24 * 60 * 60,
    partialFilterExpression: {
      $and: [{ isPhoneVerified: false }, { isEmailVerified: false }]
    }
  }
);

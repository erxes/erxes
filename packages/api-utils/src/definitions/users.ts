import { Document, Schema } from 'mongoose';
import {
  customFieldSchema,
  ICustomField,
  ILink
} from '@erxes/api-utils/src/types';
import { IPermissionDocument } from './permissions';
import { field, schemaWrapper } from './utils';
import { USER_ROLES } from '../constants';

export interface IEmailSignature {
  brandId?: string;
  signature?: string;
}

export interface IEmailSignatureDocument extends IEmailSignature, Document {}

export interface IDetail {
  avatar?: string;
  fullName?: string;
  shortName?: string;
  position?: string;
  birthDate?: Date;
  workStartedDate?: Date;
  location?: string;
  description?: string;
  operatorPhone?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

export interface IDetailDocument extends IDetail, Document {}

export interface IUser {
  createdAt?: Date;
  username?: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  registrationToken?: string;
  registrationTokenExpires?: Date;
  isOwner?: boolean;
  email?: string;
  getNotificationByEmail?: boolean;
  emailSignatures?: IEmailSignature[];
  starredConversationIds?: string[];
  details?: IDetail;
  links?: ILink;
  isActive?: boolean;
  brandIds?: string[];
  groupIds?: string[];
  deviceTokens?: string[];
  code?: string;
  doNotDisturb?: string;
  isSubscribed?: string;
  sessionCode?: string;
  isShowNotification?: boolean;
  score?: number;
  customFieldsData?: ICustomField[];
}

export interface IUserDocument extends IUser, Document {
  _id: string;
  emailSignatures?: IEmailSignatureDocument[];
  details?: IDetailDocument;
  customPermissions?: IPermissionDocument[];
  role?: string;
  appId?: string;
}

// Mongoose schemas ===============================
const emailSignatureSchema = new Schema(
  {
    brandId: field({ type: String, label: 'Brand' }),
    signature: field({ type: String, label: 'Signature' })
  },
  { _id: false }
);

// Detail schema
const detailSchema = new Schema(
  {
    avatar: field({ type: String, label: 'Avatar' }),
    shortName: field({ type: String, optional: true, label: 'Short name' }),
    fullName: field({ type: String, label: 'Full name' }),
    birthDate: field({ type: Date, label: 'Birth date' }),
    workStartedDate: field({ type: Date, label: 'Date to joined to work' }),
    position: field({ type: String, label: 'Position' }),
    location: field({ type: String, optional: true, label: 'Location' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    operatorPhone: field({
      type: String,
      optional: true,
      label: 'Operator phone'
    }),
    firstName: field({ type: String, label: 'First name' }),
    middleName: field({ type: String, label: 'Middle name' }),
    lastName: field({ type: String, label: 'Last name' })
  },
  { _id: false }
);

// User schema
export const userSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({
      type: Date,
      default: Date.now,
      label: 'Created at'
    }),
    username: field({ type: String, label: 'Username' }),
    password: field({ type: String }),
    resetPasswordToken: field({ type: String }),
    registrationToken: field({ type: String }),
    registrationTokenExpires: field({ type: Date }),
    resetPasswordExpires: field({ type: Date }),
    isOwner: field({ type: Boolean, label: 'Is owner' }),
    email: field({
      type: String,
      unique: true,
      match: [
        /**
         * RFC 5322 compliant regex. Taken from http://emailregex.com/
         */
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please fill a valid email address'
      ],
      label: 'Email'
    }),
    getNotificationByEmail: field({
      type: Boolean,
      label: 'Get notification by email'
    }),
    emailSignatures: field({
      type: [emailSignatureSchema],
      label: 'Email signatures'
    }),
    starredConversationIds: field({
      type: [String],
      label: 'Starred conversations'
    }),
    details: field({ type: detailSchema, default: {}, label: 'Details' }),
    links: field({ type: Object, default: {}, label: 'Links' }),
    isActive: field({ type: Boolean, default: true, label: 'Is active' }),
    brandIds: field({ type: [String], label: 'Brands' }),
    groupIds: field({ type: [String], label: 'Groups' }),
    deviceTokens: field({
      type: [String],
      default: [],
      label: 'Device tokens'
    }),
    code: field({ type: String }),
    doNotDisturb: field({
      type: String,
      optional: true,
      default: 'No',
      label: 'Do not disturb'
    }),
    isSubscribed: field({
      type: String,
      optional: true,
      default: 'Yes',
      label: 'Subscribed'
    }),
    isShowNotification: field({
      type: Boolean,
      optional: true,
      default: false,
      label: 'Check if user shows'
    }),
    score: field({
      type: Number,
      optional: true,
      label: 'Score',
      esType: 'number',
      default: 0
    }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data'
    }),
    role: field({
      type: String,
      label: 'User role',
      optional: true,
      default: USER_ROLES.USER,
      enum: USER_ROLES.ALL
    }),
    appId: field({
      type: String,
      label: 'Linked app id',
      optional: true
    })
  })
);

import { Document, Schema } from 'mongoose';
import { ILink } from './common';
import { IPermissionDocument } from './permissions';
import { field, schemaHooksWrapper } from './utils';

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
  location?: string;
  description?: string;
  operatorPhone?: string;
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
}

export interface IUserDocument extends IUser, Document {
  _id: string;
  emailSignatures?: IEmailSignatureDocument[];
  details?: IDetailDocument;
  customPermissions?: IPermissionDocument[];
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
    position: field({ type: String, label: 'Position' }),
    location: field({ type: String, optional: true, label: 'Location' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    operatorPhone: field({
      type: String,
      optional: true,
      label: 'Company phone'
    })
  },
  { _id: false }
);

// User schema
export const userSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({
      type: Date,
      default: Date.now
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
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/,
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
    })
  }),
  'erxes_users'
);

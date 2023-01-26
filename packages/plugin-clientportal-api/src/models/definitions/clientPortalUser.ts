import { Document, Schema } from 'mongoose';

import { USER_LOGIN_TYPES } from './constants';
import { field } from './utils';

export interface INotificationConfig {
  notifType: string;
  label: string;
  isAllowed: boolean;
}

export interface INotifcationSettings {
  receiveByEmail: boolean;
  receiveBySms: boolean;
  configs: INotificationConfig[];
}

export interface IUser {
  email?: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
  code?: string;
  password?: string;
  type?: string;
  deviceTokens?: string[];
  clientPortalId: string;
  erxesCustomerId?: string;
  erxesCompanyId?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  registrationToken?: string;
  registrationTokenExpires?: Date;
  isOnline: boolean;
  lastSeenAt: Date;
  sessionCount: number;
  notificationSettings: INotifcationSettings;
  avatar?: string;
  customFieldsData?: any;
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

export const notificationConfigSchema = new Schema(
  {
    notifType: field({
      type: String
    }),
    isAllowed: field({
      type: Boolean,
      default: true
    }),
    label: field({
      type: String
    })
  },
  { _id: false }
);

export const notificationSettingsSchema = new Schema(
  {
    receiveByEmail: field({
      type: Boolean,
      default: false
    }),
    receiveBySms: field({
      type: Boolean,
      default: false
    }),

    // notification configs
    configs: field({
      type: [notificationConfigSchema],
      default: []
    })
  },
  { _id: false }
);

const customFieldSchema = new Schema(
  {
    field: { type: String },
    value: { type: Schema.Types.Mixed },
    stringValue: { type: String, optional: true },
    numberValue: { type: Number, optional: true },
    dateValue: { type: Date, optional: true },
    locationValue: {
      type: {
        type: String,
        enum: ['Point'],
        optional: true
      },
      coordinates: {
        type: [Number],
        optional: true
      },
      required: false
    }
  },
  { _id: false }
);
customFieldSchema.index({ locationValue: '2dsphere' });

export const clientPortalUserSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({
    type: String,
    enum: USER_LOGIN_TYPES.ALL,
    default: USER_LOGIN_TYPES.CUSTOMER
  }),
  email: field({
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/,
      'Please fill a valid email address'
    ],
    label: 'Email',
    optional: true,
    sparse: true
  }),
  phone: field({ type: String, optional: true, sparse: true }),
  username: field({
    type: String,
    optional: true,
    unique: true,
    sparse: true
  }),
  code: field({ type: String, optional: true }),
  password: field({ type: String }),
  firstName: field({
    type: String,
    optional: true,
    label: 'First name'
  }),
  lastName: field({ type: String, optional: true, label: 'Last name' }),
  companyName: field({
    type: String,
    optional: true,
    label: 'Company name'
  }),
  companyRegistrationNumber: field({
    type: String,
    optional: true,
    label: 'Company registration number'
  }),
  clientPortalId: field({ type: String, required: true }),

  erxesCompanyId: field({ type: String, optional: true }),
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
    default: Date.now,
    label: 'Registered at'
  }),
  modifiedAt: field({ type: Date }),

  resetPasswordToken: field({ type: String, optional: true }),
  resetPasswordExpires: field({ type: Date, optional: true }),

  registrationToken: field({ type: String }),
  registrationTokenExpires: field({ type: Date }),
  isOnline: field({
    type: Boolean,
    label: 'Is online',
    optional: true
  }),
  lastSeenAt: field({
    type: Date,
    label: 'Last seen at',
    optional: true
  }),
  sessionCount: field({
    type: Number,
    label: 'Session count',
    optional: true
  }),

  // notification settings
  notificationSettings: field({
    type: notificationSettingsSchema,
    default: {}
  }),
  avatar: field({ type: String, label: 'Avatar' }),

  customFieldsData: field({
    type: [customFieldSchema],
    optional: true,
    label: 'Custom fields data'
  })
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

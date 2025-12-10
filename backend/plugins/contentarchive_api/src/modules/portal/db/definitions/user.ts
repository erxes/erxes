import { Schema } from 'mongoose';
import { USER_LOGIN_TYPES } from '@/portal/constants';
import { customFieldSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const notificationConfigSchema = new Schema(
  {
    notifType: {
      type: String,
    },
    isAllowed: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
    },
  },
  { _id: false },
);

export const twoFactor = new Schema(
  {
    device: {
      type: String,
    },
    key: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
      label: 'login at',
    },
  },
  { _id: false },
);

export const notificationSettingsSchema = new Schema(
  {
    receiveByEmail: {
      type: Boolean,
      default: false,
    },
    receiveBySms: {
      type: Boolean,
      default: false,
    },

    // notification configs
    configs: {
      type: [notificationConfigSchema],
      default: [],
    },
  },
  { _id: false },
);

export const userSchema = new Schema({
  _id: mongooseStringRandomId,
  type: {
    type: String,
    enum: USER_LOGIN_TYPES.ALL,
    default: USER_LOGIN_TYPES.CUSTOMER,
  },
  email: {
    type: String,
    match: [
      /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,10})+$/,
      'Please fill a valid email address',
    ],
    label: 'Email',
    optional: true,
    sparse: true,
  },
  phone: { type: String, optional: true, sparse: true },
  username: {
    type: String,
    optional: true,
    unique: true,
    sparse: true,
  },
  code: { type: String, optional: true },
  password: { type: String },
  firstName: {
    type: String,
    optional: true,
    label: 'First name',
  },
  secondaryPassword: { type: String, optional: true },
  lastName: { type: String, optional: true, label: 'Last name' },
  companyName: {
    type: String,
    optional: true,
    label: 'Company name',
  },
  companyRegistrationNumber: {
    type: String,
    optional: true,
    label: 'Company registration number',
  },
  clientPortalId: { type: String, required: true },
  erxesCompanyId: { type: String, optional: true },
  erxesCustomerId: { type: String, optional: true },
  phoneVerificationCode: { type: String, optional: true },
  phoneVerificationCodeExpires: { type: Date, optional: true },
  emailVerificationCode: { type: String, optional: true },
  emailVerificationCodeExpires: { type: Date, optional: true },
  isPhoneVerified: {
    type: Boolean,
    optional: true,
    default: false,
  },
  isEmailVerified: {
    type: Boolean,
    optional: true,
    default: false,
  },
  deviceTokens: {
    type: [String],
    default: [],
    label: 'Device tokens',
  },
  twoFactorDevices: { type: [twoFactor], default: [] },
  createdAt: {
    type: Date,
    default: Date.now,
    label: 'Registered at',
  },
  modifiedAt: { type: Date },

  resetPasswordToken: { type: String, optional: true },
  resetPasswordExpires: { type: Date, optional: true },

  registrationToken: { type: String },
  registrationTokenExpires: { type: Date },
  isOnline: {
    type: Boolean,
    label: 'Is online',
    optional: true,
  },
  lastSeenAt: {
    type: Date,
    label: 'Last seen at',
    optional: true,
  },
  sessionCount: {
    type: Number,
    label: 'Session count',
    optional: true,
  },

  // notification settings
  notificationSettings: {
    type: notificationSettingsSchema,
    default: {},
  },
  avatar: { type: String, label: 'Avatar' },

  // manual verification
  verificationRequest: {
    type: {
      status: { type: String, default: 'notVerified' },
      attachments: { type: Object, optional: false },
      description: { type: String, optional: true },
      verifiedBy: { type: String, optional: true },
    },
    optional: true,
  },

  customFieldsData: {
    type: [customFieldSchema],
    optional: true,
    label: 'Custom fields data',
  },
  facebookId: { type: String },
  googleId: { type: String },
});

userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 24 * 60 * 60,
    partialFilterExpression: {
      $and: [{ isPhoneVerified: false }, { isEmailVerified: false }],
    },
  },
);

import { Schema } from 'mongoose';

import { mongooseStringRandomId } from '../../../utils';
export const cpNotificationConfigUserSchema = new Schema(
  {
    notificationType: {
      type: String,
      required: true,
    },
    isAllowed: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

export const cpTwoFactor = new Schema(
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

export const cpNotificationSettingsSchema = new Schema(
  {
    receiveByEmail: {
      type: Boolean,
      required: true,
    },
    receiveBySms: {
      type: Boolean,
      required: true,
    },
    configs: {
      type: [cpNotificationConfigUserSchema],
      required: true,
    },
  },
  { _id: false },
);

export const refreshTokenSchema = new Schema(
  {
    token: { type: String, required: true },
    deviceId: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false },
);

export const socialAuthProviderSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ['GOOGLE', 'FACEBOOK', 'APPLE'],
      required: true,
    },
    providerId: { type: String, required: true },
    email: { type: String },
    linkedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

export const fcmDeviceSchema = new Schema(
  {
    deviceId: { type: String, required: true },
    token: { type: String, required: true },
    platform: {
      type: String,
      required: true,
      enum: ['ios', 'android', 'web'],
    },
  },
  { _id: false },
);

const actionCodeSchema = new Schema(
  {
    code: { type: String, required: true },
    expires: { type: Date, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'EMAIL_VERIFICATION',
        'PHONE_VERIFICATION',
        'PASSWORD_RESET',
        'TWO_FACTOR_VERIFICATION',
        'EMAIL_CHANGE',
        'PHONE_CHANGE',
      ],
    },
  },
  { _id: false },
);

const verificationRequestSchema = new Schema(
  {
    status: { type: String, required: true },
    attachments: { type: [Object], required: true },
    description: { type: String },
    verifiedBy: { type: String },
  },
  { _id: false },
);

export const cpUserSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    type: {
      type: String,
      enum: ['customer', 'company'],
      default: 'customer',
    },
    email: {
      type: String,
      match: [
        /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,10})+$/,
        'Please fill a valid email address',
      ],
      label: 'Email',
      sparse: true,
    },
    phone: { type: String, sparse: true },
    pendingEmail: { type: String },
    pendingPhone: { type: String },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    code: { type: String },
    password: { type: String },
    firstName: {
      type: String,
      label: 'First name',
    },
    lastName: { type: String, label: 'Last name' },
    avatar: { type: String, label: 'Avatar' },

    companyName: {
      type: String,
      label: 'Company name',
    },
    companyRegistrationNumber: {
      type: String,
      label: 'Company registration number',
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    clientPortalId: { type: String, required: true },
    erxesCompanyId: { type: String },
    erxesCustomerId: { type: String },
    isPhoneVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    fcmTokens: {
      type: [fcmDeviceSchema],
      default: [],
    },
    actionCode: {
      type: actionCodeSchema,
    },
    customFieldsData: { type: Object },

    // manual verification
    verificationRequest: {
      type: verificationRequestSchema,
    },

    // Refresh tokens for token management
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
    },

    // Social auth providers for account linking
    socialAuthProviders: {
      type: [socialAuthProviderSchema],
      default: [],
    },

    // Security and tracking fields
    failedLoginAttempts: { type: Number },
    accountLockedUntil: { type: Date },
    lastLoginAt: { type: Date },
    primaryAuthMethod: {
      type: String,
      enum: ['email', 'phone', 'social'],
    },
    otpResendAttempts: { type: Number },
    otpResendLastAttempt: { type: Date },
  },
  { timestamps: true },
);
cpUserSchema.index({ clientPortalId: 1 });
cpUserSchema.index({ email: 1 });
cpUserSchema.index({ phone: 1 });
cpUserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 24 * 60 * 60,
    partialFilterExpression: {
      $and: [{ isPhoneVerified: false }, { isEmailVerified: false }],
    },
  },
);

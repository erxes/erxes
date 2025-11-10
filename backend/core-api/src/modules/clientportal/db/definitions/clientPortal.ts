import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

const otpConfigSchema = new Schema(
  {
    content: { type: String, optional: true },
    codeLength: { type: Number, default: 4, min: 4 },
    loginWithOTP: { type: Boolean, default: false },
    expireAfter: { type: Number, default: 1, min: 1, max: 10 },
    smsTransporterType: {
      type: String,
      optional: true,
    },
    emailSubject: { type: String, optional: true },
  },
  { _id: false },
);

const twoFactorSchema = new Schema(
  {
    content: { type: String, optional: true },
    codeLength: { type: Number, default: 4, min: 4 },
    enableTwoFactor: { type: Boolean, default: false },
    expireAfter: { type: Number, default: 1, min: 1, max: 10 },
    smsTransporterType: {
      type: String,
      optional: true,
    },
    emailSubject: { type: String, optional: true },
  },
  { _id: false },
);

const mailConfigSchema = new Schema(
  {
    subject: { type: String, optional: true },
    invitationContent: { type: String, optional: true },
    registrationContent: { type: String, optional: true },
  },
  { _id: false },
);

export const clientPortalSchema = new Schema({
  _id: mongooseStringRandomId,
  name: { type: String },
  description: { type: String, optional: true },
  url: { type: String },
  domain: { type: String, optional: true },
  otpConfig: { type: otpConfigSchema, optional: true },
  twoFactorConfig: { type: twoFactorSchema, optional: true },

  mailConfig: { type: mailConfigSchema, optional: true },
  manualVerificationConfig: {
    type: {
      userIds: { type: [String], required: true },
      verifyCustomer: {
        type: Boolean,
        optional: true,
        default: false,
      },
      verifyCompany: {
        type: Boolean,
        optional: true,
        default: false,
      },
    },
    optional: true,
  },
  googleCredentials: { type: Object, optional: true },
  googleClientId: { type: String, optional: true },
  googleClientSecret: { type: String, optional: true },
  googleRedirectUri: { type: String, optional: true },
  facebookAppId: { type: String, optional: true },
  erxesAppToken: { type: String, optional: true },

  testUserEmail: { type: String, optional: true },
  testUserPhone: { type: String, optional: true },
  testUserPassword: { type: String, optional: true },
  testUserOTP: { type: Number, optional: true },

  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },

  passwordVerificationConfig: {
    type: {
      verifyByOTP: {
        type: Boolean,
        optional: true,
        default: false,
      },
      emailSubject: { type: String, optional: true },
      emailContent: { type: String, optional: true },
      smsContent: { type: String, optional: true },
    },
    optional: true,
  },

  tokenExpiration: {
    type: Number,
    optional: true,
    default: 1,
    label: 'Token expiration',
    min: 1,
    max: 7,
  },

  refreshTokenExpiration: {
    type: Number,
    optional: true,
    default: 7,
    min: 1,
    max: 30,
    label: 'Refresh token expiration',
  },

  tokenPassMethod: {
    type: String,
    optional: true,
    default: 'cookie',
    label: 'Token pass method',
    enum: ['cookie', 'header'],
  },

  vendorParentProductCategoryId: {
    type: String,
    optional: true,
  },

  socialpayConfig: {
    type: {
      publicKey: { type: String, optional: true },
      certId: { type: String, optional: true },
    },
    optional: true,
  },
  tokiConfig: {
    type: {
      merchantId: { type: String, optional: true },
      apiKey: { type: String, optional: true },
      username: { type: String, optional: true },
      password: { type: String, optional: true },
      production: { type: Boolean, optional: true },
    },
    optional: true,
  },
});

import { Schema } from 'mongoose';
import { mongooseStringRandomId } from '../../../utils';

const otpEmailConfigSchema = new Schema(
  {
    emailSubject: { type: String },
    messageTemplate: { type: String, required: true },
    codeLength: { type: Number, required: true },
    duration: { type: Number, required: true },
    enableEmailVerification: { type: Boolean },
    enablePasswordlessLogin: { type: Boolean },
  },
  { _id: false },
);

const otpSMSConfigSchema = new Schema(
  {
    messageTemplate: { type: String, required: true },
    codeLength: { type: Number, required: true },
    smsProvider: { type: String, required: true },
    duration: { type: Number, required: true },
    enablePhoneVerification: { type: Boolean },
    enablePasswordlessLogin: { type: Boolean },
  },
  { _id: false },
);

const otpConfigSchema = new Schema(
  {
    email: { type: otpEmailConfigSchema },
    sms: { type: otpSMSConfigSchema },
  },
  { _id: false },
);

const multiFactorConfigSchema = new Schema(
  {
    isEnabled: { type: Boolean, required: true },
    email: { type: otpEmailConfigSchema },
    sms: { type: otpSMSConfigSchema },
  },
  { _id: false },
);

const otpResendConfigSchema = new Schema(
  {
    cooldownPeriodInSeconds: { type: Number },
    maxAttemptsPerHour: { type: Number },
  },
  { _id: false },
);

const resetPasswordConfigSchema = new Schema(
  {
    mode: {
      type: String,
      required: true,
      enum: ['link', 'code'],
    },
    emailSubject: { type: String, required: true },
    emailContent: { type: String, required: true },
  },
  { _id: false },
);

const authConfigSchema = new Schema(
  {
    accessTokenExpirationInDays: {
      type: Number,
    },
    refreshTokenExpirationInDays: {
      type: Number,
    },
    deliveryMethod: {
      type: String,
      enum: ['cookie', 'header'],
    },
  },
  { _id: false },
);

const googleOAuthConfigSchema = new Schema(
  {
    credentials: { type: String },
    clientId: { type: String },
    clientSecret: { type: String },
    redirectUri: { type: String },
  },
  { _id: false },
);

const facebookOAuthConfigSchema = new Schema(
  {
    appId: { type: String },
    appSecret: { type: String },
    redirectUri: { type: String },
  },
  { _id: false },
);

const socialpayConfigSchema = new Schema(
  {
    enableSocialpay: { type: Boolean },
    publicKey: { type: String, required: true },
    certId: { type: String, required: true },
  },
  { _id: false },
);

const tokiConfigSchema = new Schema(
  {
    enableToki: { type: Boolean },
    merchantId: { type: String, required: true },
    apiKey: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    production: { type: Boolean },
  },
  { _id: false },
);

const callProConfigSchema = new Schema(
  {
    phone: { type: String },
    token: { type: String },
  },
  { _id: false },
);

const twilioConfigSchema = new Schema(
  {
    apiKey: { type: String },
    apiSecret: { type: String },
    apiUrl: { type: String },
  },
  { _id: false },
);

const smsProvidersConfigSchema = new Schema(
  {
    callPro: { type: callProConfigSchema },
    twilio: { type: twilioConfigSchema },
  },
  { _id: false },
);

const verificationConfigSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['email', 'phone', 'both', 'none'],
    },
  },
  { _id: false },
);

const manualVerificationConfigSchema = new Schema(
  {
    userIds: { type: [String], required: true },
    verifyCustomer: { type: Boolean, required: true },
    verifyCompany: { type: Boolean, required: true },
  },
  { _id: false },
);

const testUserSchema = new Schema(
  {
    enableTestUser: { type: Boolean },
    email: { type: String },
    phone: { type: String },
    password: { type: String },
    otp: { type: Number },
  },
  { _id: false },
);

const authSchema = new Schema(
  {
    authConfig: { type: authConfigSchema },
    googleOAuth: { type: googleOAuthConfigSchema },
    facebookOAuth: { type: facebookOAuthConfigSchema },
    socialpayConfig: { type: socialpayConfigSchema },
    tokiConfig: { type: tokiConfigSchema },
  },
  { _id: false },
);

const securityAuthConfigSchema = new Schema(
  {
    otpConfig: { type: otpConfigSchema },
    multiFactorConfig: { type: multiFactorConfigSchema },
    otpResendConfig: { type: otpResendConfigSchema },
    resetPasswordConfig: { type: resetPasswordConfigSchema },
  },
  { _id: false },
);

export const clientPortalSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String },
    description: { type: String },
    url: { type: String },
    domain: { type: String },
    token: { type: String, unique: true },
    erxesIntegrationToken: { type: String },

    auth: { type: authSchema },
    securityAuthConfig: { type: securityAuthConfigSchema },
    smsProvidersConfig: { type: smsProvidersConfigSchema },
    verificationConfig: { type: verificationConfigSchema },
    manualVerificationConfig: {
      type: manualVerificationConfigSchema,
    },
    enableManualVerification: { type: Boolean },
    testUser: { type: testUserSchema },
  },

  { timestamps: true },
);

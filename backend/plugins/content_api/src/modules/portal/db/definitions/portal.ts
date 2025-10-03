import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

const stylesSchema = new Schema(
  {
    bodyColor: { type: String, optional: true },
    headerColor: { type: String, optional: true },
    footerColor: { type: String, optional: true },
    helpColor: { type: String, optional: true },
    backgroundColor: { type: String, optional: true },
    activeTabColor: { type: String, optional: true },
    baseColor: { type: String, optional: true },
    headingColor: { type: String, optional: true },
    linkColor: { type: String, optional: true },
    linkHoverColor: { type: String, optional: true },
    dividerColor: { type: String, optional: true },
    primaryBtnColor: { type: String, optional: true },
    secondaryBtnColor: { type: String, optional: true },
    baseFont: { type: String, optional: true },
    headingFont: { type: String, optional: true },
  },
  {
    _id: false,
  },
);

const environmentVariableSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

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
export const portalSchema = new Schema({
  _id: mongooseStringRandomId,
  name: { type: String },
  description: { type: String, optional: true },
  kind: {
    type: String,
    enum: ['client', 'vendor'],
    default: 'client',
  },
  url: { type: String },
  logo: { type: String, optional: true },
  icon: { type: String, optional: true },
  headerHtml: { type: String, optional: true },
  footerHtml: { type: String, optional: true },

  domain: { type: String, optional: true },
  dnsStatus: { type: String, optional: true },
  styles: { type: stylesSchema, optional: true },
  mobileResponsive: { type: Boolean, optional: true },
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

  messengerBrandCode: { type: String, optional: true },
  knowledgeBaseLabel: { type: String, optional: true },
  knowledgeBaseTopicId: { type: String },
  ticketLabel: { type: String, optional: true },
  dealLabel: { type: String, optional: true },
  purchaseLabel: { type: String, optional: true },
  taskPublicBoardId: { type: String, optional: true },
  taskPublicPipelineId: { type: String, optional: true },
  taskPublicLabel: { type: String, optional: true },
  taskLabel: { type: String, optional: true },
  taskStageId: { type: String },
  taskPipelineId: { type: String },
  taskBoardId: { type: String },
  ticketStageId: { type: String },
  ticketPipelineId: { type: String },
  ticketBoardId: { type: String },
  dealStageId: { type: String },
  dealPipelineId: { type: String },
  dealBoardId: { type: String },
  purchaseStageId: { type: String },
  purchasePipelineId: { type: String },
  purchaseBoardId: { type: String },

  kbToggle: { type: Boolean },
  publicTaskToggle: { type: Boolean },
  ticketToggle: { type: Boolean },
  taskToggle: { type: Boolean },
  dealToggle: { type: Boolean },
  purchaseToggle: { type: Boolean },

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
  language: { type: String, optional: true },
  languages: { type: [String], optional: true },

  slug: { type: String, optional: true },
  template: { type: String, optional: true, default: 'helpdesk' },
  templateId: { type: String, optional: true },
  keywords: { type: String, optional: true },
  copyright: { type: String, optional: true },
  externalLinks: { type: Object, optional: true },
  googleAnalytics: { type: String, optional: true },
  facebookPixel: { type: String, optional: true },
  googleTagManager: { type: String, optional: true },
  vercelProjectId: { type: String, optional: true },
  lastVercelDeploymentId: { type: String, optional: true },
  environmentVariables: { type: [environmentVariableSchema], optional: true },
});

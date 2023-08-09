import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IOTPConfig {
  content: string;
  codeLength: number;
  smsTransporterType: '' | 'messagePro' | 'telnyx';
  loginWithOTP: boolean;
  expireAfter: number;
}

export interface IMailConfig {
  subject: string;
  invitationContent: string;
  registrationContent: string;
}

export interface IManualVerificationConfig {
  userIds: string[];
  verifyCustomer: boolean;
  verifyCompany: boolean;
}

export interface IPasswordVerificationConfig {
  verifyByOTP: boolean;

  // email
  emailSubject: string;
  emailContent: string;

  // sms
  smsContent: string;
}

export interface IClientPortal {
  _id?: string;
  name?: string;
  description?: string;
  logo?: string;
  icon?: string;
  url?: string;
  domain?: string;
  dnsStatus?: string;
  styles?: IStyles;
  mobileResponsive?: boolean;

  // auth
  tokenExpiration?: number;
  refreshTokenExpiration?: number;
  tokenPassMethod?: 'cookie' | 'header';

  otpConfig?: IOTPConfig;
  mailConfig?: IMailConfig;
  manualVerificationConfig?: IManualVerificationConfig;
  passwordVerificationConfig?: IPasswordVerificationConfig;

  googleCredentials?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleRedirectUri?: string;

  messengerBrandCode?: string;
  knowledgeBaseLabel?: string;
  knowledgeBaseTopicId?: string;
  ticketLabel?: string;
  dealLabel?: string;
  purchaseLabel?: string;
  taskLabel?: string;
  taskStageId?: string;
  taskPipelineId?: string;
  taskPublicBoardId?: string;
  taskPublicPipelineId?: string;
  taskPublicLabel?: string;
  taskBoardId?: string;
  ticketStageId?: string;
  ticketPipelineId?: string;
  ticketBoardId?: string;
  dealStageId?: string;
  dealPipelineId?: string;
  dealBoardId?: string;
  purchaseStageId?: string;
  purchasePipelineId?: string;
  purchaseBoardId?: string;

  kbToggle?: boolean;
  publicTaskToggle?: boolean;
  ticketToggle?: boolean;
  dealToggle?: boolean;
  purchaseToggle?: boolean;
  taskToggle?: boolean;
}

interface IStyles {
  bodyColor?: string;
  headerColor?: string;
  footerColor?: string;
  helpColor?: string;
  backgroundColor?: string;
  activeTabColor?: string;
  baseColor?: string;
  headingColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  baseFont?: string;
  headingFont?: string;
  dividerColor?: string;
  primaryBtnColor?: string;
  secondaryBtnColor?: string;
}

export interface IClientPortalDocument extends IClientPortal, Document {
  _id: string;
}

const stylesSchema = new Schema(
  {
    bodyColor: field({ type: String, optional: true }),
    headerColor: field({ type: String, optional: true }),
    footerColor: field({ type: String, optional: true }),
    helpColor: field({ type: String, optional: true }),
    backgroundColor: field({ type: String, optional: true }),
    activeTabColor: field({ type: String, optional: true }),
    baseColor: field({ type: String, optional: true }),
    headingColor: field({ type: String, optional: true }),
    linkColor: field({ type: String, optional: true }),
    linkHoverColor: field({ type: String, optional: true }),
    dividerColor: field({ type: String, optional: true }),
    primaryBtnColor: field({ type: String, optional: true }),
    secondaryBtnColor: field({ type: String, optional: true }),
    baseFont: field({ type: String, optional: true }),
    headingFont: field({ type: String, optional: true })
  },
  {
    _id: false
  }
);

const otpConfigSchema = new Schema(
  {
    content: field({ type: String, optional: true }),
    codeLength: field({ type: Number, default: 4, min: 4 }),
    loginWithOTP: field({ type: Boolean, default: false }),
    expireAfter: field({ type: Number, default: 1, min: 1, max: 10 }),
    smsTransporterType: field({
      type: String,
      enum: ['', 'messagePro', 'telnyx'],
      optional: true
    })
  },
  { _id: false }
);

const mailConfigSchema = new Schema(
  {
    subject: field({ type: String, optional: true }),
    invitationContent: field({ type: String, optional: true }),
    registrationContent: field({ type: String, optional: true })
  },
  { _id: false }
);

export const clientPortalSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  description: field({ type: String, optional: true }),
  url: field({ type: String }),
  logo: field({ type: String, optional: true }),
  icon: field({ type: String, optional: true }),
  headerHtml: field({ type: String, optional: true }),
  footerHtml: field({ type: String, optional: true }),

  domain: field({ type: String, optional: true }),
  dnsStatus: field({ type: String, optional: true }),
  styles: field({ type: stylesSchema, optional: true }),
  mobileResponsive: field({ type: Boolean, optional: true }),
  otpConfig: field({ type: otpConfigSchema, optional: true }),
  mailConfig: field({ type: mailConfigSchema, optional: true }),
  manualVerificationConfig: field({
    type: {
      userIds: field({ type: [String], required: true }),
      verifyCustomer: field({ type: Boolean, optional: true, default: false }),
      verifyCompany: field({ type: Boolean, optional: true, default: false })
    },
    optional: true
  }),
  googleCredentials: field({ type: Object, optional: true }),
  googleClientId: field({ type: String, optional: true }),
  googleClientSecret: field({ type: String, optional: true }),
  googleRedirectUri: field({ type: String, optional: true }),
  facebookAppId: field({ type: String, optional: true }),
  erxesAppToken: field({ type: String, optional: true }),

  messengerBrandCode: field({ type: String, optional: true }),
  knowledgeBaseLabel: field({ type: String, optional: true }),
  knowledgeBaseTopicId: field({ type: String }),
  ticketLabel: field({ type: String, optional: true }),
  dealLabel: field({ type: String, optional: true }),
  purchaseLabel: field({ type: String, optional: true }),
  taskPublicBoardId: field({ type: String, optional: true }),
  taskPublicPipelineId: field({ type: String, optional: true }),
  taskPublicLabel: field({ type: String, optional: true }),
  taskLabel: field({ type: String, optional: true }),
  taskStageId: field({ type: String }),
  taskPipelineId: field({ type: String }),
  taskBoardId: field({ type: String }),
  ticketStageId: field({ type: String }),
  ticketPipelineId: field({ type: String }),
  ticketBoardId: field({ type: String }),
  dealStageId: field({ type: String }),
  dealPipelineId: field({ type: String }),
  dealBoardId: field({ type: String }),
  purchaseStageId: field({ type: String }),
  purchasePipelineId: field({ type: String }),
  purchaseBoardId: field({ type: String }),

  kbToggle: field({ type: Boolean }),
  publicTaskToggle: field({ type: Boolean }),
  ticketToggle: field({ type: Boolean }),
  taskToggle: field({ type: Boolean }),
  dealToggle: field({ type: Boolean }),
  purchaseToggle: field({ type: Boolean }),

  createdAt: field({
    type: Date,
    default: new Date(),
    label: 'Created at'
  }),

  passwordVerificationConfig: field({
    type: {
      verifyByOTP: field({ type: Boolean, optional: true, default: false }),
      emailSubject: field({ type: String, optional: true }),
      emailContent: field({ type: String, optional: true }),
      smsContent: field({ type: String, optional: true })
    },
    optional: true
  }),

  tokenExpiration: field({
    type: Number,
    optional: true,
    default: 1,
    label: 'Token expiration',
    min: 1,
    max: 7
  }),

  refreshTokenExpiration: field({
    type: Number,
    optional: true,
    default: 7,
    min: 1,
    max: 30,
    label: 'Refresh token expiration'
  }),

  tokenPassMethod: field({
    type: String,
    optional: true,
    default: 'cookie',
    label: 'Token pass method',
    enum: ['cookie', 'header']
  })
});

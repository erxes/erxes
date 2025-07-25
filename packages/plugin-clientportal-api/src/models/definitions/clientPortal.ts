import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IOTPConfig {
  emailSubject?: any;
  content: string;
  codeLength: number;
  smsTransporterType: string;
  loginWithOTP: boolean;
  expireAfter: number;
}
export interface TwoFactorConfig {
  emailSubject?: any;
  content: string;
  codeLength: number;
  smsTransporterType: string;
  enableTwoFactor: boolean;
  expireAfter: number;
}
export interface ISocialpayConfig {
  publicKey: string;
  certId: string;
}

export interface ITokiConfig {
  merchantId: string;
  apiKey: string;
  username: string;
  password: string;
  production?: boolean;
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

export type EnvironmentVariable = {
  key: string;
  value: string;
};

export interface IClientPortal {
  _id?: string;
  name?: string;
  kind: 'client' | 'vendor';
  description?: string;
  logo?: string;
  icon?: string;
  url?: string;
  domain?: string;
  dnsStatus?: string;
  styles?: IStyles;
  mobileResponsive?: boolean;

  environmentVariables?: EnvironmentVariable[];

  // auth
  tokenExpiration?: number;
  refreshTokenExpiration?: number;
  tokenPassMethod?: 'cookie' | 'header';
  erxesAppToken?: string;
  otpConfig?: IOTPConfig;
  twoFactorConfig?: TwoFactorConfig;

  mailConfig?: IMailConfig;
  manualVerificationConfig?: IManualVerificationConfig;
  passwordVerificationConfig?: IPasswordVerificationConfig;
  socialpayConfig?: ISocialpayConfig;
  tokiConfig?: ITokiConfig;

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

  testUserEmail?: string;
  testUserPhone?: string;
  testUserPassword?: string;
  testUserOTP?: number;

  vendorParentProductCategoryId?: string;
  language?: string;
  languages?: string[];
  slug?: string;
  template?: string;
  templateId?: string;
  keywords?: string;
  copyright?: string;

  externalLinks?: {
    [key: string]: string;
  };

  googleAnalytics?: string;
  facebookPixel?: string;
  googleTagManager?: string;
  vercelProjectId?: string;
  lastVercelDeploymentId?: string;
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
    headingFont: field({ type: String, optional: true }),
  },
  {
    _id: false,
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
      optional: true,
    }),
    emailSubject: field({ type: String, optional: true }),
  },
  { _id: false }
);

const twoFactorSchema = new Schema(
  {
    content: field({ type: String, optional: true }),
    codeLength: field({ type: Number, default: 4, min: 4 }),
    enableTwoFactor: field({ type: Boolean, default: false }),
    expireAfter: field({ type: Number, default: 1, min: 1, max: 10 }),
    smsTransporterType: field({
      type: String,
      optional: true,
    }),
    emailSubject: field({ type: String, optional: true }),
  },
  { _id: false }
);

const mailConfigSchema = new Schema(
  {
    subject: field({ type: String, optional: true }),
    invitationContent: field({ type: String, optional: true }),
    registrationContent: field({ type: String, optional: true }),
  },
  { _id: false }
);

const navigationMenuSchema = new Schema(
  {
    label: field({ type: String }),
    url: field({ type: String }),
    icon: field({ type: String, optional: true }),
    children: field({ type: [Object], optional: true }),
    order: field({ type: Number, optional: true }),
  },
  { _id: false }
);

const environmentVariableSchema = new Schema(
  {
    key: field({ type: String, required: true }),
    value: field({ type: String, required: true }),
  },
  { _id: false }
);

export const clientPortalSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  description: field({ type: String, optional: true }),
  kind: field({
    type: String,
    enum: ['client', 'vendor'],
    default: 'client',
  }),
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
  twoFactorConfig: field({ type: twoFactorSchema, optional: true }),

  mailConfig: field({ type: mailConfigSchema, optional: true }),
  manualVerificationConfig: field({
    type: {
      userIds: field({ type: [String], required: true }),
      verifyCustomer: field({
        type: Boolean,
        optional: true,
        default: false,
      }),
      verifyCompany: field({
        type: Boolean,
        optional: true,
        default: false,
      }),
    },
    optional: true,
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

  testUserEmail: field({ type: String, optional: true }),
  testUserPhone: field({ type: String, optional: true }),
  testUserPassword: field({ type: String, optional: true }),
  testUserOTP: field({ type: Number, optional: true }),

  createdAt: field({
    type: Date,
    default: new Date(),
    label: 'Created at',
  }),

  passwordVerificationConfig: field({
    type: {
      verifyByOTP: field({
        type: Boolean,
        optional: true,
        default: false,
      }),
      emailSubject: field({ type: String, optional: true }),
      emailContent: field({ type: String, optional: true }),
      smsContent: field({ type: String, optional: true }),
    },
    optional: true,
  }),

  tokenExpiration: field({
    type: Number,
    optional: true,
    default: 1,
    label: 'Token expiration',
    min: 1,
    max: 7,
  }),

  refreshTokenExpiration: field({
    type: Number,
    optional: true,
    default: 7,
    min: 1,
    max: 30,
    label: 'Refresh token expiration',
  }),

  tokenPassMethod: field({
    type: String,
    optional: true,
    default: 'cookie',
    label: 'Token pass method',
    enum: ['cookie', 'header'],
  }),

  vendorParentProductCategoryId: field({
    type: String,
    optional: true,
  }),

  socialpayConfig: field({
    type: {
      publicKey: field({ type: String, optional: true }),
      certId: field({ type: String, optional: true }),
    },
    optional: true,
  }),

  tokiConfig: field({
    type: {
      merchantId: field({ type: String, optional: true }),
      apiKey: field({ type: String, optional: true }),
      username: field({ type: String, optional: true }),
      password: field({ type: String, optional: true }),
      production: field({ type: Boolean, optional: true }),
    },
    optional: true,
  }),
  language: field({ type: String, optional: true }),
  languages: field({ type: [String], optional: true }),
  slug: field({ type: String, optional: true }),
  template: field({ type: String, optional: true }),
  templateId: field({ type: String, optional: true }),
  keywords: field({ type: String, optional: true }),
  copyright: field({ type: String, optional: true }),
  externalLinks: field({ type: Object, optional: true }),
  googleAnalytics: field({ type: String, optional: true }),
  facebookPixel: field({ type: String, optional: true }),
  googleTagManager: field({ type: String, optional: true }),
  vercelProjectId: field({ type: String, optional: true }),
  lastVercelDeploymentId: field({ type: String, optional: true }),

  environmentVariables: field({
    type: [environmentVariableSchema],
    optional: true,
  }),
});

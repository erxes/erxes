import { Document } from 'mongoose';

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

export interface ITokiConfig {
  merchantId: string;
  apiKey: string;
  username: string;
  password: string;
  production?: boolean;
}

export type EnvironmentVariable = {
  key: string;
  value: string;
};

export interface IPortal {
  _id?: string;
  name?: string;
  kind: 'client' | 'vendor' | 'blog' | 'ecommerce' | 'helpdesk' | 'community';
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

  environmentVariables?: EnvironmentVariable[];
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

export interface IPortalDocument extends IPortal, Document {
  _id: string;
}

export interface Icontent {
  name: string;
  description: string;
}

export interface IcontentDocument extends Icontent, Document {
  createdAt: Date;
  modifiedAt: Date;
}

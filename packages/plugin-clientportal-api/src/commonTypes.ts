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
  isVendor?: boolean;
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

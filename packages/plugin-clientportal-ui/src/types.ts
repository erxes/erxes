import { IAttachment } from './../../../client-portal/modules/common/types';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type OTPConfig = {
  emailSubject?: string;
  content: string;
  smsTransporterType?: '' | 'messagePro';
  codeLength: number;
  loginWithOTP: boolean;
  expireAfter: number;
};
export type TwoFactorConfig = {
  emailSubject?: string;
  content: string;
  smsTransporterType?: '' | 'messagePro';
  codeLength: number;
  enableTwoFactor: boolean;
  expireAfter: number;
};

export type MailConfig = {
  subject: string;
  registrationContent: string;
  invitationContent: string;
};

export type ManualVerificationConfig = {
  userIds: string[];
  verifyCustomer: boolean;
  verifyCompany: boolean;
};

export type PasswordVerificationConfig = {
  verifyByOTP: boolean;
  emailSubject: string;
  emailContent: string;
  smsContent: string;
};

export interface IVerificationRequest {
  status: string;
  attachments: IAttachment[];
  description?: string;
  verifiedBy?: string;
}

export interface IClientPortalUserDoc {
  firstName: string;
  companyName: string;
  companyRegistrationNumber: string;
  lastName: string;
  code: string;
  phone: string;
  email: string;
  username: string;
  ownerId?: string;
  erxesCustomerId: string;
  erxesCompanyId: string;
  clientPortalId: string;
  type: string;
  clientPortal: ClientPortalConfig;

  customer: ICustomer;
  company: ICompany;

  isPhoneVerified: boolean;
  isEmailVerified: boolean;

  lastSeenAt: Date;
  sessionCount: number;
  isOnline: boolean;

  customFieldsData: JSON;
  avatar: string;

  verificationRequest: IVerificationRequest;
}

export interface IClientPortalUser extends IClientPortalUserDoc {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  forumSubscriptionEndsAfter?: string;
  clientPortal: ClientPortalConfig;
  isSubscribed?: string;
  hasAuthority?: string;
}

export type ClientPortalUsersQueryResponse = {
  clientPortalUsers: IClientPortalUser[];
} & QueryResponse;

export type ClientPortalUserTotalCountQueryResponse = {
  clientPortalUserCounts: number;
  loading: boolean;
  refetch: () => void;
};

export type ClientPoratlUserDetailQueryResponse = {
  clientPortalUserDetail: IClientPortalUser;
  loading: boolean;
};

export type ClientPortalUserRemoveMutationResponse = {
  clientPortalUsersRemove: (mutation: {
    variables: { clientPortalUserIds: string[] };
  }) => Promise<any>;
};
export type ClientPortalParticipantRelationEditMutationResponse = {
  clientPortalParticipantRelationEdit: (mutation: {
    variables: {
      type: string;
      cardId: string;
      cpUserIds: string[];
      oldCpUserIds: string[];
    };
  }) => Promise<any>;
};

export type ClientPortalUserAssignCompanyMutationResponse = {
  clientPortalUserAssignCompany: (mutation: {
    variables: {
      userId: string;
      erxesCompanyId: string;
      erxesCustomerId: string;
    };
  }) => Promise<any>;
};

export type ClientPortalVerifyUsersMutationResponse = {
  clientPortalUsersVerify: (mutation: {
    variables: { type: string; userIds: string[] };
  }) => Promise<any>;
};

export type SocialpayConfig = {
  publicKey: string;
  certId: string;
};

export type ClientPortalConfig = {
  _id?: string;
  kind?: string;
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  icon?: string;
  domain?: string;
  dnsStatus?: string;
  messengerBrandCode?: string;
  knowledgeBaseLabel?: string;
  knowledgeBaseTopicId?: string;
  ticketLabel?: string;
  dealLabel?: string;
  purchaseLabel?: string;
  taskPublicBoardId?: string;
  taskPublicPipelineId?: string;
  taskPublicLabel?: string;
  taskLabel?: string;
  taskStageId?: string;
  taskBoardId?: string;
  taskPipelineId?: string;
  ticketStageId?: string;
  ticketBoardId?: string;
  ticketPipelineId?: string;
  dealStageId?: string;
  dealBoardId?: string;
  dealPipelineId?: string;
  purchaseStageId?: string;
  purchaseBoardId?: string;
  purchasePipelineId?: string;
  styles?: Styles;
  mobileResponsive?: boolean;
  googleCredentials?: object;
  googleClientId?: string;
  googleRedirectUri?: string;
  googleClientSecret?: string;
  facebookAppId?: string;
  erxesAppToken?: string;

  kbToggle?: boolean;
  publicTaskToggle?: boolean;
  ticketToggle?: boolean;
  dealToggle?: boolean;
  purchaseToggle?: boolean;
  taskToggle?: boolean;
  otpConfig?: OTPConfig;
  twoFactorConfig?: TwoFactorConfig;
  mailConfig?: MailConfig;
  manualVerificationConfig?: ManualVerificationConfig;
  passwordVerificationConfig?: PasswordVerificationConfig;

  testUserEmail?: string;
  testUserPhone?: string;
  testUserPassword?: string;
  testUserOTP?: number;

  tokenExpiration?: number;
  refreshTokenExpiration?: number;
  tokenPassMethod: 'cookie' | 'header';
  vendorParentProductCategoryId?: string;
  socialpayConfig?: SocialpayConfig;
  language?: string;
};

export type Styles = {
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
  primaryBtnColor?: string;
  secondaryBtnColor?: string;
  dividerColor?: string;
  baseFont?: string;
  headingFont?: string;
  __typename?: string;
};

export type ClientPortalConfigsQueryResponse = {
  clientPortalGetConfigs?: ClientPortalConfig[];
  loading?: boolean;
  refetch: () => Promise<any>;
  error?: string;
};

export type ClientPortalParticipantDetailQueryResponse = {
  clientPortalParticipantDetail?: IClientPortalParticipant;
  loading?: boolean;
  refetch: () => Promise<any>;
  error?: string;
};

export type ClientPortalConfigQueryResponse = {
  clientPortalGetConfig?: ClientPortalConfig;
  loading?: boolean;
};

export type ClientPortalTotalQueryResponse = {
  clientPortalConfigsTotalCount?: number;
  loading?: boolean;
  refetch: () => Promise<any>;
  error?: string;
};

export type ClientPortalGetLastQueryResponse = {
  clientPortalGetLast: ClientPortalConfig;
  loading?: boolean;
};

export interface IClientPortalParticipantDoc {
  contentType: string;
  contentTypeId: string;
  cpUserId: string;
  cpUser: IClientPortalUser;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  offeredAmount: number;
  hasVat: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface IClientPortalParticipant extends IClientPortalParticipantDoc {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

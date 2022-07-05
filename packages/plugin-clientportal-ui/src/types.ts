import { QueryResponse } from '@erxes/ui/src/types';

export type OTPConfig = {
  content: string;
  smsTransporterType?: '' | 'messagePro';
  emailTransporterType?: '' | 'ses';
  codeLength: number;
};

export interface IClientPortalUserDoc {
  firstName: string;
  lastName: string;
  code: string;
  phone: string;
  email: string;
  username: string;
  type: string;
  ownerId?: string;
  erxesCustomerId: string;
  erxesCompanyId: string;
  clientPortalId: string;
}

export interface IClientPortalUser extends IClientPortalUserDoc {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
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

export type ClientPortalConfig = {
  _id?: string;
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
  taskPublicBoardId?: string;
  taskPublicPipelineId?: string;
  taskLabel?: string;
  taskStageId?: string;
  taskBoardId?: string;
  taskPipelineId?: string;
  ticketStageId?: string;
  ticketBoardId?: string;
  ticketPipelineId?: string;
  styles?: Styles;
  mobileResponsive?: boolean;
  googleCredentials?: object;

  kbToggle?: boolean;
  publicTaskToggle?: boolean;
  ticketToggle?: boolean;
  taskToggle?: boolean;
  otpConfig?: OTPConfig;
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
};

export type ClientPortalConfigsQueryResponse = {
  clientPortalGetConfigs?: ClientPortalConfig[];
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

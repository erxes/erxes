export type ClientPortalConfig = {
  _id?: string;
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  icon?: string;
  domain?: string;
  dnsStatus?: string;
  knowledgeBaseLabel?: string;
  knowledgeBaseTopicId?: string;
  ticketLabel?: string;
  taskLabel?: string;
  taskStageId?: string;
  taskBoardId?: string;
  taskPipelineId?: string;
  ticketStageId?: string;
  ticketBoardId?: string;
  ticketPipelineId?: string;
  styles?: Styles;
  advanced?: AdvancedSettings;
  css?: string;
  mobileResponsive?: boolean;
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
};

export type ClientPortalConfigsQueryResponse = {
  getConfigs?: [ClientPortalConfig];
  loading?: boolean;
};

export type ClientPortalConfigQueryResponse = {
  getConfig?: ClientPortalConfig;
  loading?: boolean;
};

export type ClientPortalTotalQueryResponse = {
  getClientPortalTotalCount?: number;
  loading?: boolean;
};

export type AdvancedSettings = {
  autoSuggest?: boolean;
  enableCaptcha?: boolean;
  authAllow?: boolean;
  submitTicket?: boolean;
  viewTicket?: boolean;
  showSpecificTicket?: boolean;
};

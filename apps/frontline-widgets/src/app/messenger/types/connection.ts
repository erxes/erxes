export interface IConnectionInfo {
  widgetsMessengerConnect: IWidgetData;
  browserInfo: IBrowserInfo;
}

export interface IWidgetData {
  messengerData?: IMessengerData;
  ticketData?: ITicketData;
  languageCode?: string;
  uiOptions?: IWidgetUiOptions;
  customerId?: string;
  visitorId?: string;
  integrationId?: string;
}

export interface IMessengerData {
  supporterIds?: string[];
  links?: any;
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
  botCheck?: boolean;
  botGreetMessage?: string;
  notifyCustomer?: boolean;
  availabilityMethod?: string;
  isOnline?: boolean;
  onlineHours?: IOnlineHours[];
  timezone?: string;
  responseRate?: string;
  showTimezone?: boolean;
  messages?: IMessageDataMessages;
  externalLinks?: { url: string }[];
  requireAuth?: boolean;
  showChat?: boolean;
  showLauncher?: boolean;
  hideWhenOffline?: boolean;
  forceLogoutWhenResolve?: boolean;
  showVideoCallRequest?: boolean;
  getStarted?: boolean;
  knowledgeBaseTopicId?: string;
  websiteApps?: any[];
  formCodes?: any[];
}

export interface IOnlineHours {
  day: string;
  from: string;
  to: string;
}
export interface IMessageDataMessages {
  greetings?: {
    title?: string;
    message?: string;
  };
  welcome?: string;
  away?: string;
  thank?: string;
}

export interface IWidgetUiOptions {
  color?: string;
  textColor?: string;
  logo?: string;
}

export interface IBrowserInfo {
  remoteAddress?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  url?: string;
  hostname?: string;
  language?: string;
  userAgent?: string;
}

export interface ITicketData {
  ticketToggle?: boolean;
  ticketStageId?: string;
  ticketPipelineId?: string;
  ticketBoardId?: string;
}

export interface RequestBrowserInfoParams {
  source: string;
  postData?: any;
  callback: (browserInfo: IBrowserInfo) => void;
}
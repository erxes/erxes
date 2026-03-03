export interface IConnectionInfo {
  widgetsMessengerConnect: IWidgetData;
  browserInfo: IBrowserInfo;
}

export interface IWidgetData {
  messengerData?: IMessengerData;
  ticketConfig?: ITicketConfig;
  languageCode?: string;
  uiOptions?: IWidgetUiOptions;
  customerId?: string;
  visitorId?: string;
  integrationId?: string;
  customer?: ICustomerData;
}

export interface IPersistentMenu {
  text: string;
  type: 'button' | 'link';
}

export interface IMessengerData {
  supporterIds?: string[];
  links?: any;
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
  botCheck?: boolean;
  botGreetMessage?: string;
  persistentMenus?: IPersistentMenu[];
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
  primary?: {
    DEFAULT?: string;
    foreground?: string;
  };
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

export interface ITicketFormField {
  isShow?: boolean;
  label?: string;
  placeholder?: string;
  order?: number;
}
export interface ITicketFormFields {
  name?: ITicketFormField;
  description?: ITicketFormField;
  attachment?: ITicketFormField;
  tags?: ITicketFormField;
}

export interface ITicketConfig {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  pipelineId: string;
  channelId: string;
  selectedStatusId: string;
  formFields: ITicketFormFields;
  parentId?: string;
}

export interface IMessengerData {
  integrationId: string;
  email?: string;
  phone?: string;
  code?: string;
  data?: any;
  companyData?: any;
}

export interface ICustomerData {
  _id: string;
  firstName?: string;
  lastName?: string;
  phones?: string[];
  emails?: string[];
}

export interface IMessengerData {
  integrationId: string;
  email?: string;
  phone?: string;
  code?: string;
  data?: any;
  companyData?: any;
}

export interface ICustomerData {
  _id: string;
  firstName?: string;
  lastName?: string;
  phones?: string[];
  emails?: string[];
}

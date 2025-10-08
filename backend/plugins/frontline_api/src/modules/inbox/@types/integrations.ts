import { Document } from 'mongoose';
import { IRule, IAttachment } from 'erxes-api-shared/core-types';
export interface ISubmission extends Document {
  customerId: string;
  submittedAt: Date;
}

export interface ILink {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface ITicketData {
  ticketLabel?: string;
  ticketToggle?: boolean;
  ticketStageId?: string;
  ticketPipelineId?: string;
  ticketBoardId?: string;
}
interface IOnboardingParams {
  brandName: string;
  logo?: string;
  color?: string;
  name: string;
}
export interface IArchiveParams {
  _id: string;
  status: boolean;
}

export interface IOnboardingParamsEdit extends IOnboardingParams {
  _id: string;
}

export interface IMessengerOnlineHours {
  day?: string;
  from?: string;
  to?: string;
}

export interface IMessengerOnlineHoursDocument
  extends IMessengerOnlineHours,
    Document {}

export interface IMessengerDataMessagesItem {
  greetings?: { title?: string; message?: string };
  away?: string;
  thank?: string;
  welcome?: string;
}

export interface IMessageDataMessages {
  [key: string]: IMessengerDataMessagesItem;
}
type BotPersistentMenuTypeMessenger = {
  _id: string;
  type: string;
  text: string;
  link: string;
  isEditing?: boolean;
};
export interface IMessengerData {
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
  botCheck?: boolean;
  botGreetMessage?: string;
  persistentMenus?: BotPersistentMenuTypeMessenger[];
  getStarted?: boolean;
  skillData?: {
    typeId: string;
    options: Array<{
      label: string;
      response: string;
      typeId: string;
    }>;
  };
  supporterIds?: string[];
  notifyCustomer?: boolean;
  availabilityMethod?: string;
  isOnline?: boolean;
  onlineHours?: IMessengerOnlineHours[];
  timezone?: string;
  responseRate?: string;
  showTimezone?: boolean;
  messages?: IMessageDataMessages;
  links?: ILink;
  externalLinks?: IExternalLink[];
  showChat?: boolean;
  showLauncher?: boolean;
  hideWhenOffline?: boolean;
  requireAuth?: boolean;
  forceLogoutWhenResolve?: boolean;
  showVideoCallRequest?: boolean;
  isReceiveWebCall?: boolean;
}

export interface IMessengerDataDocument extends IMessengerData, Document {}

export interface ICallout extends Document {
  title?: string;
  body?: string;
  buttonText?: string;
  featuredImage?: string;
  skip?: boolean;
  calloutImgSize?: string;
}

export interface ILeadData {
  loadType?: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string;
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankTitle?: string;
  thankContent?: string;
  redirectUrl?: string;
  themeColor?: string;
  callout?: ICallout;
  rules?: IRule;
  viewCount?: number;
  contactsGathered?: number;
  isRequireOnce?: boolean;
  saveAsCustomer?: boolean;
  templateId?: string;
  attachments?: IAttachment[];
  css?: string;
  successImage?: string;
  successImageSize?: string;
  verifyEmail?: boolean;
}

export interface IWebhookData {
  script: string;
  token: string;
  origin: string;
}

export interface ILeadDataDocument extends ILeadData, Document {
  viewCount?: number;
  contactsGathered?: number;
}

export interface IUiOptions {
  color?: string;
  wallpaper?: string;
  logo?: string;
  textColor?: string;
}

// subdocument schema for messenger UiOptions
export interface IUiOptionsDocument extends IUiOptions, Document {}

export interface IIntegration {
  kind: string;
  channelId: string;
  name?: string;
  languageCode?: string;
  tagIds?: string[];
  formId?: string;
  leadData?: ILeadData;
  messengerData?: IMessengerData;
  ticketData?: ITicketData;
  uiOptions?: IUiOptions;
  isActive?: boolean;
  isConnected?: boolean;
  departmentIds?: string[];
  visibility?: string;
}

export interface IExternalLink {
  url: string;
}

export interface IIntegrationDocument extends IIntegration, Document {
  _id: string;
  createdUserId: string;
  // TODO remove
  formData?: ILeadData;
  leadData?: ILeadDataDocument;
  messengerData?: IMessengerDataDocument;
  webhookData?: IWebhookData;
  uiOptions?: IUiOptionsDocument;
}

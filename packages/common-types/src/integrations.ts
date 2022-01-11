import { Document } from 'mongoose';

import { IRule } from './common';

interface ILink {
  twitter?: string;
  facebook?: string;
  youtube?: string;
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

export interface IMessengerData {
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
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
  showChat?: boolean;
  showLauncher?: boolean;
  requireAuth?: boolean;
  forceLogoutWhenResolve?: boolean;
  showVideoCallRequest?: boolean;
}

export interface IMessengerDataDocument extends IMessengerData, Document {}

export interface ICallout extends Document {
  title?: string;
  body?: string;
  buttonText?: string;
  featuredImage?: string;
  skip?: boolean;
}

export interface IAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface IBookingStyle {
  itemShape?: string;
  widgetColor?: string;

  productAvailable?: string;
  baseFont?: string;

  line?: string;
  rows?: number;
  columns?: number;
  margin?: number;
}

export interface IBookingData {
  name?: string;
  description?: string;
  image?: IAttachment;
  style?: IBookingStyle;
  userFilters?: string[];
  productCategoryId?: string;
  viewCount?: number;
  navigationText?: string;
  bookingFormText?: string;
  productFieldIds?: string[];
}

export interface IBookingDataDocument extends IBookingData, Document {
  viewCount?: number;
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
  templateId?: string;
  attachments?: IAttachment[];
  css?: string;
  successImage?: string;
  successImageSize?: string;
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
  name?: string;
  brandId?: string;
  languageCode?: string;
  tagIds?: string[];
  formId?: string;
  leadData?: ILeadData;
  messengerData?: IMessengerData;
  uiOptions?: IUiOptions;
  isActive?: boolean;
  channelIds?: string[];
  bookingData?: IBookingData;
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
  bookingData?: IBookingDataDocument;
}

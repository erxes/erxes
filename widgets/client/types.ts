import { ICallout } from './form/types';
import { IWebsiteApp } from './messenger/types';

export type ENV = {
  API_URL: string;
  API_SUBSCRIPTIONS_URL: string;
};

export interface IUserDetails {
  avatar: string;
  fullName: string;
  shortName: string;
  position: string;
  description: string;
}

export interface IUser {
  _id: string;
  details?: IUserDetails;
}

export interface IUserLinks {
  facebook: string;
  twitter: string;
  youtube: string;
  linkedIn: string;
  github: string;
  website: string;
}

export interface IParticipator extends IUser {
  links: IUserLinks;
}

export interface ICustomer {
  _id: string;
  avatar?: string;
  firstName?: string;
}

export interface IBrand {
  name: string;
  description: string;
}

export interface IBrowserInfo {
  language?: string;
  url?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  remoteAddress?: string;
  region?: string;
  hostname?: string;
  userAgent?: string;
}

export interface IEmailParams {
  toEmails: string[];
  fromEmail: string;
  title: string;
  content: string;
}

export interface IIntegrationTwitterData {
  info: any;
  token: string;
  tokenSecret: string;
}

export interface IIntegrationFacebookData {
  appId: {
    type: string;
  };
  pageIds: {
    type: string[];
  };
}

export interface IIntegrationMessengerOnlineHours {
  day: string;
  from: string;
  to: string;
}

export interface IIntegrationLink {
  twitter?: string;
  facebook?: string;
  youtube?: string;
}

export interface IIntegrationMessengerDataMessagesItem {
  greetings: { title?: string; message?: string };
  away?: string;
  thank?: string;
  welcome?: string;
}

export interface IIntegrationMessengerData {
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
  supporterIds: string[];
  notifyCustomer: boolean;
  knowledgeBaseTopicId: string;
  formCode: string;
  websiteApps?: IWebsiteApp[];
  availabilityMethod: string;
  isOnline: boolean;
  requireAuth: boolean;
  showChat: boolean;
  showLauncher: boolean;
  forceLogoutWhenResolve: boolean;
  showVideoCallRequest: boolean;
  onlineHours: IIntegrationMessengerOnlineHours[];
  timezone?: string;
  messages?: IIntegrationMessengerDataMessagesItem;
  links?: IIntegrationLink;
}

export interface IIntegrationLeadData {
  loadType: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string[];
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankContent?: string;
  redirectUrl?: string;
  themeColor?: string;
  callout?: ICallout;
  rules?: IRule;
  isRequireOnce?: boolean;
}

export interface IIntegrationUiOptions {
  color: string;
  textColor?: string;
  wallpaper: string;
  logo: string;
  showVideoCallRequest: boolean;
}

export interface IIntegration {
  _id: string;
  kind: string;
  name: string;
  brandId: string;
  languageCode?: string;
  tagIds?: string[];
  formId: string;
  leadData: IIntegrationLeadData;
  messengerData: IIntegrationMessengerData;
  twitterData: IIntegrationTwitterData;
  facebookData: IIntegrationFacebookData;
  uiOptions: IIntegrationUiOptions;
}
export interface IRule {
  _id: string;
  kind?: string;
  text: string;
  condition: string;
  value: string;
}

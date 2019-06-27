export type ENV = {
  MAIN_API_URL: string;
  API_GRAPHQL_URL: string;
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
  supporterIds: string[];
  notifyCustomer: boolean;
  knowledgeBaseTopicId: string;
  formCode: string;
  availabilityMethod: string;
  isOnline: boolean;
  requireAuth: boolean;
  forceLogoutWhenResolve: boolean;
  onlineHours: IIntegrationMessengerOnlineHours[];
  timezone?: string;
  messages?: IIntegrationMessengerDataMessagesItem;
  links?: IIntegrationLink;
}

export interface IIntegrationFormData {
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
}

export interface IIntegrationUiOptions {
  color: string;
  wallpaper: string;
  logo: string;
}

export interface IIntegration {
  _id: string;
  kind: string;
  name: string;
  brandId: string;
  languageCode?: string;
  tagIds?: string[];
  formId: string;
  formData: IIntegrationFormData;
  messengerData: IIntegrationMessengerData;
  twitterData: IIntegrationTwitterData;
  facebookData: IIntegrationFacebookData;
  uiOptions: IIntegrationUiOptions;
}

export interface IDealProductInput {
  productName: string;
  uom: string;
  currency: string;
  quantity: number;
  unitPrice: number;
  taxPercent?: number;
  tax?: number;
  discountPercent?: number;
  discount?: number;
  amount?: number;
}

export interface IDealInput {
  name: string;
  boardName: string;
  pipelineName: string;
  stageName: string;
  userEmail: string;
  companyIds?: string[];
  customerEmail?: string;
  description?: string;
  productsData: IDealProductInput;
}

export interface IRule {
  _id: string;
  kind?: string;
  text: string;
  condition: string;
  value: string;
}

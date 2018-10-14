import {
  ICustomer,
  IIntegrationMessengerData,
  IIntegrationUiOptions,
  IParticipator,
  IUser
} from "../types";

export interface IEngageData {
  content: string;
  kind: string;
  sentAs: string;
  fromUser: IUser;
  messageId: string;
  brandId: string;
}

export interface IAttachment {
  name: string;
  url: string;
}

export interface IMessengerAppData {
  customer: ICustomer;
  hangoutLink: string;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  user?: IUser;
  content: string;
  createdAt: Date;
  internal?: boolean;
  engageData: IEngageData;
  messengerAppData: IMessengerAppData;
  attachments: IAttachment[];
}

export interface IConversation {
  _id: string;
  content: string;
  createdAt: Date;
  participatedUsers?: IParticipator[];
  messages: IMessage[];
  isOnline: boolean;
  supporters?: IUser[];
}

export interface IConnectResponse {
  integrationId: string;
  customerId: string;
  languageCode: string;
  messengerData: IIntegrationMessengerData;
  uiOptions: IIntegrationUiOptions;
}

// faq
interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

export interface IFaqArticle extends ICommonFields {
  _id: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  author: IUser;
}

export interface IFaqCategory extends ICommonFields {
  _id: string;
  title: string;
  description: string;
  articleIds: string[];
  icon: string;

  authors: IUser[];
  articles: IFaqArticle[];
  numOfArticles: number;
}

export interface IFaqTopic extends ICommonFields {
  _id: string;
  title: string;
  description: string;
  brandId: string;
  categoryIds: string[];
  color: string;
  languageCode?: string;

  categories: IFaqCategory[];
}

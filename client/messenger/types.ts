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
  _id: string;
  title: string;
}

export interface IFaqArticle extends ICommonFields {
  summary: string;
  content: string;
  status: string;
  createdDate: Date;
}

export interface IFaqCategory extends ICommonFields {
  description: string;
  icon: string;
  createdDate: Date;

  articles: IFaqArticle[];
  numOfArticles: number;
}

export interface IFaqTopic extends ICommonFields {
  description: string;
  categories: IFaqCategory[];
}

//lead
export interface IField {
  _id: string;
  contentType: string;
  contentTypeId: string;
  type: string;
  validation?: string;
  text: string;
  description?: string;
  options?: string[];
  isRequired: boolean;
  isDefinedByErxes: boolean;
  order: number;
  groupId: string;
  isVisible: boolean;
  lastUpdatedUserId: string;
}

export interface IForm {
  _id: string;
  title: string;
  code: string;
  description?: string;
  buttonText?: string;
  createdUserId: string;
  fields: IField[];
}

export type FieldValue = string | number | Date | string[];

export interface IFieldError {
  fieldId: string;
  code: string;
  text: string;
}

export interface ICurrentStatus {
  status: string;
  errors?: IFieldError[];
}

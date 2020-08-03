import {
  ICustomer,
  IIntegrationMessengerData,
  IIntegrationUiOptions,
  IParticipator,
  IUser
} from "../types";

export interface IWebsiteApp {
  kind: string;
  name: string;
  credentials: {
    buttonText: string;
    description: string;
    url: string;
  };
}

export interface IEngageData {
  content: string;
  kind: string;
  sentAs: string;
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

export interface IVideoCallData {
  url: string;
  name?: string;
  status?: string;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  user?: IUser;
  content: string;
  contentType?: string;
  dailyStatus?: string;
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

export interface IUpdateCustomerMutationVariables {
  _id: string;
  email: string;
}

export interface IUpdateCustomerMutationResponse {
  updateCustomerMutation: (
    params: { variables: IUpdateCustomerMutationVariables }
  ) => Promise<any>;
  refetch: () => void;
}

export interface IMessengerSupporters {
  supporters: [IUser];
  isOnline: boolean;
  serverTime: string;
}

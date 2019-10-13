import { IAttachments, IEmail, ILabels, INylasConversationMessage } from './models';

export interface IFilter {
  [key: string]: string;
}

interface ICommonType {
  name?: string;
  email?: string;
}

export interface INylasAttachment {
  name: string;
  path: string;
  type: string;
  accessToken: string;
}

export interface IMessageDraft {
  to?: ICommonType[];
  from?: ICommonType[];
  cc?: ICommonType[];
  bcc?: ICommonType[];
  replyToMessageId?: string;
  threadId?: string;
  files: [INylasAttachment];
  subject: string;
  body?: string;
}

export interface IGetOrCreateArguments {
  kind: string;
  collectionName: string;
  selector: { [key: string]: string };
  fields: {
    doc: { [key: string]: string | string[] | IEmail[] | IAttachments[] | ILabels[] };
    api: IAPIConversation | IAPIConversationMessage | IAPICustomer;
  };
}

export interface IIntegrateProvider {
  email: string;
  kind: string;
  settings: IProviderSettings;
  scope?: string;
}

export interface IProviderSettings {
  redirect_uri?: string;
  google_refresh_token?: string;
  google_client_id?: string;
  google_client_secret?: string;
  email?: string;
  password?: string;
}

// API ====================
export interface IAPICustomer {
  emails: string[];
  primaryEmail: string;
  integrationId: string;
  firstName: string;
  lastName: string;
  kind: string;
}

export interface IAPIConversation {
  integrationId: string;
  customerId: string;
  content: string;
}

export interface IAPIConversationMessage {
  conversationId: string;
  customerId: string;
  content: string;
}

// Store =======================
export interface INylasAccountArguments {
  kind: string;
  email: string;
  accountId: string;
  accessToken: string;
}

export interface INylasCustomerArguments {
  kind: string;
  toEmail: string;
  message: any;
  integrationIds: {
    id: string;
    erxesApiId: string;
  };
}

export interface INylasConversationArguments {
  kind: string;
  customerId: string;
  message: INylasConversationMessage;
  emails: {
    toEmail: string;
    fromEmail: string;
  };
  integrationIds: {
    id: string;
    erxesApiId: string;
  };
}

export interface INylasConversationMessageArguments {
  kind: string;
  customerId: string;
  conversationIds: {
    id: string;
    erxesApiId: string;
  };
  message: INylasConversationMessage & { id: string };
}

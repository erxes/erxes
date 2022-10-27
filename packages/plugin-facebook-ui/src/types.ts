import { QueryResponse } from '@erxes/ui/src/types';

export interface IAccount {
  _id: string;
  name: string;
  kind: string;
  id: string;
}

export type AccountsQueryResponse = {
  facebookGetAccounts: IAccount[];
  error?: Error;
} & QueryResponse;

export interface IConversationMessage {
  content: string;
  attachments?: any;
  conversationId: string;
  fromBot?: boolean;
  customerId?: string;
  userId?: string;
  isCustomerRead?: boolean;
  botData?: any;

  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MessagesQueryResponse = {
  facebookConversationMessages: IConversationMessage[];
  fetchMore: (variables) => void;
} & QueryResponse;

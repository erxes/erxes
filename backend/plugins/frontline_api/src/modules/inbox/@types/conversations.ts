import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  ICustomField,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface IConversation {
  skillId?: string;
  operatorStatus?: string;
  content?: string;
  integrationId?: string;
  customerId?: string;
  visitorId?: string;
  userId?: string;
  assignedUserId?: string;
  participatedUserIds?: string[];
  userRelevance?: string;
  readUserIds?: string[];

  createdAt?: Date;
  updatedAt?: Date;
  closedAt?: Date;
  closedUserId?: string;

  status?: string;
  messageCount?: number;
  tagIds?: string[];

  // number of total conversations
  number?: number;

  firstRespondedUserId?: string;
  firstRespondedDate?: Date;

  isCustomerRespondedLast?: boolean;
  customFieldsData?: ICustomField[];
  isBot?: boolean;
  botId?: string;
}

// Conversation schema
export interface IConversationDocument extends IConversation, Document {
  _id: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

export interface IConversationListParams
  extends IListParams,
    ICursorPaginateParams,
    IConversation {
  limit?: number;
  channelId?: string;
  status?: string;
  unassigned?: string;
  awaitingResponse?: string;
  tag?: string;
  integrationType?: string;
  participating?: string;
  starred?: string;
  ids?: string[];
  startDate?: string;
  endDate?: string;
  only?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  segment?: string;
  searchValue?: string;
  skip?: number;
}

interface ICountBy {
  [index: string]: number;
}

export interface IConversationRes {
  [index: string]: number | ICountBy;
}

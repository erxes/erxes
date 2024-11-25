import { QueryResponse } from '@erxes/ui/src/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IUser } from '@erxes/ui/src/auth/types';

export interface IAccount {
  _id: string;
  name: string;
  kind: string;
  id: string;
}

interface IWhatsappCustomer {
  _id: string;
  userId: string;
  erxesApiId: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  integrationId: string;
}

export type AccountsQueryResponse = {
  whatsappGetAccounts: IAccount[];
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
  internal?: boolean;

  _id: string;
  createdAt: Date;
  updatedAt: Date;

  user?: IUser;
  customer: ICustomer;
}

export type MessagesQueryResponse = {
  whatsappConversationMessages: IConversationMessage[];
  fetchMore: (variables) => void;
} & QueryResponse;

export type MessagesTotalCountQuery = {
  loading: boolean;
  whatsappConversationMessagesCount: number;
};

export interface IWhatsappComment {
  _id: string;
  postId: string;
  conversationId: string;
  parentId: string;
  commentId: string;
  content: string;
  attachments: string[];
  commentCount: number;
  timestamp: Date;
  customer: IWhatsappCustomer;
  isResolved: boolean;
  permalink_url: string;
}

export type WhatsappCommentsCountQueryResponse = {
  whatsappGetCommentCount: any;
  fetchMore: (variables) => void;
} & QueryResponse;

export type WhatsappCommentsQueryResponse = {
  whatsappGetComments: IWhatsappComment[];
  fetchMore: (variables) => void;
} & QueryResponse;

export type ReplyWhatsappCommentMutationVariables = {
  conversationId: string;
  commentId: string;
  content: string;
};

export type ReplyWhatsappCommentMutationResponse = {
  replyMutation: (doc: {
    variables: ReplyWhatsappCommentMutationVariables;
  }) => Promise<any>;
};

export type ResolveWhatsappCommentMutationVariables = {
  commentId: string;
};

export type ResolveWhatsappCommentResponse = {
  resolveMutation: (doc: {
    variables: ResolveWhatsappCommentMutationVariables;
  }) => Promise<any>;
};

export type TaggedMessagesQueryResponse = {
  whatsappHasTaggedMessages: boolean;
} & QueryResponse;

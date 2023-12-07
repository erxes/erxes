import { QueryResponse } from '@erxes/ui/src/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IUser } from '@erxes/ui/src/auth/types';

export interface IAccount {
  _id: string;
  name: string;
  kind: string;
  id: string;
}

interface IInstagramCustomer {
  _id: string;
  userId: string;
  erxesApiId: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  integrationId: string;
}

export type AccountsQueryResponse = {
  instagramGetAccounts: IAccount[];
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
  instagramConversationMessages: IConversationMessage[];
  fetchMore: (variables) => void;
} & QueryResponse;

export type MessagesTotalCountQuery = {
  loading: boolean;
  instagramConversationMessagesCount: number;
};

export interface IInstagramComment {
  _id: string;
  postId: string;
  conversationId: string;
  parentId: string;
  commentId: string;
  content: string;
  attachments: string[];
  commentCount: number;
  timestamp: Date;
  customer: IInstagramCustomer;
  isResolved: boolean;
  permalink_url: string;
}

export type InstagramCommentsCountQueryResponse = {
  instagramGetCommentCount: any;
  fetchMore: (variables) => void;
} & QueryResponse;

export type InstagramCommentsQueryResponse = {
  instagramGetComments: IInstagramComment[];
  fetchMore: (variables) => void;
} & QueryResponse;

export type ReplyInstagRamCommentMutationVariables = {
  conversationId: string;
  commentId: string;
  content: string;
};

export type ReplyInstagramCommentMutationResponse = {
  replyMutation: (doc: {
    variables: ReplyInstagRamCommentMutationVariables;
  }) => Promise<any>;
};

export type ResolveInstagramCommentMutationVariables = {
  commentId: string;
};

export type ResolveInstagramCommentResponse = {
  resolveMutation: (doc: {
    variables: ResolveInstagramCommentMutationVariables;
  }) => Promise<any>;
};

export type TaggedMessagesQueryResponse = {
  instagramHasTaggedMessages: boolean;
} & QueryResponse;

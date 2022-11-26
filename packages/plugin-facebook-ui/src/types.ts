import { QueryResponse } from '@erxes/ui/src/types';
import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';

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

export type MessagesTotalCountQuery = {
  loading: boolean;
  facebookConversationMessagesCount: number;
};

export interface IFacebookPost {
  postId: string;
  recipientId: string;
  senderId: string;
  content: string;
  erxesApiId?: string;
  attachments: string[];
  timestamp: Date;
  permalink_url: string;
}

export interface IFacebookComment {
  _id: string;
  postId: string;
  conversationId: string;
  parentId: string;
  commentId: string;
  content: string;
  attachments: string[];
  commentCount: number;
  timestamp: Date;
  customer: ICustomer;
  isResolved: boolean;
  permalink_url: string;
}

export type FacebookCommentsCountQueryResponse = {
  facebookGetCommentCount: any;
  fetchMore: (variables) => void;
} & QueryResponse;

export type FacebookCommentsQueryResponse = {
  facebookGetComments: IFacebookComment[];
  fetchMore: (variables) => void;
} & QueryResponse;

export type ReplyFaceBookCommentMutationVariables = {
  conversationId: string;
  commentId: string;
  content: string;
};

export type ReplyFacebookCommentMutationResponse = {
  replyMutation: (doc: {
    variables: ReplyFaceBookCommentMutationVariables;
  }) => Promise<any>;
};

export type ResolveFacebookCommentMutationVariables = {
  commentId: string;
};

export type ResolveFacebookCommentResponse = {
  resolveMutation: (doc: {
    variables: ResolveFacebookCommentMutationVariables;
  }) => Promise<any>;
};

export interface IFbConversation extends IConversation {
  facebookPost?: IFacebookPost;
}

export type FacebookPostQueryResponse = {
  facebookGetPost: IFacebookPost;
} & QueryResponse;

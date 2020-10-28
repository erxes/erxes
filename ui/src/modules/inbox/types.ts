import { QueryResponse } from 'modules/common/types';
import { IUser } from '../auth/types';
import { ICustomer } from '../customers/types';
import { IIntegration } from '../settings/integrations/types';
import { ITag } from '../tags/types';

export interface IVideoCallData {
  url: string;
  name?: string;
  status?: string;
}

export interface IConversation {
  _id: string;
  content?: string;
  integrationId: string;
  customerId?: string;
  userId?: string;
  assignedUserId?: string;
  participatedUserIds?: string[];
  readUserIds?: string[];
  createdAt: Date;

  closedAt?: Date;
  closedUserId?: string;

  status?: string;
  messageCount?: number;
  tagIds?: string[];

  // number of total conversations
  number?: number;

  integration: IIntegration;
  customer: ICustomer;
  assignedUser: IUser;
  participatedUsers?: IUser[];
  tags: ITag[];
  updatedAt: Date;
  idleTime: number;
  facebookPost?: IFacebookPost;
  callProAudio?: string;
  videoCallData?: IVideoCallData;

  productBoardLink?: string;
}

interface IEngageDataRules {
  kind: string;
  text: string;
  condition: string;
  value?: string;
}

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

export interface IEmail {
  name: string;
  email: string;
}

export interface IMail {
  integrationEmail: string;
  messageId?: string;
  replyTo?: string;
  inReplyTo?: string;
  headerId?: string;
  accountId?: string;
  replyToMessageId?: string;
  from: IEmail[];
  to: IEmail[];
  cc?: IEmail[];
  bcc?: IEmail[];
  reply?: string;
  references?: string;
  threadId?: string;
  subject?: string;
  body?: string;
  attachments?: IMailAttachment[];
}

export interface IMailAttachment {
  id?: string;
  filename?: string;
  content_type?: string;
  mimeType?: string;
  size: number;
  attachmentId: string;
  data?: string;
}

export interface IEngageData {
  messageId: string;
  brandId: string;
  content: string;
  fromUserId: string;
  kind: string;
  sentAs: string;
  rules?: IEngageDataRules[];
}

export interface ICarouselButton {
  type: string;
  title: string;
  text: string;
  payload: string;
  url?: string;
}
export interface ICarouselItem {
  title: string;
  picture?: string;
  subtitle?: string;
  buttons?: ICarouselButton[];
}

export interface IBotData {
  type: string;
  text?: string;
  title?: string;
  url?: string;
  fromCustomer?: boolean;
  module?: string;
  component: string;
  elements?: ICarouselItem[];
  quick_replies?: [
    {
      title: string;
      payload: string;
    }
  ];
  wrapped?: {
    type: string;
    text: string;
    typing: boolean;
  };
}

export interface IMessage {
  content: string;
  videoCallData?: IVideoCallData;
  attachments?: any;
  mentionedUserIds?: string[];
  conversationId: string;
  internal?: boolean;
  fromBot?: boolean;
  contentType?: string;
  customerId?: string;
  userId?: string;
  isCustomerRead?: boolean;
  formWidgetData?: any;
  messengerAppData?: any;
  botData?: any;
  engageData?: IEngageData;
  mailData?: IMail;

  _id: string;
  user?: IUser;
  customer?: ICustomer;
  createdAt: Date;
  updatedAt: Date;
}

// mutation types
export type MarkAsReadMutationResponse = {
  markAsReadMutation: (doc: { variables: { _id: string } }) => Promise<any>;
};

export type ReplyMutationResponse = {
  replyMutation: (doc: {
    variables: AddMessageMutationVariables;
  }) => Promise<any>;
};

export type AddMessageMutationVariables = {
  conversationId: string;
  content: string;
  contentType?: string;
  mentionedUserIds?: string[];
  internal?: boolean;
  attachments?: any;
};

export type AddMessageMutationResponse = {
  addMessageMutation: (doc: {
    variables: AddMessageMutationVariables;
    optimisticResponse: any;
    update: any;
  }) => Promise<any>;
};

export type AssignMutationVariables = {
  conversationIds?: string[];
  assignedUserId: string;
};

export type AssignMutationResponse = {
  assignMutation: (doc: { variables: AssignMutationVariables }) => Promise<any>;
};

export type UnAssignMutationVariables = {
  _ids: string[];
};

export type UnAssignMutationResponse = {
  conversationsUnassign: (doc: {
    variables: UnAssignMutationVariables;
  }) => Promise<any>;
};

export type ChangeStatusMutationVariables = {
  _ids: string[];
  status: boolean;
};

export type ChangeStatusMutationResponse = {
  changeStatusMutation: (doc: {
    variables: ChangeStatusMutationVariables;
  }) => Promise<any>;
};

export type CreateProductBoardMutationVariables = {
  _id: string;
};

export type CreateProductBoardMutationResponse = {
  createProductBoardMutation: (doc: {
    variables: CreateProductBoardMutationVariables;
  }) => Promise<any>;
};

export type ResolveAllMutationVariables = {
  channelId: string;
  status: string;
  unassigned: string;
  awaitingResponse: string;
  brandId: string;
  tag: string;
  integrationType: string;
  participating: string;
  starred: string;
  startDate: string;
  endDate: string;
};

export type ResolveAllMutationResponse = {
  resolveAllMutation: (doc: {
    variables: ResolveAllMutationVariables;
  }) => Promise<any>;
};

// query types
export type ConvesationsQueryVariables = {
  limit: number;
} & ResolveAllMutationVariables;

export type LastConversationQueryResponse = {
  conversationsGetLast: IConversation;
} & QueryResponse;

export type ConversationsQueryResponse = {
  conversations: IConversation[];
  subscribeToMore: (variables) => void;
} & QueryResponse;

export type ConversationDetailQueryResponse = {
  conversationDetail: IConversation;
} & QueryResponse;

export type MessagesQueryResponse = {
  conversationMessages: IMessage[];
  fetchMore: (variables) => void;
} & QueryResponse;

export type MessagesTotalCountQuery = {
  loading: boolean;
  conversationMessagesTotalCount: number;
};

export type ConversationsTotalCountQueryResponse = {
  conversationsTotalCount: number;
} & QueryResponse;

export type UnreadConversationsTotalCountQueryResponse = {
  conversationsTotalUnreadCount: number;
  subscribeToMore: (variables) => void;
} & QueryResponse;

export type FacebookCommentsQueryResponse = {
  converstationFacebookComments: IFacebookComment[];
  fetchMore: (variables) => void;
} & QueryResponse;

export type FacebookCommentsCountQueryResponse = {
  converstationFacebookCommentsCount: any;
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

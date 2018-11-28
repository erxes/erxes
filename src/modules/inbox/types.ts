import { IUser } from '../auth/types';
import { ICustomer } from '../customers/types';
import { IIntegration, IMessengerApp } from '../settings/integrations/types';
import { ITag } from '../tags/types';

export interface ITwitterData {
  id: number;
  id_str: string;
  created_at?: string;
  isDirectMessage?: boolean;

  // media content
  entities?: any;
  extended_entities?: any;
  extended_tweet?: any;

  // direct message
  sender_id?: number;
  sender_id_str?: string;
  recipient_id?: number;
  recipient_id_str?: string;

  // timeline
  in_reply_to_status_id?: number;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id?: number;
  in_reply_to_user_id_str?: string;
  in_reply_to_screen_name?: string;
  is_quote_status?: boolean;
  favorited?: boolean;
  retweeted?: boolean;
  quote_count?: number;
  reply_count?: number;
  retweet_count?: number;
  favorite_count?: number;
}

export interface IConversationFacebookData {
  kind?: string;
  senderName: string;
  senderId: string;
  recipientId?: string;

  // when wall post
  postId?: string;

  pageId?: string;
}

export interface IGmailAttachment {
  filename?: string;
  mimeType?: string;
  size: number;
  attachmentId: string;
}

export interface IGmailDataAttachment {
  data?: string;
  size: number;
}

export interface IConversationGmailData {
  messageId?: string;
  headerId?: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  reply?: string;
  references?: string;
  threadId?: string;
  subject?: string;
  textPlain?: string;
  textHtml?: string;
  attachments?: IGmailAttachment[];
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
  twitterData?: ITwitterData;
  facebookData?: IConversationFacebookData;
  gmailData?: IConversationGmailData;

  integration: IIntegration;
  customer: ICustomer;
  assignedUser: IUser;
  participatedUsers?: IUser[];
  tags: ITag[];
  updatedAt: Date;
  idleTime: number;
}

export interface IFbUser {
  id: string;
  name: string;
}

export interface IReactions {
  like?: IFbUser[];
  love?: IFbUser[];
  wow?: IFbUser[];
  haha?: IFbUser[];
  sad?: IFbUser[];
  angry?: IFbUser[];
}

export interface IMessageFacebookData {
  postId?: string;
  commentId?: string;
  parentId?: string;
  isPost?: boolean;
  reactions?: IReactions;
  likeCount?: number;
  commentCount?: number;
  messageId?: string;
  item?: string;
  photo?: string;
  video?: string;
  photos?: string[];
  link?: string;
  senderId: string;
  senderName: string;
}

interface IEngageDataRules {
  kind: string;
  text: string;
  condition: string;
  value?: string;
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

export interface IMessage {
  content: string;
  attachments?: any;
  mentionedUserIds?: string[];
  conversationId: string;
  internal?: boolean;
  customerId?: string;
  userId?: string;
  isCustomerRead?: boolean;
  formWidgetData?: any;
  messengerAppData?: any;
  engageData?: IEngageData;
  facebookData?: IMessageFacebookData;
  twitterData?: ITwitterData;
  gmailData?: IConversationGmailData;
  gmailDataAttachments?: IGmailDataAttachment[];

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
  replyMutation: (
    doc: {
      variables: AddMessageMutationVariables;
    }
  ) => Promise<any>;
};

export type ExecuteAppMutationVariables = {
  _id: string;
  conversationId: string;
};

export type ExecuteAppMutationResponse = {
  executeAppMutation: (
    doc: { variables: ExecuteAppMutationVariables }
  ) => Promise<any>;
};

export type ReplyTweetMutationResponse = {
  replyTweetMutation: (
    doc: {
      variables: AddMessageMutationVariables;
    }
  ) => Promise<any>;
};

export type FavoriteTweetMutationVariables = {
  integrationId: string;
  id: string;
};

export type FavoriteTweetMutationResponse = {
  favoriteTweetMutation: (
    doc: { variables: FavoriteTweetMutationVariables }
  ) => Promise<any>;
};

export type RetweetMutationVariables = {
  integrationId: string;
  id: string;
};

export type RetweetMutationResponse = {
  retweetMutation: (
    doc: {
      variables: RetweetMutationVariables;
    }
  ) => Promise<any>;
};

export type TweetMutationVariables = {
  integrationId: string;
  text: string;
};

export type TweetMutationResponse = {
  tweetMutation: (
    doc: {
      variables: TweetMutationVariables;
    }
  ) => Promise<any>;
};

export type AddMessageMutationVariables = {
  conversationId: string;
  content: string;
  mentionedUserIds?: string[];
  internal?: boolean;
  attachments?: any;
  tweetReplyToId?: string;
  tweetReplyToScreenName?: string;
  commentReplyToId?: string;
};

export type AddMessageMutationResponse = {
  addMessageMutation: (
    doc: {
      variables: AddMessageMutationVariables;
      optimisticResponse: any;
      update: any;
    }
  ) => Promise<any>;
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
  conversationsUnassign: (
    doc: { variables: UnAssignMutationVariables }
  ) => Promise<any>;
};

export type ChangeStatusMutationVariables = {
  _ids: string[];
  status: boolean;
};

export type ChangeStatusMutationResponse = {
  changeStatusMutation: (
    doc: { variables: ChangeStatusMutationVariables }
  ) => Promise<any>;
};

// query types

export type ConvesationsQueryVariables = {
  limit: number;
  channelId: string;
  status: string;
  unassigned: string;
  brandId: string;
  tag: string;
  integrationType: string;
  participating: string;
  starred: string;
  startDate: string;
  endDate: string;
};

export type LastConversationQueryResponse = {
  conversationsGetLast: IConversation;
  loading: boolean;
  refetch: () => void;
};

export type ConversationsQueryResponse = {
  conversations: IConversation[];
  loading: boolean;
  refetch: () => void;
  subscribeToMore: (variables) => void;
};

export type ConversationDetailQueryResponse = {
  conversationDetail: IConversation;
  loading: boolean;
  refetch: () => void;
};

export type MessagesQueryResponse = {
  conversationMessages: IMessage[];
  loading: boolean;
  refetch: () => void;
  fetchMore: (variables) => void;
};

export type MessagesTotalCountQuery = {
  loading: boolean;
  conversationMessagesTotalCount: number;
};

export type ConversationsTotalCountQueryResponse = {
  conversationsTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

export type UnreadConversationsTotalCountQueryResponse = {
  conversationsTotalUnreadCount: number;
  loading: boolean;
  refetch: () => void;
  subscribeToMore: (variables) => void;
};

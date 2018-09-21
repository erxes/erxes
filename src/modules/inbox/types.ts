import { IUser } from "../auth/types";
import { ICustomer } from "../customers/types";
import { IIntegration } from "../settings/integrations/types";
import { ITag } from "../tags/types";

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

  integration: IIntegration;
  customer: ICustomer;
  assignedUser: IUser;
  participatedUsers?: IUser[];
  tags: ITag[];
  updatedAt: Date;
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

  _id: string;
  user?: IUser;
  customer?: ICustomer;
  createdAt: Date;
  updatedAt: Date;
}

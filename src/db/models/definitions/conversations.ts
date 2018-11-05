import { Document, Schema } from "mongoose";
import { field } from "../utils";
import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from "./constants";

export interface ITwitterResponse {
  id?: number;
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

export interface ITwitterResponseDocument extends ITwitterResponse, Document {
  id?: number;
}

export interface IFacebook {
  kind?: string;
  senderName?: string;
  senderId?: string;
  recipientId?: string;

  // when wall post
  postId?: string;

  pageId?: string;
}

export interface IFacebookDocument extends IFacebook, Document {}

export interface IConversation {
  content?: string;
  integrationId: string;
  customerId?: string;
  userId?: string;
  assignedUserId?: string;
  participatedUserIds?: string[];
  readUserIds?: string[];

  closedAt?: Date;
  closedUserId?: string;

  status?: string;
  messageCount?: number;
  tagIds?: string[];

  // number of total conversations
  number?: number;
  twitterData?: ITwitterResponse;
  facebookData?: IFacebook;
}

// Conversation schema
export interface IConversationDocument extends IConversation, Document {
  _id: string;
  twitterData?: ITwitterResponseDocument;
  facebookData?: IFacebookDocument;
  createdAt: Date;
  updatedAt: Date;
}

/*
 * Twitter response schema
 * Using in conversation, conversation message
 * Saving fields with underscores because, we want to store it exactly
 * like twitter response so that we can use it in findParentTweets helper to
 * not send extra request to twitter
 */
export const twitterResponseSchema = new Schema(
  {
    id: field({ type: Number, optional: true }),
    id_str: field({ type: String }),
    created_at: field({ type: Date, optional: true }),
    isDirectMessage: field({ type: Boolean }),

    // media content
    entities: field({ type: Object, optional: true }),
    extended_entities: field({ type: Object, optional: true }),
    extended_tweet: field({ type: Object, optional: true }),

    // direct message
    sender_id: field({ type: Number }),
    sender_id_str: field({ type: String }),
    recipient_id: field({ type: Number }),
    recipient_id_str: field({ type: String }),

    // timeline
    in_reply_to_status_id: field({ type: Number, optional: true }),
    in_reply_to_status_id_str: field({ type: String, optional: true }),
    in_reply_to_user_id: field({ type: Number, optional: true }),
    in_reply_to_user_id_str: field({ type: String, optional: true }),
    in_reply_to_screen_name: field({ type: String, optional: true }),
    is_quote_status: field({ type: Boolean }),
    favorited: field({ type: Boolean }),
    retweeted: field({ type: Boolean }),
    quote_count: field({ type: Number, optional: true }),
    reply_count: field({ type: Number, optional: true }),
    retweet_count: field({ type: Number, optional: true }),
    favorite_count: field({ type: Number, optional: true })
  },
  { _id: false }
);

// facebook schema
const facebookSchema = new Schema(
  {
    kind: field({
      type: String,
      enum: FACEBOOK_DATA_KINDS.ALL
    }),
    senderName: field({
      type: String
    }),
    senderId: field({
      type: String
    }),
    recipientId: field({
      type: String
    }),

    // when wall post
    postId: field({
      type: String
    }),

    pageId: field({
      type: String
    })
  },
  { _id: false }
);

// Conversation schema
export const conversationSchema = new Schema({
  _id: field({ pkey: true }),
  content: field({ type: String }),
  integrationId: field({ type: String }),
  customerId: field({ type: String }),
  userId: field({ type: String }),
  assignedUserId: field({ type: String }),
  participatedUserIds: field({ type: [String] }),
  readUserIds: field({ type: [String] }),
  createdAt: field({ type: Date }),
  updatedAt: field({ type: Date }),

  closedAt: field({
    type: Date,
    optional: true
  }),

  closedUserId: field({
    type: String,
    optional: true
  }),

  status: field({
    type: String,
    enum: CONVERSATION_STATUSES.ALL
  }),
  messageCount: field({ type: Number }),
  tagIds: field({ type: [String] }),

  // number of total conversations
  number: field({ type: Number }),
  twitterData: field({ type: twitterResponseSchema }),
  facebookData: field({ type: facebookSchema })
});

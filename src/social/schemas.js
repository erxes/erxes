import mongoose from 'mongoose';
import { field } from '../db/models/utils';

export const TwitterSchema = mongoose.Schema(
  {
    info: {
      type: Object,
    },
    token: {
      type: String,
    },
    tokenSecret: {
      type: String,
    },
  },
  { _id: false },
);

export const FacebookSchema = mongoose.Schema(
  {
    appId: {
      type: String,
    },
    pageIds: {
      type: [String],
    },
  },
  { _id: false },
);

const TwitterDirectMessageSchema = mongoose.Schema(
  {
    senderId: field({
      type: Number,
    }),
    senderIdStr: field({
      type: String,
    }),
    recipientId: field({
      type: Number,
    }),
    recipientIdStr: field({
      type: String,
    }),
  },
  { _id: false },
);

const TwitterTimelineSchema = mongoose.Schema(
  {
    inReplyToStatusId: field({ type: Number, optional: true }),
    inReplyToStatusIdStr: field({ type: String, optional: true }),
    inReplyToUserId: field({ type: Number, optional: true }),
    inReplyToUserIdStr: field({ type: String, optional: true }),
    inReplyToScreenName: field({ type: String, optional: true }),
    isQuoteStatus: field({ type: Boolean }),
    favorited: field({ type: Boolean }),
    retweeted: field({ type: Boolean }),
    quoteCount: field({ type: Number, optional: true }),
    replyCount: field({ type: Number, optional: true }),
    retweetCount: field({ type: Number, optional: true }),
    favoriteCount: field({ type: Number, optional: true }),
  },
  { _id: false },
);

/*
 * Twitter response schema
 * Using in conversation, conversation message
 */
export const TwitterResponseSchema = mongoose.Schema(
  {
    id: field({
      type: Number,
      optional: true,
    }),
    idStr: field({
      type: String,
    }),
    isDirectMessage: field({
      type: Boolean,
    }),

    // media content
    entities: field({ type: Object, optional: true }),
    extendedEntities: field({ type: Object, optional: true }),

    timeline: field({
      type: TwitterTimelineSchema,
    }),

    directMessage: field({
      type: TwitterDirectMessageSchema,
    }),
  },
  { _id: false },
);

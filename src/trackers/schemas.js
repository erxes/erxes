import mongoose from 'mongoose';
import { field } from '../db/models/utils';
import { FACEBOOK_DATA_KINDS } from '../data/constants';

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

/*
 * Twitter response schema
 * Using in conversation, conversation message
 * Saving fields with underscores because, we want to store it exactly
 * like twitter response so that we can use it in findParentTweets helper to
 * not send extra request to twitter
 */
export const TwitterResponseSchema = mongoose.Schema(
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
    favorite_count: field({ type: Number, optional: true }),
  },
  { _id: false },
);

export const FacebookResponseSchema = mongoose.Schema(
  {
    kind: field({ type: String, enum: FACEBOOK_DATA_KINDS.ALL }),

    // messenger
    senderName: field({ type: String }),
    senderId: field({ type: String }),
    recipientId: field({ type: String }),

    // when wall post
    postId: field({ type: String }),
    pageId: field({ type: String }),

    // post details
    caption: field({ type: String, optional: true }),
    created_time: field({ type: String, optional: true }),
    description: field({ type: String, optional: true }),
    full_picture: field({ type: String, optional: true }),
    link: field({ type: String, optional: true }),
    message: field({ type: String, optional: true }),
    message_tags: field({ type: String, optional: true }),
    name: field({ type: String, optional: true }),
    permalink_url: field({ type: String, optional: true }),
    properties: field({ type: String, optional: true }),

    // comment details
    comment_post_id: field({ type: String, optional: true }),
    comment_parent_id: field({ type: String, optional: true }),
  },
  { _id: false },
);

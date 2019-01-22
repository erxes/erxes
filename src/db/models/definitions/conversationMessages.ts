import { Document, Schema } from "mongoose";
import { field } from "../utils";
import {
  ITwitterResponse,
  ITwitterResponseDocument,
  twitterResponseSchema
} from "./conversations";

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

export interface IFacebook {
  createdTime?: string;
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
  senderId?: string;
  senderName?: string;
}

export interface IGmailAttachment {
  filename?: string;
  mimeType?: string;
  size: number;
  attachmentId: string;
}

export interface IGmail {
  threadId?: string;
  messageId?: string;
  headerId?: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  reply?: string;
  refrences?: string;
  subject?: string;
  textPlain?: string;
  textHtml?: string;
  attachments?: IGmailAttachment[];
  labelIds?: string[];
}

interface IFacebookDataDocument extends IFacebook, Document {}
interface IGmailDataDocument extends IGmail, Document {}

interface IEngageDataRules {
  kind: string;
  text: string;
  condition: string;
  value?: string;
}

interface IEngageDataRulesDocument extends IEngageDataRules, Document {}

export interface IEngageData {
  messageId: string;
  brandId: string;
  content: string;
  fromUserId: string;
  kind: string;
  sentAs: string;
  rules?: IEngageDataRules[];
}

interface IEngageDataDocument extends IEngageData, Document {
  rules?: IEngageDataRulesDocument[];
}

export interface IMessage {
  content?: string;
  attachments?: any;
  mentionedUserIds?: string[];
  conversationId: string;
  internal?: boolean;
  customerId?: string;
  userId?: string;
  fromBot?: boolean;
  isCustomerRead?: boolean;
  formWidgetData?: any;
  messengerAppData?: any;
  engageData?: IEngageData;
  facebookData?: IFacebook;
  twitterData?: ITwitterResponse;
  gmailData?: IGmail;
}

export interface IMessageDocument extends IMessage, Document {
  _id: string;
  engageData?: IEngageDataDocument;
  facebookData?: IFacebookDataDocument;
  gmailData?: IGmailDataDocument;
  twitterData?: ITwitterResponseDocument;
  createdAt: Date;
}

const attachmentSchema = new Schema(
  {
    url: field({ type: String }),
    name: field({ type: String }),
    size: field({ type: Number }),
    type: field({ type: String })
  },
  { _id: false }
);

const fbUserSchema = new Schema(
  {
    id: field({ type: String, optional: true }),
    name: field({ type: String, optional: true })
  },
  { _id: false }
);

// Post or comment's reaction data
const reactionSchema = new Schema(
  {
    like: field({ type: [fbUserSchema], default: [] }),
    love: field({ type: [fbUserSchema], default: [] }),
    wow: field({ type: [fbUserSchema], default: [] }),
    haha: field({ type: [fbUserSchema], default: [] }),
    sad: field({ type: [fbUserSchema], default: [] }),
    angry: field({ type: [fbUserSchema], default: [] })
  },
  { _id: false }
);

const facebookSchema = new Schema(
  {
    postId: field({
      type: String,
      optional: true
    }),

    commentId: field({
      type: String,
      optional: true
    }),

    // parent comment id
    parentId: field({
      type: String,
      optional: true
    }),

    isPost: field({
      type: Boolean,
      optional: true
    }),

    reactions: field({ type: reactionSchema, default: {} }),

    likeCount: field({
      type: Number,
      default: 0
    }),
    commentCount: field({
      type: Number,
      default: 0
    }),

    // messenger message id
    messageId: field({
      type: String,
      optional: true
    }),

    // comment, reaction, etc ...
    item: field({
      type: String,
      optional: true
    }),

    // photo link when included photo
    photo: field({
      type: String,
      optional: true
    }),

    // video link when included video
    video: field({
      type: String,
      optional: true
    }),

    // photo links when user posted multiple photos
    photos: field({
      type: [String],
      optional: true
    }),

    link: field({
      type: String,
      optional: true
    }),

    senderId: field({
      type: String,
      optional: true
    }),

    senderName: field({
      type: String,
      optional: true
    }),

    createdTime: field({
      type: String,
      optional: true
    })
  },
  { _id: false }
);

const gmailAttachmentSchema = new Schema(
  {
    filename: field({ type: String }),
    mimeType: field({ type: String }),
    size: field({ type: Number }),
    attachmentId: field({ type: String })
  },
  { _id: false }
);

const gmailSchema = new Schema(
  {
    messageId: field({
      type: String
    }),
    threadId: field({
      type: String
    }),
    headerId: field({
      type: String
    }),
    from: field({
      type: String
    }),
    to: field({
      type: String
    }),
    cc: field({
      type: String,
      optional: true
    }),
    bcc: field({
      type: String,
      optional: true
    }),
    reply: field({
      type: String,
      optional: true
    }),
    refrences: field({
      type: String,
      optional: true
    }),
    subject: field({
      type: String
    }),
    textPlain: field({
      type: String,
      optional: true
    }),
    textHtml: field({
      type: String,
      optional: true
    }),
    attachments: field({
      type: [gmailAttachmentSchema],
      optional: true
    }),
    labelIds: field({
      type: [String],
      optional: true
    })
  },
  { _id: false }
);

const engageDataRuleSchema = new Schema(
  {
    kind: field({ type: String }),
    text: field({ type: String }),
    condition: field({ type: String }),
    value: field({ type: String, optional: true })
  },
  { _id: false }
);

const engageDataSchema = new Schema(
  {
    messageId: field({ type: String }),
    brandId: field({ type: String }),
    content: field({ type: String }),
    fromUserId: field({ type: String }),
    kind: field({ type: String }),
    sentAs: field({ type: String }),
    rules: field({ type: [engageDataRuleSchema], optional: true })
  },
  { _id: false }
);

export const messageSchema = new Schema({
  _id: field({ pkey: true }),
  content: field({ type: String }),
  attachments: [attachmentSchema],
  mentionedUserIds: field({ type: [String] }),
  conversationId: field({ type: String }),
  internal: field({ type: Boolean }),
  customerId: field({ type: String }),
  fromBot: field({ type: Boolean }),
  userId: field({ type: String }),
  createdAt: field({ type: Date }),
  isCustomerRead: field({ type: Boolean }),
  formWidgetData: field({ type: Object }),
  messengerAppData: field({ type: Object }),
  engageData: field({ type: engageDataSchema }),
  facebookData: field({ type: facebookSchema }),
  twitterData: field({ type: twitterResponseSchema }),
  gmailData: field({ type: gmailSchema })
});

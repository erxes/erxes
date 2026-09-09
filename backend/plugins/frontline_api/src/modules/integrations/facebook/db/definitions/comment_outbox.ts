import { Document, Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';

export type TCommentOutboxStatus = 'pending' | 'sent' | 'failed';

export interface IFacebookCommentOutbox {
  // Identifies the deferred action this reply belongs to.
  executionId: string;
  actionId: string;
  jobId: string;

  pageId: string;
  postId?: string;
  commentId: string;
  senderId: string;
  integrationId: string;

  text: string;
  attachments?: any[];
  mentionSender?: boolean;

  status: TCommentOutboxStatus;
  sendAfter: Date;
  sentAt?: Date;
  error?: string;
  createdAt: Date;
}

export interface IFacebookCommentOutboxDocument
  extends IFacebookCommentOutbox,
    Document {
  _id: string;
}

export const facebookCommentOutboxSchema = schemaWrapper(
  new Schema({
    executionId: { type: String, required: true, index: true },
    actionId: { type: String, required: true },
    // Unique so a retried enqueue cannot post the same reply twice.
    jobId: { type: String, required: true, unique: true },

    pageId: { type: String, required: true, index: true },
    postId: { type: String, optional: true },
    commentId: { type: String, required: true },
    senderId: { type: String, required: true },
    integrationId: { type: String, required: true },

    text: { type: String, default: '' },
    attachments: { type: [Object], default: [] },
    mentionSender: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
      index: true,
    },
    sendAfter: { type: Date, required: true },
    sentAt: { type: Date, optional: true },
    error: { type: String, optional: true },
    createdAt: { type: Date, default: Date.now },
  }),
);

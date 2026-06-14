import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const threadSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    // Stable session id (supplied by the client or generated on first message).
    threadId: {
      type: String,
      required: true,
      unique: true,
      label: 'Thread ID',
    },
    agentId: { type: String, required: true, index: true, label: 'Agent ID' },
    // Owner: the in-app user's _id, or "bot:<customerId|conversationId>" for
    // messenger-bot sessions. Every read/rename/remove is filtered by this, so
    // threads are private to their owner. Legacy ownerless threads are claimed
    // by the next owner who posts to them (see ensureThread).
    userId: { type: String, index: true, label: 'Owner user ID' },
    title: { type: String, label: 'Title' },
    titleSource: {
      type: String,
      enum: ['derived', 'generated', 'manual'],
      default: 'derived',
      label: 'Title source',
    },
    titleMessageCount: {
      type: Number,
      default: 0,
      label: 'Messages at last title generation',
    },
    messageCount: { type: Number, default: 0, label: 'Message count' },
    lastMessageAt: { type: Date, label: 'Last message at' },
    // Learning-distillation cursor: messageCount at the last sweep that
    // distilled this thread. messageCount > this ⇒ undistilled tail exists.
    distilledMessageCount: {
      type: Number,
      default: 0,
      label: 'Messages at last distillation',
    },
  },
  { timestamps: true },
);

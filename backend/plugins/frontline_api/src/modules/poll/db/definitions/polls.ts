import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const POLL_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived'],
};

const pollOptionSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    text: { type: String, required: true, label: 'Option text' },
    order: { type: Number, default: 0, label: 'Order' },
  },
  { id: false },
);

export const pollSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    title: { type: String, required: true, label: 'Title' },
    channelId: { type: String, index: true, label: 'Channel' },
    code: { type: String, unique: true, sparse: true, label: 'Code' },
    question: { type: String, required: true, label: 'Question' },
    options: { type: [pollOptionSchema], default: [], label: 'Options' },
    allowMultiselect: {
      type: Boolean,
      default: false,
      label: 'Allow multiple answers',
    },
    durationHours: { type: Number, label: 'Duration in hours' },
    status: {
      type: String,
      enum: POLL_STATUSES.ALL,
      default: POLL_STATUSES.ACTIVE,
      index: true,
      label: 'Status',
    },
    sentCount: { type: Number, default: 0, label: 'Sent count' },
    createdUserId: { type: String, label: 'Created user' },
  },
  { timestamps: true },
);

export const pollVoteSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    pollId: { type: String, required: true, index: true, label: 'Poll' },
    messageId: { type: String, required: true, index: true, label: 'Message' },
    conversationId: { type: String, required: true, label: 'Conversation' },
    voterId: { type: String, required: true, label: 'Voter' },
    customerId: { type: String, index: true, label: 'Customer' },
    visitorId: { type: String, index: true, label: 'Visitor' },
    optionIds: { type: [String], default: [], label: 'Selected options' },
  },
  { timestamps: true },
);

pollVoteSchema.index({ messageId: 1, voterId: 1 }, { unique: true });

import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const SURVEY_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived'],
};

const surveyOptionSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    text: { type: String, required: true, label: 'Option text' },
    order: { type: Number, default: 0, label: 'Order' },
    ticketCreationEnabled: {
      type: Boolean,
      default: false,
      label: 'Create a ticket when this option reaches its threshold',
    },
    ticketCreationThreshold: {
      type: Number,
      label: 'Vote count that triggers the ticket',
    },
    ticketPipelineId: {
      type: String,
      label: 'Ticket pipeline the created ticket lands in',
    },
    ticketStatusId: {
      type: String,
      label: 'Ticket status the created ticket lands in',
    },
    ticketCreated: {
      type: Boolean,
      default: false,
      label: 'Ticket already created',
    },
    ticketId: { type: String, label: 'Created ticket' },
    ticketClaimedAt: {
      type: Date,
      label: 'Ticket creation claimed at',
    },
  },
  { id: false },
);

const surveyStepSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Step name' },
    description: { type: String, label: 'Step description' },
    order: { type: Number, default: 0, label: 'Order' },
    question: { type: String, required: true, label: 'Question' },
    options: { type: [surveyOptionSchema], default: [], label: 'Options' },
    allowMultiselect: {
      type: Boolean,
      default: false,
      label: 'Allow multiple answers',
    },
  },
  { id: false },
);

export const surveySchema = new Schema(
  {
    _id: mongooseStringRandomId,
    title: { type: String, required: true, label: 'Title' },
    channelId: { type: String, index: true, label: 'Channel' },
    brandId: { type: String, index: true, label: 'Brand' },
    code: { type: String, unique: true, sparse: true, label: 'Code' },
    question: { type: String, required: true, label: 'Question' },
    options: { type: [surveyOptionSchema], default: [], label: 'Options' },
    steps: { type: [surveyStepSchema], default: [], label: 'Steps' },
    allowMultiselect: {
      type: Boolean,
      default: false,
      label: 'Allow multiple answers',
    },
    durationHours: { type: Number, label: 'Duration in hours' },
    status: {
      type: String,
      enum: SURVEY_STATUSES.ALL,
      default: SURVEY_STATUSES.ACTIVE,
      index: true,
      label: 'Status',
    },
    sentCount: { type: Number, default: 0, label: 'Sent count' },
    createdUserId: { type: String, label: 'Created user' },
  },
  { timestamps: true },
);

export const surveyVoteSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    surveyId: { type: String, required: true, index: true, label: 'Survey' },
    messageId: { type: String, required: true, index: true, label: 'Message' },
    conversationId: { type: String, required: true, label: 'Conversation' },
    voterId: { type: String, required: true, label: 'Voter' },
    cpUserId: { type: String, index: true, label: 'Client portal user' },
    customerId: { type: String, index: true, label: 'Customer' },
    visitorId: { type: String, index: true, label: 'Visitor' },
    optionIds: { type: [String], default: [], label: 'Selected options' },
  },
  { timestamps: true },
);

surveyVoteSchema.index({ messageId: 1, voterId: 1 }, { unique: true });
surveyVoteSchema.index(
  { surveyId: 1, cpUserId: 1 },
  { unique: true, partialFilterExpression: { cpUserId: { $exists: true } } },
);

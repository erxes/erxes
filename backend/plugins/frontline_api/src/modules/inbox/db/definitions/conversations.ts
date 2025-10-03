import { Schema } from 'mongoose';
import {
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_SELECT_OPTIONS,
  CONVERSATION_STATUSES,
} from './constants';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { customFieldSchema } from 'erxes-api-shared/core-modules';

// Conversation schema

export const conversationSchemaOptions = {
  operatorStatus: {
    type: 'String',
    enum: CONVERSATION_OPERATOR_STATUS.ALL,
    label: 'Operator Status',
    selectOptions: CONVERSATION_SELECT_OPTIONS.OPERATOR_STATUS,
    optional: true,
  },
  content: { type: 'String', label: 'Content', optional: true },
  integrationId: { type: 'String', index: true },
  customerId: { type: 'String', index: true },
  visitorId: {
    type: 'String',
  },
  userId: { type: 'String' },
  assignedUserId: { type: 'String' },
  participatedUserIds: { type: ['String'] },
  userRelevance: { type: 'String' },
  readUserIds: { type: ['String'] },
  createdAt: { type: 'Date', label: 'Created at' },
  updatedAt: { type: 'Date', label: 'Updated at', index: true },

  closedAt: {
    type: 'Date',
    label: 'Closed at',
    optional: true,
  },

  closedUserId: {
    type: 'String',
    optional: true,
  },

  status: {
    type: 'String',
    enum: CONVERSATION_STATUSES.ALL,
    selectOptions: CONVERSATION_SELECT_OPTIONS.STATUS,
    label: 'Status',
    index: true,
  },
  messageCount: { type: 'Number', label: 'Message count' },
  tagIds: { type: ['String'], index: true },

  // number of total conversations
  number: { type: 'Number' },

  firstRespondedUserId: { type: 'String' },
  firstRespondedDate: { type: 'Date', label: 'First responded date' },

  isCustomerRespondedLast: {
    type: 'Boolean',
    label: 'Last responder is customer',
  },
  isBot: {
    type: 'Boolean',
    label: 'isBot',
  },
  botId: {
    type: 'String',
    label: 'botId',
  },
};

export const conversationSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    customsData: {
      type: [customFieldSchema],
      optional: true,
      label: 'Custom s data',
    },
    ...conversationSchemaOptions,
  }),
  { contentType: 'frontline:inbox.conversation' },
);

conversationSchema.index(
  { visitorId: 1 },
  { partialFilterExpression: { visitorId: { $exists: true } } },
);
conversationSchema.index(
  { userId: 1 },
  { partialFilterExpression: { userId: { $exists: true } } },
);
conversationSchema.index(
  { userRelevance: 1 },
  { partialFilterExpression: { userRelevance: { $exists: true } } },
);

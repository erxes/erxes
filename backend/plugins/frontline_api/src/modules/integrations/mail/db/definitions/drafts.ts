import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { MAIL_DRAFT_STATUSES } from '@/integrations/mail/constants';

export const mailDraftSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxIntegrationId: {
    type: String,
    index: true,
    label: 'Inbox the reply is sent from',
  },
  inboxConversationId: {
    type: String,
    label: 'Inbox conversation the reply belongs to',
  },
  sourceMessageId: {
    type: String,
    label: 'Inbound mail this draft answers, one draft per mail',
  },
  customerId: String,
  to: [String],
  subject: String,
  body: String,
  replyToMessageId: {
    type: String,
    label: 'Message-ID header of the inbound mail being answered',
  },
  references: [String],
  shouldResolve: {
    type: Boolean,
    default: false,
    label: 'Close the conversation once the draft is sent',
  },
  senderMismatch: {
    type: Boolean,
    default: false,
    label: 'Whether the answered mail came from an unverified sender',
  },
  status: {
    type: String,
    enum: Object.values(MAIL_DRAFT_STATUSES),
    default: MAIL_DRAFT_STATUSES.PENDING,
  },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

mailDraftSchema.index({ inboxConversationId: 1, status: 1, createdAt: 1 });
mailDraftSchema.index(
  { sourceMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceMessageId: { $type: 'string' } },
  },
);

import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { MAIL_HEALTH_STATUSES } from '@/integrations/mail/constants';

const forwardVerificationSchema = new Schema(
  {
    from: { type: String, label: 'Address the confirmation came from' },
    subject: { type: String, label: 'Subject of the confirmation' },
    code: { type: String, label: 'Confirmation code found in the message' },
    link: { type: String, label: 'Confirmation link found in the message' },
    excerpt: { type: String, label: 'Readable start of the message body' },
    receivedAt: { type: Date, label: 'When the confirmation arrived' },
  },
  { _id: false },
);

export const mailIntegrationSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxId: {
    type: String,
    unique: true,
    sparse: true,
    label: 'Inbox integration id, set only on channel inboxes',
  },
  pipelineId: {
    type: String,
    unique: true,
    sparse: true,
    label: 'Ticket pipeline id, set only on pipeline addresses',
  },
  name: {
    type: String,
    label: 'Display name of a pipeline address',
  },
  address: {
    type: String,
    unique: true,
    label: 'Address inbound mail is routed to',
  },
  forwardFrom: { type: String, label: 'Address the tenant forwards from' },
  forwardPendingAt: {
    type: Date,
    label:
      'When forwarding setup began. While this is inside the verification window a confirmation message is held here instead of opening a ticket.',
  },
  forwardVerification: {
    type: forwardVerificationSchema,
    label: 'Confirmation message held back from the ticket path',
  },
  senderName: {
    type: String,
    label: 'Display name on replies, empty means the inbox name',
  },
  healthStatus: { type: String, default: MAIL_HEALTH_STATUSES.HEALTHY },
  error: { type: String, default: '' },
  disabledAt: {
    type: Date,
    label:
      'When the address was disconnected. Absent means connected, so rows written before this field stay connected without a backfill.',
  },
});

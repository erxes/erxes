import { Schema } from 'mongoose';
import { MAIL_SENDING_STATUSES } from '@/integrations/mail/constants';

const dnsRecordSchema = new Schema(
  {
    type: { type: String, label: 'Record type' },
    host: { type: String, label: 'Record host' },
    data: { type: String, label: 'Record value' },
    valid: { type: Boolean, default: false, label: 'Seen by the provider' },
  },
  { _id: false },
);

export const mailSendingAccountSchema = new Schema({
  name: { type: String, required: true, label: 'Shown when picking a sender' },
  provider: { type: String, required: true, label: 'SES or sendgrid' },
  domain: { type: String, required: true, label: 'Domain replies are sent as' },
  config: {
    type: Object,
    required: true,
    label: 'Provider credentials — never returned over GraphQL',
  },
  platformManaged: {
    type: Boolean,
    default: false,
    label: 'Sends through the deployment account, not workspace credentials',
  },
  verifyToken: {
    type: String,
    label: 'Proves this workspace controls the domain, not just the provider',
  },
  senderId: { type: String, label: "The provider's own domain id" },
  status: { type: String, default: MAIL_SENDING_STATUSES.PENDING },
  dnsRecords: { type: [dnsRecordSchema], default: undefined },
  error: { type: String, label: 'Why the last verification failed' },
  verifiedAt: { type: Date, label: 'When the provider confirmed the domain' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

mailSendingAccountSchema.index({ domain: 1 });

import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { MAIL_CLOUDFLARE_STATUSES } from '@/integrations/mail/constants';

const provisionStepSchema = new Schema(
  {
    name: { type: String, label: 'Provisioning step' },
    state: { type: String, label: 'pending, ok or failed' },
    error: { type: String, label: 'Why the step failed' },
    ranAt: { type: Date, label: 'When the step last ran' },
  },
  { _id: false },
);

export const mailCloudflareSchema = new Schema({
  _id: mongooseStringRandomId,
  accountId: { type: String, label: 'Cloudflare account the worker lives on' },
  accountName: { type: String, label: 'Account name, shown in settings' },
  zoneId: { type: String, label: 'Zone that receives the mail' },
  zoneName: { type: String, label: 'Mail domain' },
  tenant: { type: String, label: 'Tenant both sides derive the key from' },
  workerName: { type: String, label: 'Worker script name' },
  workerOrigin: { type: String, label: 'Public origin of the worker' },
  bucketName: { type: String, label: 'R2 bucket holding mail in flight' },
  queueName: { type: String, label: 'Inbound queue' },
  dlqName: { type: String, label: 'Dead-letter queue' },
  apiToken: { type: String, label: 'Cloudflare API token' },
  webhookSecret: { type: String, label: 'Master the worker signs with' },
  sendingEnabled: {
    type: Boolean,
    default: false,
    label: 'Replies leave through this account',
  },
  sendingTag: { type: String, label: 'Email Sending onboarding tag' },
  scriptVersion: { type: String, label: 'Worker bundle version deployed' },
  status: { type: String, default: MAIL_CLOUDFLARE_STATUSES.PENDING },
  steps: { type: [provisionStepSchema], default: undefined },
  error: { type: String, default: '' },
  connectedAt: { type: Date, label: 'When provisioning last completed' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

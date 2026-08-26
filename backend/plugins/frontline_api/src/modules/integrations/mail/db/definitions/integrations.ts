import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { MAIL_HEALTH_STATUSES } from '@/integrations/mail/constants';

export const mailIntegrationSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxId: { type: String, unique: true, label: 'Inbox integration id' },
  address: {
    type: String,
    unique: true,
    label: 'Address inbound mail is routed to',
  },
  forwardFrom: { type: String, label: 'Address the tenant forwards from' },
  sendingAccountId: {
    type: String,
    label: 'Sending account replies leave through — empty means Cloudflare',
  },
  sendingAddress: {
    type: String,
    label: 'From address on that account, empty means the inbox address',
  },
  healthStatus: { type: String, default: MAIL_HEALTH_STATUSES.HEALTHY },
  error: { type: String, default: '' },
});

import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { VIBER_HEALTH_STATUSES } from '@/integrations/viber/constants';

export const viberIntegrationSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxId: { type: String, required: true, unique: true },
  botId: { type: String, required: true, unique: true },
  token: { type: String, required: true, select: false },
  healthStatus: {
    type: String,
    enum: Object.values(VIBER_HEALTH_STATUSES),
    default: VIBER_HEALTH_STATUSES.PENDING,
    required: true,
  },
  error: { type: String, default: '' },
});

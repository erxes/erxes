import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { WHATSAPP_PENDING_CONNECTION_TTL_SECONDS } from '@/integrations/whatsapp/constants';

export const whatsappIntegrationSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    erxesApiId: {
      type: String,
      label: 'Inbox integration id',
      unique: true,
      sparse: true,
    },
    businessId: { type: String, label: 'Meta business portfolio id' },
    wabaId: {
      type: String,
      required: true,
      index: true,
      label: 'WhatsApp Business Account id',
    },
    phoneNumberId: {
      type: String,
      required: true,
      unique: true,
      label: 'WhatsApp phone number id',
    },
    displayPhoneNumber: { type: String, required: true },
    verifiedName: { type: String },
    phoneStatus: { type: String },
    accessToken: {
      type: String,
      required: true,
      select: false,
      label: 'Business integration system user token',
    },
    healthStatus: {
      type: String,
      enum: ['healthy', 'unhealthy'],
      default: 'healthy',
    },
    error: { type: String },
    connectedBy: { type: String, required: true },
    pendingSince: {
      type: Date,
      label: 'Set while the connection waits to be attached to an inbox',
    },
  },
  { timestamps: true },
);

// Unattached signups hold an access token; drop them once abandoned.
whatsappIntegrationSchema.index(
  { pendingSince: 1 },
  { expireAfterSeconds: WHATSAPP_PENDING_CONNECTION_TTL_SECONDS },
);

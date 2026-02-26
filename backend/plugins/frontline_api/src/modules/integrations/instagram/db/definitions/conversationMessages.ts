import { Schema } from 'mongoose';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { schemaWrapper } from 'erxes-api-shared/utils';

export const conversationMessageSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    mid: { type: String, label: 'Instagram message id' },
    content: { type: String },
    attachments: [attachmentSchema],
    conversationId: { type: String, index: true },
    customerId: { type: String, index: true },
    visitorId: {
      type: String,
      index: true,
      label: 'unique visitor id on logger database',
    },
    fromBot: { type: Boolean },
    userId: { type: String, index: true },
    createdAt: { type: Date, index: true, label: 'Created At' },
    updatedAt: { type: Date, index: true, label: 'Updated At' },
    isCustomerRead: { type: Boolean, label: 'Is Customer Read' },
    internal: { type: Boolean, label: 'Internal' },
    botId: { type: String, label: 'Bot', optional: true },
    botData: { type: Object, optional: true },
  }),
);

conversationMessageSchema.index({ conversationId: 1, createdAt: -1 });
conversationMessageSchema.index({ customerId: 1, createdAt: -1 });

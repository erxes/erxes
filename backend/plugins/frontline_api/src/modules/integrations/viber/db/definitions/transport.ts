import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

const sendStates = ['pending', 'sending', 'sent', 'rejected', 'unknown'];
const partSchema = new Schema(
  {
    body: {
      type: new Schema(
        {
          type: {
            type: String,
            enum: [
              'text',
              'picture',
              'video',
              'file',
              'url',
              'location',
              'contact',
              'sticker',
            ],
            required: true,
          },
          text: String,
          media: String,
          size: Number,
          file_name: String,
          sticker_id: String,
          location: {
            type: new Schema({ lat: Number, lon: Number }, { _id: false }),
          },
          contact: {
            type: new Schema(
              { name: String, phone_number: String },
              { _id: false },
            ),
          },
        },
        { _id: false },
      ),
      required: true,
    },
    attachment: {
      type: new Schema(
        { name: String, url: String, size: Number, type: String },
        { _id: false },
      ),
    },
    state: { type: String, enum: sendStates, required: true },
    messageToken: String,
    error: String,
  },
  { _id: false },
);

export const viberOutboxSchema = new Schema({
  // Same id as the native message: retries never create another inbox message.
  _id: { type: String, required: true },
  inboxId: { type: String, required: true },
  conversationId: { type: String, required: true },
  userId: { type: String, required: true },
  agentId: { type: String, required: true },
  state: { type: String, enum: sendStates, required: true },
  parts: { type: [partSchema], required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});
viberOutboxSchema.index({ inboxId: 1, userId: 1, 'parts.messageToken': 1 });
viberOutboxSchema.index({ conversationId: 1, createdAt: -1 });

export const viberSubscriptionSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxId: { type: String, required: true },
  userId: { type: String, required: true },
  subscribed: { type: Boolean, required: true },
  timestamp: { type: Number, required: true },
});
viberSubscriptionSchema.index({ inboxId: 1, userId: 1 }, { unique: true });

export const viberReceiptSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxId: { type: String, required: true },
  userId: { type: String, required: true },
  messageToken: { type: String, required: true },
  deliveredAt: Date,
  seenAt: Date,
  failedAt: Date,
  createdAt: { type: Date, default: Date.now, required: true },
});
viberReceiptSchema.index(
  { inboxId: 1, userId: 1, messageToken: 1 },
  { unique: true },
);

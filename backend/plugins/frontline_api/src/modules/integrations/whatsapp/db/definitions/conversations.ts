import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

/**
 * One thread between a WhatsApp user and a connected business number.
 *
 * `lastCustomerMessageAt` drives the Cloud API's 24-hour customer service
 * window: outside it Meta rejects free-form sends with error 131047 and only a
 * pre-approved template may be sent. Storing it lets the UI warn an agent
 * before they type a reply that cannot be delivered.
 */
export const conversationSchema = new Schema({
  _id: mongooseStringRandomId,
  erxesApiId: String,
  timestamp: Date,
  // The WhatsApp user (wa_id).
  senderId: { type: String, index: true },
  // The business phone number id that received the message.
  recipientId: { type: String, index: true },
  integrationId: String,
  content: String,
  lastCustomerMessageAt: {
    type: Date,
    label: 'When the customer last messaged us — opens the 24h reply window',
    optional: true,
  },
});

// One thread per (user, business number) pair. Mirrors the facebook module and
// makes concurrent inbound webhooks safe: the second insert fails rather than
// creating a duplicate thread.
conversationSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });

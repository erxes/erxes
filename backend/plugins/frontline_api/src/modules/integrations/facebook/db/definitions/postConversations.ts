import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
export const postConversationSchema = new Schema({
  _id: mongooseStringRandomId,
  erxesApiId: String,
  postId: { type: String, index: true },
  timestamp: Date,
  senderId: String,
  recipientId: String,
  integrationId: String,
  content: String,
  customerId: { type: String, optional: true },
  permalink_url: String,
  attachments: [String],
});

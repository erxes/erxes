import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const messageSchema = new Schema({
  _id: mongooseStringRandomId,
  threadId: { type: String, required: true, index: true, label: 'Thread ID' },
  role: { type: String, required: true, enum: ['user', 'assistant'], label: 'Role' },
  content: { type: String, default: '', label: 'Content' },
  createdAt: { type: Date, default: Date.now, label: 'Created at' },
});

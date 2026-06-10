import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const threadSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    // Stable session id (supplied by the client or generated on first message).
    threadId: { type: String, required: true, unique: true, label: 'Thread ID' },
    agentId: { type: String, required: true, index: true, label: 'Agent ID' },
    title: { type: String, label: 'Title' },
    messageCount: { type: Number, default: 0, label: 'Message count' },
    lastMessageAt: { type: Date, label: 'Last message at' },
  },
  { timestamps: true },
);

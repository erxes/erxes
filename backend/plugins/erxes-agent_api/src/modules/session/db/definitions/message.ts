import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const messageSchema = new Schema({
  _id: mongooseStringRandomId,
  threadId: { type: String, required: true, index: true, label: 'Thread ID' },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant'],
    label: 'Role',
  },
  content: { type: String, default: '', label: 'Content' },
  // Turn artifacts beyond the reply text: model reasoning ("thinking"), the
  // tool calls the turn executed (with args/results for the expandable UI),
  // and whether the user interrupted generation. Absent on user messages.
  meta: { type: Schema.Types.Mixed, label: 'Turn metadata' },
  // Files attached to a user message: url is a storage key or public URL.
  attachments: {
    type: [
      new Schema(
        {
          url: { type: String, required: true },
          name: { type: String, required: true },
          type: { type: String },
          size: { type: Number },
        },
        { _id: false },
      ),
    ],
    default: undefined,
    label: 'Attachments',
  },
  createdAt: { type: Date, default: Date.now, label: 'Created at' },
});

import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const feedbackSchema = new Schema({
  _id: mongooseStringRandomId,
  threadId: { type: String, required: true, index: true, label: 'Thread ID' },
  messageId: { type: String, required: true, index: true, label: 'Message ID' },
  userId: { type: String, required: true, label: 'User ID' },
  rating: { type: Number, required: true, enum: [1, -1], label: 'Rating' },
  comment: { type: String, label: 'Comment' },
  // Snapshot of the learnings injected into the rated turn, copied from the
  // message's meta at feedback time — lets reinforcement attribute the rating.
  learningIdsInContext: {
    type: [String],
    default: [],
    label: 'Learnings in context',
  },
  createdAt: { type: Date, default: Date.now, label: 'Created at' },
});

// One vote per user per message; re-voting updates in place.
feedbackSchema.index({ messageId: 1, userId: 1 }, { unique: true });

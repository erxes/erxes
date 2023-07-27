import { Schema } from 'mongoose';
import { field } from './utils';

export const topicSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  noteId: field({ type: String }),
  meetingId: field({ type: String }),
  description: field({ type: String }),
  ownerId: field({ type: String })
});

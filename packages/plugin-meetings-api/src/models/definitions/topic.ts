import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface ITopic {
  _id: string;
  title: string;
  description: string;
  ownerId: string;
  meetingId: string;
}
export interface ITopicDocument extends ITopic, Document {
  _id: string;
}

export const topicSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  noteId: field({ type: String }),
  meetingId: field({ type: String }),
  description: field({ type: String }),
  ownerId: field({ type: String })
});

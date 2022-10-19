import { Model, Schema } from 'mongoose';

import { IConversationMessageDocument } from './definitions/conversationMessages';
import { field } from './definitions/utils';

export interface IConversationMessageModel
  extends Model<IConversationMessageDocument> {}

export const conversationMessageSchema = new Schema({
  _id: field({ pkey: true }),
  mid: { type: String, unique: true },
  conversationId: String,
  content: String
});

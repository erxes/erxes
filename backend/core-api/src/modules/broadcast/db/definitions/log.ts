import { Schema } from 'mongoose';
import { LOG_MESSAGE_TYPES } from '../../constants';

export const logSchema = new Schema({
  createdAt: { type: Date, default: new Date(), label: 'Created at' },
  engageMessageId: { type: String, label: 'Engage message id', index: true },
  message: { type: String, label: 'Message' },
  type: { type: String, label: 'Message type', enum: LOG_MESSAGE_TYPES },
});

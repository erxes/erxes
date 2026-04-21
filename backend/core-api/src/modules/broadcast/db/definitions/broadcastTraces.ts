import { Schema } from 'mongoose';
import { BROADCAST_TRACE_TYPES } from '../../constants';

export const broadcastTraceSchema = new Schema({
  createdAt: { type: Date, default: new Date(), label: 'Created at' },
  engageMessageId: { type: String, label: 'Engage message id', index: true },
  message: { type: String, label: 'Message' },
  type: { type: String, label: 'Trace type', enum: BROADCAST_TRACE_TYPES },
});

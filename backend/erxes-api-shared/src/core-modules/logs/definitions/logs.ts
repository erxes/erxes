import { Schema } from 'mongoose';

export const logsSchema = new Schema({
  source: { type: String, label: 'Source' },
  status: { type: String, enum: ['success', 'failed'], required: true },
  createdAt: { type: Date, label: 'Created At', default: new Date() },
  userId: { type: String, label: 'User Id' },
  docId: { type: String, optional: true },
  payload: { type: Schema.Types.Mixed },
  action: { type: String, label: 'action', optional: true },
  processId: { type: String, label: 'Process', optional: true },
  contentType: { type: String, label: 'Content Type', optional: true },
}).index({
  createdAt: -1,
  status: 1,
  userId: 1,
  action: 'text',
  source: 'text',
  docId: 1,
  processId: 1,
  contentType: 1,
  payload: 1,
});

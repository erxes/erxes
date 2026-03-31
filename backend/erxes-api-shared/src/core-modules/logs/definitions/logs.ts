import { Schema } from 'mongoose';
const LOG_RETENTION_SECONDS = 365 * 24 * 60 * 60; // 1 year in seconds

export const logsSchema = new Schema(
  {
    source: { type: String, label: 'Source' },
    status: { type: String, enum: ['success', 'failed'], required: true },
    createdAt: { type: Date, label: 'Created At', default: Date.now },
    userId: { type: String, label: 'User Id' },
    docId: { type: String, optional: true },
    payload: { type: Schema.Types.Mixed },
    action: { type: String, label: 'action', optional: true },
    processId: { type: String, label: 'Process', optional: true },
    contentType: { type: String, label: 'Content Type', optional: true },
  },
  {
    minimize: true,
  },
);

logsSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: LOG_RETENTION_SECONDS },
);

logsSchema.index(
  { docId: 1, createdAt: -1 },
  { partialFilterExpression: { docId: { $exists: true } } },
);

logsSchema.index(
  { contentType: 1, createdAt: -1 },
  { partialFilterExpression: { contentType: { $exists: true } } },
);

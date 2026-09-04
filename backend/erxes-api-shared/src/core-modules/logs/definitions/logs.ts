import { Schema } from 'mongoose';
const LOG_RETENTION_SECONDS =
  Number(process.env.LOG_RETENTION_DAYS || '365') * 24 * 60 * 60;

export const logsSchema = new Schema(
  {
    source: { type: String, label: 'Source' },
    status: { type: String, enum: ['success', 'failed'], required: true },
    createdAt: {
      type: Date,
      label: 'Created At',
      default: Date.now,
      required: true,
    },
    userId: { type: String, label: 'User Id' },
    docId: { type: String },
    payload: { type: Schema.Types.Mixed },
    action: { type: String, label: 'action' },
    processId: { type: String, label: 'Process' },
    contentType: { type: String, label: 'Content Type' },
  },
  {
    minimize: true,
  },
);

logsSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: LOG_RETENTION_SECONDS },
);

// Match the default logsMainList cursor order for index-only pagination.
logsSchema.index({ createdAt: -1, _id: 1 });

logsSchema.index(
  { docId: 1, createdAt: -1 },
  { partialFilterExpression: { docId: { $exists: true } } },
);

logsSchema.index(
  { contentType: 1, createdAt: -1 },
  { partialFilterExpression: { contentType: { $exists: true } } },
);

// One request's cascade of changes shares a processId.
logsSchema.index(
  { processId: 1, createdAt: -1 },
  { partialFilterExpression: { processId: { $exists: true } } },
);

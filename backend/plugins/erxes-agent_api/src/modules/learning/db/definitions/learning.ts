import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const learningSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    statement: { type: String, required: true, label: 'Statement' },
    type: {
      type: String,
      required: true,
      enum: ['faq', 'procedure', 'pitfall', 'product-fact', 'preference'],
      index: true,
      label: 'Learning type',
    },
    contextTags: { type: [String], default: [], label: 'Context tags' },
    // Empty = tenant-wide (every agent retrieves it).
    agentId: { type: String, index: true, label: 'Agent ID' },
    status: {
      type: String,
      required: true,
      enum: ['candidate', 'approved', 'rejected', 'conflict', 'archived'],
      default: 'candidate',
      index: true,
      label: 'Status',
    },
    confidence: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
      label: 'Confidence',
    },
    evidenceCount: { type: Number, default: 1, label: 'Evidence count' },
    // HMAC-hashed contributor resource ids — never raw identities. Drives the
    // k-anonymity auto-promotion floor and GDPR erasure propagation.
    sourceHashes: { type: [String], default: [], label: 'Source hashes' },
    pinned: { type: Boolean, default: false, label: 'Pinned to digest' },
    createdBy: { type: String, label: 'Created by' },
    reviewedByUserId: { type: String, label: 'Reviewed by' },
    lastReinforcedAt: { type: Date, label: 'Last reinforced at' },
  },
  { timestamps: true },
);

learningSchema.index({ status: 1, agentId: 1 });
